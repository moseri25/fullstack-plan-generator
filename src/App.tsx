import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Sparkles, Download, Save, LogOut, Code2, Layers, 
  Terminal, Database, LayoutTemplate, Server, Smartphone, MonitorPlay,
  CheckCircle2, AlertCircle, FileArchive, FileDown, Settings2, Wand2, RotateCcw,
  Trash2
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';
import { 
  collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, 
  deleteDoc, doc, getDocs, writeBatch 
} from 'firebase/firestore';
import { db, auth, signInWithGoogle, logOut, handleFirestoreError, OperationType } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateSkills, refineSkill } from './services/geminiService';
import { Skill, Project } from './types';

function MainApp() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Advanced Options State
  const [audience, setAudience] = useState('Intermediate');
  const [tone, setTone] = useState('Professional');
  const [numSkills, setNumSkills] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Refinement State
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeResultView, setActiveResultView] = useState<'skills' | 'detailedPrompt' | 'systemOptimization' | 'skillChain' | 'masterSkill'>('skills');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  
  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setSavedProjects(projectsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setIsGenerating(true);
    setCurrentProject(null);
    setSelectedSkill(null);
    setSaveSuccess(false);

    try {
      const result = await generateSkills({
        prompt,
        audience,
        tone,
        numSkills
      });
      setCurrentProject({
        userId: user.uid,
        prompt: prompt,
        audience,
        tone,
        numSkills,
        title: result.title,
        detailedPrompt: result.detailedPrompt,
        systemOptimization: result.systemOptimization,
        skillChainOptimization: result.skillChainOptimization,
        masterSkill: result.masterSkill,
        createdAt: new Date(),
        skills: result.skills
      });
      if (result.skills.length > 0) {
        setSelectedSkill(result.skills[0]);
      }
      setActiveResultView('skills');
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate skills. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!selectedSkill || !currentProject || !refinementPrompt.trim()) return;
    
    setIsRefining(true);
    try {
      const refinedSkill = await refineSkill(selectedSkill, currentProject.prompt, refinementPrompt);
      
      // Update current project and selected skill
      const updatedSkills = currentProject.skills.map(s => 
        s.id === refinedSkill.id ? refinedSkill : s
      );
      
      setCurrentProject({
        ...currentProject,
        skills: updatedSkills
      });
      setSelectedSkill(refinedSkill);
      setRefinementPrompt('');
    } catch (error) {
      console.error("Refinement failed:", error);
      alert("Failed to refine skill. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setAudience('Intermediate');
    setTone('Professional');
    setNumSkills(5);
    setCurrentProject(null);
    setSelectedSkill(null);
    setRefinementPrompt('');
    setShowAdvanced(false);
  };

  const saveProjectToFirebase = async () => {
    if (!currentProject || !user || !customTitle.trim()) return;
    setIsSaving(true);
    try {
      const projectData = {
        ...currentProject,
        title: customTitle.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'projects'), projectData);
      setSaveSuccess(true);
      setIsSaveModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!projectToDelete?.id || !user) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectToDelete.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteAllProjects = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'projects');
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
  };

  const downloadSkillAsZip = async (skill: Skill) => {
    const zip = new JSZip();
    const skillFolderName = skill.title.replace(/[^a-z0-9\u0590-\u05fe]/gi, '_').toLowerCase() || 'skill';
    zip.file(`${skillFolderName}/SKILL.md`, skill.content);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${skillFolderName}.zip`);
  };

  const downloadAllAsZip = async (project: Project) => {
    const zip = new JSZip();
    
    // Add a master README
    let readmeContent = `# ${project.title}\n\n## Original Prompt\n> ${project.prompt}\n\n## Project Overview\n`;
    
    if (project.detailedPrompt) {
      zip.file('DETAILED_PROMPT.md', project.detailedPrompt);
      readmeContent += `- [Detailed Full-Stack Prompt](./DETAILED_PROMPT.md)\n`;
    }
    if (project.systemOptimization) {
      zip.file('SYSTEM_OPTIMIZATION.md', project.systemOptimization);
      readmeContent += `- [System Optimization](./SYSTEM_OPTIMIZATION.md)\n`;
    }
    if (project.skillChainOptimization) {
      zip.file('SKILL_CHAIN_OPTIMIZATION.md', project.skillChainOptimization);
      readmeContent += `- [Skill Chain Optimization](./SKILL_CHAIN_OPTIMIZATION.md)\n`;
    }
    if (project.masterSkill) {
      zip.file('MASTER_SKILL.md', project.masterSkill);
      readmeContent += `- [Master Skill Orchestrator](./MASTER_SKILL.md)\n`;
    }

    readmeContent += `\n## Skills Breakdown\n`;
    project.skills.forEach((skill, index) => {
      const skillFolderName = skill.title.replace(/[^a-z0-9\u0590-\u05fe]/gi, '_').toLowerCase() || `skill_${index + 1}`;
      readmeContent += `${index + 1}. [${skill.title}](./skills/${skillFolderName}/SKILL.md)\n`;
      zip.file(`skills/${skillFolderName}/SKILL.md`, skill.content);
    });
    
    zip.file('README.md', readmeContent);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full_package.zip`);
  };

  const getIconForSkill = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('front') || t.includes('ui') || t.includes('ux')) return <LayoutTemplate className="w-5 h-5" />;
    if (t.includes('back') || t.includes('api') || t.includes('server')) return <Server className="w-5 h-5" />;
    if (t.includes('data') || t.includes('db') || t.includes('sql')) return <Database className="w-5 h-5" />;
    if (t.includes('arch') || t.includes('system')) return <Layers className="w-5 h-5" />;
    if (t.includes('deploy') || t.includes('devops') || t.includes('ci/cd')) return <Terminal className="w-5 h-5" />;
    if (t.includes('mobile') || t.includes('app')) return <Smartphone className="w-5 h-5" />;
    if (t.includes('game') || t.includes('engine')) return <MonitorPlay className="w-5 h-5" />;
    return <Code2 className="w-5 h-5" />;
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Full-Stack Skill Builder</h1>
          <p className="text-zinc-600 mb-8">
            Generate comprehensive, step-by-step development plans and prompts for any software project.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 hidden sm:block font-display tracking-tight">Skill Architect</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100/80 backdrop-blur-sm p-1 rounded-xl border border-zinc-200/50">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'generate' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'saved' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Library ({savedProjects.length})
              </button>
            </div>
            
            <div className="h-6 w-px bg-zinc-200 hidden sm:block"></div>
            
            <button
              onClick={logOut}
              className="text-zinc-500 hover:text-zinc-900 transition-colors p-2 rounded-full hover:bg-zinc-100"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {activeTab === 'generate' && (
          <div className="flex flex-col h-full gap-6">
            {/* Prompt Input */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">Project Specification</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all duration-200 bg-zinc-50 hover:bg-white border border-zinc-200/50 px-4 py-2 rounded-xl"
                >
                  <Settings2 className="w-4 h-4" />
                  {showAdvanced ? 'Hide Configuration' : 'Advanced Configuration'}
                </button>
              </div>
              <p className="text-zinc-500 text-lg mb-6">
                Define your vision. We will architect a professional-grade roadmap with elite technical specifications.
              </p>
              
              <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    dir={/[\u0590-\u05FF]/.test(prompt) ? 'rtl' : 'ltr'}
                    placeholder="e.g., A high-frequency trading dashboard with real-time WebSockets, distributed cache, and sub-100ms latency..."
                    className="w-full h-40 p-5 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none resize-none transition-all text-lg leading-relaxed group-hover:bg-white"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-mono text-zinc-400">
                    {prompt.length} characters
                  </div>
                </div>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 pb-4 border-t border-zinc-100">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <MonitorPlay className="w-3.5 h-3.5" />
                            Target Audience
                          </label>
                          <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            disabled={isGenerating}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Kids">Kids</option>
                            <option value="Executives">Executives</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            Voice & Tone
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            disabled={isGenerating}
                          >
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual</option>
                            <option value="Humorous">Humorous</option>
                            <option value="Academic">Academic</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <Layers className="w-3.5 h-3.5" />
                            Number of Skills
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="3"
                              max="50"
                              value={numSkills}
                              onChange={(e) => setNumSkills(parseInt(e.target.value) || 5)}
                              className="flex-1 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              disabled={isGenerating}
                            />
                            <span className="text-sm font-bold text-zinc-700 w-8">{numSkills}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-3">
                  {(prompt || currentProject) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isGenerating}
                      className="flex items-center gap-2 bg-zinc-100 text-zinc-700 px-4 py-2.5 rounded-xl font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start Over
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Skills
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-200/60 shadow-sm"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 font-display mb-2">Architecting Your Vision</h3>
                  <p className="text-zinc-500 max-w-md text-center px-6">
                    Our Principal Architects are crafting an elite technical specification and execution roadmap for your project.
                  </p>
                  <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              ) : currentProject && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]"
                >
                  {/* Sidebar: Skill List */}
                  <div className="w-full lg:w-96 flex flex-col gap-4">
                    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-5 flex flex-col h-full">
                      <div className="mb-6 pb-6 border-b border-zinc-100">
                        <h3 className="text-xl font-bold text-zinc-900 font-display tracking-tight leading-tight mb-4">{currentProject.title}</h3>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setCustomTitle(currentProject.title);
                              setIsSaveModalOpen(true);
                            }}
                            disabled={isSaving || saveSuccess}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                              saveSuccess 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saveSuccess ? 'Saved' : 'Save'}
                          </button>
                          <button
                            onClick={() => downloadAllAsZip(currentProject)}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all duration-200 shadow-lg shadow-zinc-900/10"
                          >
                            <FileArchive className="w-4 h-4" />
                            Download ZIP
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        <div className="mb-6 space-y-1.5">
                          <button
                            onClick={() => setActiveResultView('skills')}
                            className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeResultView === 'skills' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4" />
                              Architectural Phases
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveResultView('detailedPrompt')}
                            className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeResultView === 'detailedPrompt' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Terminal className="w-4 h-4" />
                              Full-Stack Blueprint
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveResultView('systemOptimization')}
                            className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeResultView === 'systemOptimization' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Settings2 className="w-4 h-4" />
                              Performance Strategy
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveResultView('skillChain')}
                            className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeResultView === 'skillChain' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Code2 className="w-4 h-4" />
                              Execution Roadmap
                            </div>
                          </button>
                          <button
                            onClick={() => setActiveResultView('masterSkill')}
                            className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeResultView === 'masterSkill' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Wand2 className="w-4 h-4" />
                              Master Skill
                            </div>
                          </button>
                        </div>

                        {activeResultView === 'skills' && currentProject.skills.map((skill, index) => (
                          <button
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill)}
                            className={`w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all duration-200 border ${
                              selectedSkill?.id === skill.id 
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                                : 'hover:bg-zinc-50 border-transparent'
                            }`}
                          >
                            <div className={`mt-0.5 p-2 rounded-xl transition-colors ${
                              selectedSkill?.id === skill.id ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-400'
                            }`}>
                              {getIconForSkill(skill.title)}
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">Phase {index + 1}</div>
                              <div className={`text-sm font-bold leading-snug line-clamp-2 ${
                                selectedSkill?.id === skill.id ? 'text-indigo-950' : 'text-zinc-700'
                              }`}>
                                {skill.title}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content: Skill Details */}
                  <div className="flex-1 bg-white rounded-3xl shadow-sm border border-zinc-200/60 flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeResultView === 'skills' ? (
                        <motion.div 
                          key="skills-view"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col h-full"
                        >
                          {selectedSkill ? (
                            <>
                              <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 text-indigo-600">
                                    {getIconForSkill(selectedSkill.title)}
                                  </div>
                                  <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">{selectedSkill.title}</h2>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Technical Specification</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadSkillAsZip(selectedSkill)}
                                  className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 py-2.5 px-5 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 shadow-sm"
                                >
                                  <FileArchive className="w-4 h-4" />
                                  <span className="hidden sm:inline">Download ZIP</span>
                                </button>
                              </div>
                              
                              <div className="p-8 sm:p-10 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                                <ReactMarkdown>{selectedSkill.content}</ReactMarkdown>
                              </div>

                              {/* Refinement Area */}
                              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                                <div className="flex gap-3">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={refinementPrompt}
                                      onChange={(e) => setRefinementPrompt(e.target.value)}
                                      dir={/[\u0590-\u05FF]/.test(refinementPrompt) ? 'rtl' : 'ltr'}
                                      placeholder="Request architectural refinement (e.g., 'Add a security layer', 'Optimize for scale')..."
                                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                      disabled={isRefining}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && refinementPrompt.trim() && !isRefining) {
                                          handleRefine();
                                        }
                                      }}
                                    />
                                    {isRefining && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleRefine}
                                    disabled={!refinementPrompt.trim() || isRefining}
                                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-zinc-900/10"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                    Refine
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                              <Code2 className="w-12 h-12 mb-4 opacity-20" />
                              <p className="font-medium">Select an architectural phase to view technical details.</p>
                            </div>
                          )}
                        </motion.div>
                      ) : activeResultView === 'detailedPrompt' ? (
                        <motion.div 
                          key="detailed-prompt-view"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col h-full"
                        >
                          <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 text-indigo-600">
                                <Terminal className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">Full-Stack Blueprint</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Master Implementation Prompt</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.detailedPrompt || '', 'detailed_prompt.md')}
                              className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 py-2.5 px-5 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 shadow-sm"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Download .md</span>
                            </button>
                          </div>
                          <div className="p-8 sm:p-10 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.detailedPrompt || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'systemOptimization' ? (
                        <motion.div 
                          key="system-optimization-view"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col h-full"
                        >
                          <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 text-indigo-600">
                                <Settings2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">Performance Strategy</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Optimization & Scaling</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.systemOptimization || '', 'system_optimization.md')}
                              className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 py-2.5 px-5 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 shadow-sm"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Download .md</span>
                            </button>
                          </div>
                          <div className="p-8 sm:p-10 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.systemOptimization || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'skillChain' ? (
                        <motion.div 
                          key="skill-chain-view"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col h-full"
                        >
                          <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 text-indigo-600">
                                <Code2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">Execution Roadmap</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Skill Chain Logic</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.skillChainOptimization || '', 'skill_chain_logic.md')}
                              className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 py-2.5 px-5 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 shadow-sm"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Download .md</span>
                            </button>
                          </div>
                          <div className="p-8 sm:p-10 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.skillChainOptimization || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="master-skill-view"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col h-full"
                        >
                          <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 text-indigo-600">
                                <Wand2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-zinc-900 font-display tracking-tight">Master Skill</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Ultimate Orchestrator</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.masterSkill || '', 'master_skill.md')}
                              className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 py-2.5 px-5 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 shadow-sm"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Download .md</span>
                            </button>
                          </div>
                          <div className="p-8 sm:p-10 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.masterSkill || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Your Saved Projects</h2>
              {savedProjects.length > 0 && (
                <button
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedProjects.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-400 bg-white rounded-3xl border border-zinc-200/60 shadow-sm">
                  <div className="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                    <FileArchive className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 font-display mb-2">No archived projects</h3>
                  <p className="max-w-xs text-center">Your architectural specifications will appear here once archived.</p>
                </div>
              ) : (
                savedProjects.map((project) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-6 flex flex-col hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => {
                      setCurrentProject(project);
                      if (project.skills.length > 0) setSelectedSkill(project.skills[0]);
                      setActiveTab('generate');
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {project.skills.length} Phases
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-900 mb-3 line-clamp-2 font-display group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {project.prompt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAllAsZip(project);
                        }}
                        className="text-zinc-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                        title="Download ZIP"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Save Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-zinc-900 mb-4">Save Project</h3>
              <p className="text-zinc-600 text-sm mb-4">
                Enter a name for your project to save it to your library.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProjectToFirebase}
                    disabled={!customTitle.trim() || isSaving}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Project?</h3>
              <p className="text-zinc-600 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-zinc-900">"{projectToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProject}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete All Projects?</h3>
              <p className="text-zinc-600 text-sm mb-6">
                Are you sure you want to delete all <span className="font-semibold text-zinc-900">{savedProjects.length}</span> saved projects? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllProjects}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

