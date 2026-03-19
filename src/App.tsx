import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Sparkles, Download, Save, LogOut, Code2, Layers, 
  Terminal, Database, LayoutTemplate, Server, Smartphone, MonitorPlay,
  CheckCircle2, AlertCircle, FileArchive, FileDown, Settings2, Wand2, RotateCcw
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        createdAt: new Date(),
        skills: result.skills
      });
      if (result.skills.length > 0) {
        setSelectedSkill(result.skills[0]);
      }
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
    if (!currentProject || !user) return;
    setIsSaving(true);
    try {
      const projectData = {
        ...currentProject,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'projects'), projectData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadSkill = (skill: Skill) => {
    const blob = new Blob([skill.content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${skill.id}.md`);
  };

  const downloadAllAsZip = async (project: Project) => {
    const zip = new JSZip();
    
    // Add a master README
    let readmeContent = `# ${project.title}\n\n## Original Prompt\n> ${project.prompt}\n\n## Skills Breakdown\n`;
    project.skills.forEach((skill, index) => {
      readmeContent += `${index + 1}. [${skill.title}](./${skill.id}.md)\n`;
      zip.file(`${skill.id}.md`, skill.content);
    });
    
    zip.file('README.md', readmeContent);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_skills.zip`);
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
            <h1 className="text-xl font-bold text-zinc-900 hidden sm:block">Skill Builder</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'generate' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'saved' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Saved ({savedProjects.length})
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
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-zinc-900">What do you want to build?</h2>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  {showAdvanced ? 'Hide Options' : 'Advanced Options'}
                </button>
              </div>
              <p className="text-zinc-500 text-sm mb-4">
                Describe your app, website, or game in detail. We'll break it down into actionable skills and prompts.
              </p>
              
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A full-stack e-commerce platform with React, Node.js, Stripe integration, and an admin dashboard..."
                  className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  disabled={isGenerating}
                />
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-4 border-t border-zinc-100">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Target Audience</label>
                          <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={isGenerating}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Kids">Kids</option>
                            <option value="Executives">Executives</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Tone</label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={isGenerating}
                          >
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual</option>
                            <option value="Humorous">Humorous</option>
                            <option value="Academic">Academic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Number of Skills</label>
                          <input
                            type="number"
                            min="1"
                            max="15"
                            value={numSkills}
                            onChange={(e) => setNumSkills(parseInt(e.target.value) || 5)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={isGenerating}
                          />
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
              {currentProject && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]"
                >
                  {/* Sidebar: Skill List */}
                  <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 flex flex-col h-full">
                      <div className="mb-4 pb-4 border-b border-zinc-100">
                        <h3 className="font-bold text-zinc-900 line-clamp-2">{currentProject.title}</h3>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={saveProjectToFirebase}
                            disabled={isSaving || saveSuccess}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
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
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                          >
                            <FileArchive className="w-4 h-4" />
                            ZIP All
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {currentProject.skills.map((skill, index) => (
                          <button
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill)}
                            className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                              selectedSkill?.id === skill.id 
                                ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                                : 'hover:bg-zinc-50 border border-transparent'
                            }`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg ${
                              selectedSkill?.id === skill.id ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {getIconForSkill(skill.title)}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-zinc-500 mb-0.5">Step {index + 1}</div>
                              <div className={`text-sm font-medium line-clamp-2 ${
                                selectedSkill?.id === skill.id ? 'text-indigo-900' : 'text-zinc-700'
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
                  <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
                    {selectedSkill ? (
                      <>
                        <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200 text-indigo-600">
                              {getIconForSkill(selectedSkill.title)}
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900">{selectedSkill.title}</h2>
                          </div>
                          <button
                            onClick={() => downloadSkill(selectedSkill)}
                            className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 py-2 px-4 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
                          >
                            <FileDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Download .md</span>
                          </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 prose prose-zinc max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-indigo-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown>{selectedSkill.content}</ReactMarkdown>
                        </div>

                        {/* Refinement Area */}
                        <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={refinementPrompt}
                              onChange={(e) => setRefinementPrompt(e.target.value)}
                              placeholder="e.g., Make it shorter, add a code example, explain it for beginners..."
                              className="flex-1 bg-white border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              disabled={isRefining}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && refinementPrompt.trim() && !isRefining) {
                                  handleRefine();
                                }
                              }}
                            />
                            <button
                              onClick={handleRefine}
                              disabled={!refinementPrompt.trim() || isRefining}
                              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                            >
                              {isRefining ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Wand2 className="w-4 h-4" />
                              )}
                              Refine
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                        <Code2 className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a skill from the sidebar to view its details.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400">
                <FileArchive className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-zinc-900 mb-1">No saved projects</h3>
                <p>Projects you save will appear here.</p>
              </div>
            ) : (
              savedProjects.map((project) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setCurrentProject(project);
                    if (project.skills.length > 0) setSelectedSkill(project.skills[0]);
                    setActiveTab('generate');
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                      {project.skills.length} Skills
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-3 mb-4 flex-1">
                    {project.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                    <span className="text-xs text-zinc-400">
                      {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAllAsZip(project);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Download ZIP"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
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

