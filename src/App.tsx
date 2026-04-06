import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Sparkles, Download, Save, LogOut, Code2, Layers, 
  Terminal, Database, LayoutTemplate, Server, Smartphone, MonitorPlay,
  CheckCircle2, AlertCircle, FileArchive, FileDown, Settings2, Wand2, RotateCcw,
  Trash2, Search, Key, X, Menu
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
import { generateSkills, refineSkill, validateApiKey } from './services/geminiService';
import { Skill, Project } from './types';

function LandingPage({ onEnter }: { onEnter: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-x-hidden font-sans w-full max-w-full">
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-8 py-6 sm:py-10 max-w-[1400px] mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="text-3xl font-black tracking-tighter flex items-center gap-1">
            ARCHITECT<span className="text-purple-500">.</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-10"
        >
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Process</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <button 
            onClick={onEnter}
            className="px-8 py-3 bg-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-500 transition-all active:scale-95"
          >
            Launch App
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-10 pb-40 px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Vertical Text & Main Heading */}
        <div className="lg:col-span-7 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute -left-10 sm:-left-20 top-0 text-[8rem] sm:text-[12rem] font-black leading-none select-none pointer-events-none hidden sm:block"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            ELITE
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 relative z-10"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-purple-500"></div>
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-purple-500">Edition 2026</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-7xl md:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase italic">
              UI<span className="text-purple-500">.</span><br />
              <span className="text-zinc-800">DESIGN</span>
            </motion.h1>
            
            <motion.div variants={itemVariants} className="max-w-md space-y-8">
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                Transform simple prompts into professional, production-ready technical specifications and full-stack blueprints.
              </p>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={onEnter}
                  className="px-10 py-5 bg-purple-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-purple-500 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                >
                  Start Now
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Guide for</span>
                  <span className="text-sm font-bold text-white">Beginners & Pros</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Visual Element */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-full max-w-md aspect-square"
          >
            {/* Large Purple Circle */}
            <div className="absolute inset-0 bg-purple-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 border-4 border-purple-600 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[80%] bg-purple-600 rounded-full flex items-center justify-center overflow-hidden relative group">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[20px] border-black/20 border-dashed rounded-full"
                ></motion.div>
                <Layers className="w-32 h-32 text-white relative z-10" />
                
                {/* Floating Stats */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
                  <div className="px-3 py-1 bg-black text-[10px] font-black uppercase tracking-tighter">+150 Students</div>
                  <div className="px-3 py-1 bg-black text-[10px] font-black uppercase tracking-tighter">+50 Courses</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-8 border-t border-zinc-900">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Accept New<br />
              <span className="text-purple-500">Challenges</span>
            </h2>
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 pb-4">
              Explore / 2026
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
            {[
              { title: "Architecture", desc: "Elite system design specs", icon: <Layers className="w-6 h-6" /> },
              { title: "UI Design", desc: "Advanced design systems", icon: <LayoutTemplate className="w-6 h-6" /> },
              { title: "Full Stack", desc: "Production blueprints", icon: <Terminal className="w-6 h-6" /> },
              { title: "Optimization", desc: "High-performance strategies", icon: <Settings2 className="w-6 h-6" /> }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ backgroundColor: "#18181b" }}
                className="bg-black p-12 space-y-8 transition-colors group cursor-default"
              >
                <div className="text-purple-500 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium">{feature.desc}</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-purple-500 transition-colors">
                  Learn More <Wand2 className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-8 bg-purple-600">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">
              Find Your<br />Course.
            </h2>
            <p className="text-black/60 font-bold max-w-md">
              Join the elite circle of architects and designers building the next generation of software.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="border-b-2 border-black pb-2">
              <input type="text" placeholder="NAME" className="bg-transparent w-full outline-none placeholder:text-black/40 font-black text-black" />
            </div>
            <div className="border-b-2 border-black pb-2">
              <input type="email" placeholder="EMAIL" className="bg-transparent w-full outline-none placeholder:text-black/40 font-black text-black" />
            </div>
            <button 
              onClick={onEnter}
              className="mt-6 py-5 bg-black text-white font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-zinc-900">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="text-2xl font-black tracking-tighter uppercase">
              ARCHITECT<span className="text-purple-500">.</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              The ultimate technical architecture engine for elite developers.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">About</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-purple-500 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">What we do</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-purple-500 transition-colors">Architecture</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">UI Design</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">Optimization</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">Sign up to receive our newsletter</h4>
            <div className="flex border-b border-zinc-800 pb-2">
              <input type="email" placeholder="EMAIL" className="bg-transparent w-full outline-none text-xs font-bold uppercase tracking-widest" />
              <button className="text-purple-500"><Wand2 className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-6 pt-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Smartphone className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><MonitorPlay className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Terminal className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingState() {
  const [step, setStep] = React.useState(0);
  const steps = [
    { title: "Analyzing Vision", description: "Deconstructing your prompt into core architectural requirements.", icon: <Search className="w-8 h-8" /> },
    { title: "Architecting System", description: "Designing a high-performance, scalable distributed system architecture.", icon: <Layers className="w-8 h-8" /> },
    { title: "Crafting UI/UX", description: "Defining an elite design system with intentional motion and typography.", icon: <LayoutTemplate className="w-8 h-8" /> },
    { title: "Engineering Specs", description: "Generating type-safe API contracts and advanced frontend patterns.", icon: <Code2 className="w-8 h-8" /> },
    { title: "Optimizing Infrastructure", description: "Hardening security and defining cloud-native deployment strategies.", icon: <Server className="w-8 h-8" /> },
    { title: "Finalizing Roadmap", description: "Synthesizing the master orchestrator and execution sequence.", icon: <Sparkles className="w-8 h-8" /> },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-32 bg-black border-2 border-purple-600/30 relative overflow-hidden w-full"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900">
        <motion.div 
          className="h-full bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[15rem] font-black opacity-[0.03] select-none pointer-events-none italic uppercase">
        PROCESS
      </div>
      
      <div className="relative mb-16">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 45 }}
            className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(168,85,247,0.4)] relative z-10"
          >
            {steps[step].icon}
          </motion.div>
        </AnimatePresence>
        <div className="absolute -inset-8 border-2 border-purple-600/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
      </div>

      <div className="text-center max-w-xl px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">
              {steps[step].title}<span className="text-purple-500">.</span>
            </h3>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              {steps[step].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8 relative z-10">
        <div className="flex gap-4">
          {steps.map((_, i) => (
            <div 
              key={i}
              className={`h-1 transition-all duration-500 ${
                i === step ? 'w-12 bg-purple-600' : 'w-4 bg-zinc-800'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-xs font-black text-purple-500 uppercase tracking-[0.4em]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Elite Engine Running
        </div>
      </div>
    </motion.div>
  );
}

function MainApp() {
  const [showLanding, setShowLanding] = useState(true);
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

  // Search State
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  // API Key State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [manualApiKey, setManualApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualApiKey.trim()) {
      localStorage.removeItem('GEMINI_API_KEY');
      setKeyValidationStatus('idle');
      setIsSettingsOpen(false);
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationStatus('idle');
    
    const isValid = await validateApiKey(manualApiKey);
    
    setIsValidatingKey(false);
    if (isValid) {
      localStorage.setItem('GEMINI_API_KEY', manualApiKey);
      setKeyValidationStatus('success');
      setTimeout(() => {
        setIsSettingsOpen(false);
        setKeyValidationStatus('idle');
      }, 1500);
    } else {
      setKeyValidationStatus('error');
    }
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-12 text-center"
        >
          <div className="space-y-6">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">
              ELITE<br />
              <span className="text-purple-500">ARCHITECT.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg">
              Join the elite circle of architects building the next generation of software.
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 bg-purple-600 text-white py-5 px-8 font-black uppercase tracking-[0.2em] text-sm hover:bg-purple-500 transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] active:scale-95"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" opacity="0.4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          
          <div className="pt-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
            Secure Access / 2026 Edition
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="bg-black border-b border-zinc-900 sticky top-0 z-50 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button - Moved to left and adjusted spacing */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-500 hover:text-white transition-all"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic truncate">
              ARCHITECT<span className="text-purple-500">.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="flex bg-zinc-900 p-1 border border-zinc-800 scale-90 sm:scale-100">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'generate' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'saved' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Library ({savedProjects.length})
              </button>
            </div>
            
            <div className="h-8 w-px bg-zinc-900 hidden sm:block"></div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-3 text-zinc-500 hover:text-purple-500 transition-all group"
                title="API Settings"
              >
                <Key className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">API Key</span>
              </button>

              <button
                onClick={logOut}
                className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden bg-black border-b-2 border-zinc-900 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-600 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">API Key Configuration</span>
                </button>
                <button
                  onClick={() => {
                    logOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-600/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col overflow-x-hidden">
        {activeTab === 'generate' && (
          <div className="flex flex-col h-full gap-12">
            {/* Prompt Input */}
            <div className="bg-black border-2 border-zinc-900 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-[6rem] sm:text-[10rem] font-black opacity-[0.02] select-none pointer-events-none italic uppercase hidden sm:block">
                INPUT
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-8 bg-purple-500"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-purple-500">Project Specification</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-3 border-2 transition-all ${
                    showAdvanced 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-black border-zinc-900 text-zinc-500 hover:border-purple-600 hover:text-purple-500'
                  }`}
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleGenerate} className="flex flex-col gap-8 relative z-10">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    dir={/[\u0590-\u05FF]/.test(prompt) ? 'rtl' : 'ltr'}
                    placeholder="DESCRIBE YOUR VISION..."
                    className="w-full h-48 p-8 bg-zinc-900/50 border-2 border-zinc-900 focus:border-purple-600 outline-none resize-none transition-all text-xl font-bold uppercase tracking-tight placeholder:text-zinc-800"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                    {prompt.length} CHARS
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 pb-6 border-t border-zinc-900">
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            <MonitorPlay className="w-4 h-4 text-purple-500" />
                            Target Audience
                          </label>
                          <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-none px-5 py-4 text-sm font-bold focus:border-purple-600 outline-none transition-all appearance-none uppercase tracking-tight"
                            disabled={isGenerating}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Kids">Kids</option>
                            <option value="Executives">Executives</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Voice & Tone
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-none px-5 py-4 text-sm font-bold focus:border-purple-600 outline-none transition-all appearance-none uppercase tracking-tight"
                            disabled={isGenerating}
                          >
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual</option>
                            <option value="Humorous">Humorous</option>
                            <option value="Academic">Academic</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            <Layers className="w-4 h-4 text-purple-500" />
                            Complexity Level
                          </label>
                          <div className="flex items-center gap-6 bg-zinc-900 p-4 border-2 border-zinc-800">
                            <input
                              type="range"
                              min="3"
                              max="50"
                              value={numSkills}
                              onChange={(e) => setNumSkills(parseInt(e.target.value) || 5)}
                              className="flex-1 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-purple-600"
                              disabled={isGenerating}
                            />
                            <span className="text-sm font-black text-purple-500 w-8 text-center">{numSkills}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-6">
                  {(prompt || currentProject) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isGenerating}
                      className="flex items-center gap-3 bg-zinc-900 text-zinc-400 px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-zinc-800 transition-all border-2 border-zinc-800"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset System
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-4 bg-purple-600 text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] active:scale-95"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Architecting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Execute Generation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <LoadingState key="loading-state" />
              ) : currentProject && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]"
                >
                  {/* Sidebar: Skill List */}
                  <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="bg-black border-2 border-zinc-900 p-6 flex flex-col h-full relative overflow-hidden">
                      <div className="absolute -left-10 -top-10 text-8xl font-black opacity-[0.02] select-none pointer-events-none italic uppercase">
                        NAV
                      </div>
                      
                      <div className="mb-8 pb-8 border-b border-zinc-900 relative z-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-6 leading-tight">{currentProject.title}</h3>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => {
                              setCustomTitle(currentProject.title);
                              setIsSaveModalOpen(true);
                            }}
                            disabled={isSaving || saveSuccess}
                            className={`flex items-center justify-center gap-3 py-4 px-6 font-black uppercase tracking-widest text-[10px] transition-all ${
                              saveSuccess 
                                ? 'bg-emerald-600/10 text-emerald-500 border-2 border-emerald-600/30' 
                                : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:text-white hover:border-purple-600'
                            }`}
                          >
                            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saveSuccess ? 'ARCHIVED' : 'ARCHIVE PROJECT'}
                          </button>
                          <button
                            onClick={() => downloadAllAsZip(currentProject)}
                            className="flex items-center justify-center gap-3 bg-purple-600 text-white py-4 px-6 font-black uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                          >
                            <FileArchive className="w-4 h-4" />
                            DOWNLOAD ASSET (.ZIP)
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
                        <div className="mb-8 space-y-2">
                          {[
                            { id: 'skills', label: 'Architectural Phases', icon: <Layers className="w-4 h-4" /> },
                            { id: 'detailedPrompt', label: 'Full-Stack Blueprint', icon: <Terminal className="w-4 h-4" /> },
                            { id: 'systemOptimization', label: 'Performance Strategy', icon: <Settings2 className="w-4 h-4" /> },
                            { id: 'skillChain', label: 'Execution Roadmap', icon: <Code2 className="w-4 h-4" /> },
                            { id: 'masterSkill', label: 'Master Orchestrator', icon: <Wand2 className="w-4 h-4" /> }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveResultView(item.id as any)}
                              className={`w-full text-left p-4 font-black uppercase tracking-widest text-[10px] transition-all border-2 ${
                                activeResultView === item.id 
                                  ? 'bg-purple-600 border-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {item.icon}
                                {item.label}
                              </div>
                            </button>
                          ))}
                        </div>

                        {activeResultView === 'skills' && (
                          <div className="mb-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-zinc-600" />
                            </div>
                            <input
                              type="text"
                              placeholder="FILTER PHASES..."
                              value={skillSearchQuery}
                              onChange={(e) => setSkillSearchQuery(e.target.value)}
                              className="w-full bg-zinc-900 border-2 border-zinc-800 px-12 py-3 text-[10px] font-black uppercase tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700"
                            />
                          </div>
                        )}

                        {activeResultView === 'skills' && currentProject.skills.filter(skill => {
                          const query = skillSearchQuery.toLowerCase();
                          return (
                            skill.title.toLowerCase().includes(query) ||
                            skill.content.toLowerCase().includes(query) ||
                            skill.tags?.some(tag => tag.toLowerCase().includes(query))
                          );
                        }).map((skill, index) => (
                          <button
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill)}
                            className={`w-full text-left p-5 flex items-start gap-5 transition-all border-2 ${
                              selectedSkill?.id === skill.id 
                                ? 'bg-zinc-900 border-purple-600 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]' 
                                : 'bg-black border-zinc-900 hover:border-zinc-700'
                            }`}
                          >
                            <div className={`mt-1 p-3 transition-colors ${
                              selectedSkill?.id === skill.id ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-600'
                            }`}>
                              {getIconForSkill(skill.title)}
                            </div>
                            <div className="flex-1">
                              <div className="text-[9px] uppercase tracking-[0.3em] font-black text-purple-500 mb-2">Phase {index + 1}</div>
                              <div className={`text-xs font-black uppercase tracking-tight leading-tight mb-3 ${
                                selectedSkill?.id === skill.id ? 'text-white' : 'text-zinc-500'
                              }`}>
                                {skill.title}
                              </div>
                              {skill.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {skill.tags.map(tag => (
                                    <span key={tag} className={`text-[8px] px-2 py-1 font-black uppercase tracking-widest ${
                                      selectedSkill?.id === skill.id ? 'bg-purple-600/20 text-purple-400' : 'bg-zinc-900 text-zinc-700'
                                    }`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content: Skill Details */}
                  <div className="flex-1 bg-black border-2 border-zinc-900 flex flex-col overflow-hidden relative">
                    <div className="absolute -right-20 -bottom-20 text-[20rem] font-black opacity-[0.01] select-none pointer-events-none italic uppercase hidden sm:block">
                      CORE
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {activeResultView === 'skills' ? (
                        <motion.div 
                          key="skills-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          {selectedSkill ? (
                            <>
                              <div className="p-4 sm:p-10 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-xl">
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <div className="p-3 sm:p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                    {getIconForSkill(selectedSkill.title)}
                                  </div>
                                  <div>
                                    <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-2 sm:mb-3">{selectedSkill.title}</h2>
                                    <div className="flex items-center gap-4">
                                      <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Technical Specification</p>
                                      {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                                        <div className="hidden sm:flex items-center gap-2">
                                          <div className="w-1 h-1 bg-purple-500"></div>
                                          {selectedSkill.tags.map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-1 bg-purple-600/10 text-purple-500 font-black uppercase tracking-widest">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadSkillAsZip(selectedSkill)}
                                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border-2 border-zinc-800 py-2 sm:py-3 px-4 sm:px-6 hover:text-white hover:border-purple-600 transition-all"
                                >
                                  <FileArchive className="w-4 h-4" />
                                  <span className="hidden sm:inline">Export Phase</span>
                                </button>
                              </div>
                              
                              <div className="p-6 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar relative">
                                {isRefining && (
                                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-6 bg-zinc-900 p-12 border-2 border-purple-600/30 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                        <Wand2 className="w-8 h-8 animate-pulse" />
                                      </div>
                                      <div className="text-center space-y-2">
                                        <p className="font-black text-white uppercase tracking-widest text-sm italic">Refining Architecture</p>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Applying elite technical adjustments</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <ReactMarkdown>{selectedSkill.content}</ReactMarkdown>
                              </div>

                              {/* Refinement Area */}
                              <div className="p-6 bg-zinc-900/50 border-t border-zinc-900">
                                <div className="flex gap-4">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={refinementPrompt}
                                      onChange={(e) => setRefinementPrompt(e.target.value)}
                                      dir={/[\u0590-\u05FF]/.test(refinementPrompt) ? 'rtl' : 'ltr'}
                                      placeholder="REQUEST ARCHITECTURAL REFINEMENT..."
                                      className="w-full bg-black border-2 border-zinc-800 px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-800"
                                      disabled={isRefining}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && refinementPrompt.trim() && !isRefining) {
                                          handleRefine();
                                        }
                                      }}
                                    />
                                    {isRefining && (
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleRefine}
                                    disabled={!refinementPrompt.trim() || isRefining}
                                    className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-purple-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                    Refine
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 p-12 text-center">
                              <Code2 className="w-24 h-24 mb-8 opacity-10" />
                              <p className="font-black uppercase tracking-[0.3em] text-sm italic">Select an architectural phase to view technical details</p>
                            </div>
                          )}
                        </motion.div>
                      ) : activeResultView === 'detailedPrompt' ? (
                        <motion.div 
                          key="detailed-prompt-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Terminal className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">Full-Stack Blueprint</h2>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Master Implementation Prompt</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.detailedPrompt || '', 'detailed_prompt.md')}
                              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border-2 border-zinc-800 py-3 px-6 hover:text-white hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.detailedPrompt || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'systemOptimization' ? (
                        <motion.div 
                          key="system-optimization-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Settings2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">Performance Strategy</h2>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Optimization & Scaling</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.systemOptimization || '', 'system_optimization.md')}
                              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border-2 border-zinc-800 py-3 px-6 hover:text-white hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.systemOptimization || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'skillChain' ? (
                        <motion.div 
                          key="skill-chain-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Code2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">Execution Roadmap</h2>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Skill Chain Logic</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.skillChainOptimization || '', 'skill_chain_logic.md')}
                              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border-2 border-zinc-800 py-3 px-6 hover:text-white hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar">
                            <ReactMarkdown>{currentProject.skillChainOptimization || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="master-skill-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Wand2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">Master Orchestrator</h2>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Ultimate System Logic</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.masterSkill || '', 'master_skill.md')}
                              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border-2 border-zinc-800 py-3 px-6 hover:text-white hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar">
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
          <div className="flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-8 bg-purple-500"></div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-purple-500">Project Archive</h2>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="SEARCH ARCHIVE..."
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 px-12 py-3 text-[10px] font-black uppercase tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
                {savedProjects.length > 0 && (
                  <button
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 bg-red-500/5 border-2 border-red-500/20 py-3 px-6 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Purge All
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {savedProjects.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-40 text-zinc-800 bg-black border-2 border-zinc-900 relative overflow-hidden">
                  <div className="absolute inset-0 text-[15rem] font-black opacity-[0.01] select-none pointer-events-none italic uppercase flex items-center justify-center">
                    EMPTY
                  </div>
                  <div className="w-24 h-24 bg-zinc-900 flex items-center justify-center mb-8 border-2 border-zinc-800 relative z-10">
                    <FileArchive className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3 relative z-10">No archived projects</h3>
                  <p className="max-w-xs text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 relative z-10">Your architectural specifications will appear here once archived.</p>
                </div>
              ) : savedProjects.filter(project => {
                const query = projectSearchQuery.toLowerCase();
                return (
                  project.title.toLowerCase().includes(query) ||
                  project.prompt.toLowerCase().includes(query) ||
                  project.skills.some(skill => 
                    skill.title.toLowerCase().includes(query) || 
                    skill.content.toLowerCase().includes(query) ||
                    skill.tags?.some(tag => tag.toLowerCase().includes(query))
                  )
                );
              }).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600">
                  <Search className="w-12 h-12 opacity-10 mb-6" />
                  <p className="font-black uppercase tracking-widest text-xs italic">No projects found matching "{projectSearchQuery}"</p>
                </div>
              ) : (
                savedProjects.filter(project => {
                  const query = projectSearchQuery.toLowerCase();
                  return (
                    project.title.toLowerCase().includes(query) ||
                    project.prompt.toLowerCase().includes(query) ||
                    project.skills.some(skill => 
                      skill.title.toLowerCase().includes(query) || 
                      skill.content.toLowerCase().includes(query) ||
                      skill.tags?.some(tag => tag.toLowerCase().includes(query))
                    )
                  );
                }).map((project) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8 }}
                    className="bg-zinc-900/30 border-2 border-zinc-900 p-8 flex flex-col hover:border-purple-600 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => {
                      setCurrentProject(project);
                      if (project.skills.length > 0) setSelectedSkill(project.skills[0]);
                      setActiveTab('generate');
                    }}
                  >
                    <div className="absolute -right-6 -top-6 text-6xl font-black opacity-[0.03] select-none pointer-events-none italic uppercase group-hover:opacity-10 transition-opacity">
                      ARCH
                    </div>
                    
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                        <Layers className="w-7 h-7" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-3 text-zinc-600 hover:text-red-500 bg-black border-2 border-zinc-900 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-[9px] font-black text-purple-500 bg-purple-600/10 px-3 py-1 uppercase tracking-widest border border-purple-600/20">
                          {project.skills.length} PHASES
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-4 line-clamp-2 group-hover:text-purple-500 transition-colors">{project.title}</h3>
                    <p className="text-xs font-medium text-zinc-500 line-clamp-3 mb-6 flex-1 leading-relaxed uppercase tracking-tight">
                      {project.prompt}
                    </p>
                    
                    {(() => {
                      const allTags = Array.from(new Set(project.skills.flatMap(s => s.tags || []))).slice(0, 3);
                      if (allTags.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {allTags.map(tag => (
                              <span key={tag} className="text-[8px] px-2 py-1 bg-zinc-900 text-zinc-600 font-black uppercase tracking-widest border border-zinc-800">
                                {tag}
                              </span>
                            ))}
                            {new Set(project.skills.flatMap(s => s.tags || [])).size > 3 && (
                              <span className="text-[8px] px-2 py-1 bg-black text-zinc-700 font-black uppercase tracking-widest">
                                +{new Set(project.skills.flatMap(s => s.tags || [])).size - 3}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return <div className="mb-8"></div>;
                    })()}
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                          {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAllAsZip(project);
                        }}
                        className="text-zinc-600 hover:text-purple-500 p-3 bg-black border-2 border-zinc-900 hover:border-purple-600/30 transition-all"
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

      {/* API Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-black border-2 border-zinc-900 w-full max-w-xl overflow-hidden relative"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-black opacity-[0.02] select-none pointer-events-none italic uppercase">
                KEY
              </div>
              
              <div className="p-10 border-b border-zinc-900 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    <Key className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">API Configuration</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 bg-zinc-900 border-2 border-zinc-800 text-zinc-500 hover:text-white hover:border-purple-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveApiKey} className="p-10 space-y-10 relative z-10">
                <div className="bg-purple-600/5 p-8 border-2 border-purple-600/20 space-y-6">
                  <h3 className="text-[10px] font-black text-purple-500 flex items-center gap-3 uppercase tracking-[0.3em]">
                    <AlertCircle className="w-5 h-5" />
                    Setup Guide / Integration
                  </h3>
                  <ol className="text-[11px] text-zinc-500 space-y-4 font-black uppercase tracking-widest leading-relaxed">
                    <li className="flex gap-4"><span className="text-purple-500">01.</span> Access <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-purple-500">Google AI Studio</a></li>
                    <li className="flex gap-4"><span className="text-purple-500">02.</span> Initialize "Create API Key"</li>
                    <li className="flex gap-4"><span className="text-purple-500">03.</span> Select Project & Provision Key</li>
                    <li className="flex gap-4"><span className="text-purple-500">04.</span> Inject Key into the field below</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                    Gemini API Key / Production
                  </label>
                  <input
                    type="password"
                    value={manualApiKey}
                    onChange={(e) => {
                      setManualApiKey(e.target.value);
                      setKeyValidationStatus('idle');
                    }}
                    placeholder="ENTER SECRET KEY..."
                    className={`w-full bg-zinc-900 border-2 px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-zinc-800 ${
                      keyValidationStatus === 'error' 
                        ? 'border-red-500 focus:border-red-500' 
                        : keyValidationStatus === 'success'
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-zinc-800 focus:border-purple-600'
                    }`}
                  />
                  {keyValidationStatus === 'error' && (
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Validation Failed / Check Credentials
                    </p>
                  )}
                  {keyValidationStatus === 'success' && (
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      System Online / Key Validated
                    </p>
                  )}
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
                    Keys are stored locally / Encrypted in browser storage / No server-side persistence.
                  </p>
                </div>
                
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setKeyValidationStatus('idle');
                    }}
                    className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                    disabled={isValidatingKey}
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={isValidatingKey || !manualApiKey.trim()}
                    className={`flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-3 ${
                      keyValidationStatus === 'success'
                        ? 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    }`}
                  >
                    {isValidatingKey ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : keyValidationStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Validated
                      </>
                    ) : (
                      'Save & Validate'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-xl w-full p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-black opacity-[0.02] select-none pointer-events-none italic uppercase">
                SAVE
              </div>
              
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6 relative z-10">Archive Project</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10">
                Commit this architectural specification to the local archive.
              </p>
              <div className="space-y-6 relative z-10">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                  Project Designation
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="DESIGNATION NAME..."
                  className="w-full bg-zinc-900 border-2 border-zinc-800 px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-purple-600 transition-all placeholder:text-zinc-800"
                  autoFocus
                />
              </div>
              <div className="flex gap-6 mt-10 relative z-10">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={saveProjectToFirebase}
                  disabled={!customTitle.trim() || isSaving}
                  className="flex-1 px-8 py-5 bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-3"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Confirm Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-md w-full p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-black opacity-[0.02] select-none pointer-events-none italic uppercase">
                DEL
              </div>
              
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6 relative z-10">Purge Specification?</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10 leading-relaxed">
                This action will permanently remove <span className="text-white">"{projectToDelete?.title}"</span> from the archive. This process is irreversible.
              </p>
              <div className="flex gap-6 relative z-10">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={deleteProject}
                  disabled={isDeleting}
                  className="flex-1 px-8 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-md w-full p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-black opacity-[0.02] select-none pointer-events-none italic uppercase">
                ALL
              </div>
              
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6 relative z-10 text-red-500">Total Purge?</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10 leading-relaxed">
                You are about to initiate a total purge of the project archive. <span className="text-white">ALL DATA</span> will be permanently erased.
              </p>
              <div className="flex gap-6 relative z-10">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={deleteAllProjects}
                  disabled={isDeleting}
                  className="flex-1 px-8 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Purge
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

