import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Sparkles, Download, Save, LogOut, Code2, Layers, 
  Terminal, Database, LayoutTemplate, Server, Smartphone, MonitorPlay,
  CheckCircle2, AlertCircle, Info, FileArchive, FileDown, Settings2, Wand2, RotateCcw,
  Trash2, Search, Key, X, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';
import { 
  collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, 
  deleteDoc, doc, getDocs, writeBatch, setDoc 
} from 'firebase/firestore';
import { db, auth, signInWithGoogle, logOut, handleFirestoreError, OperationType } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  generateSkills, refineSkill, validateApiKey, 
  analyzeRequirements, enrichSkills, RequirementAnalysis 
} from './services/geminiService';
import { Skill, Project } from './types';
import { translations, Language } from './translations';

function LandingPage({ onEnter, lang }: { onEnter: () => void, lang: Language }) {
  const t = translations[lang].landing;
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

  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio feedback not supported');
    }
  };

  const handleEnter = () => {
    playClickSound();
    onEnter();
  };

  const featureDetails: Record<string, { title: string, content: string }> = {
    [t.architecture]: {
      title: t.architecture,
      content: lang === 'en' 
        ? "Elite system design specifications including microservices, distributed systems, and cloud-native patterns. We provide detailed diagrams and technical requirements for scalable infrastructure."
        : "מפרטי עיצוב מערכת עילית הכוללים מיקרו-שירותים, מערכות מבוזרות ודפוסי ענן. אנו מספקים דיאגרמות מפורטות ודרישות טכניות לתשתית ניתנת להרחבה."
    },
    [t.uiDesignCard]: {
      title: t.uiDesignCard,
      content: lang === 'en'
        ? "Advanced design systems with intentional motion, typography, and responsive layouts. Our blueprints define a consistent visual language that elevates the user experience."
        : "מערכות עיצוב מתקדמות עם תנועה מכוונת, טיפוגרפיה ופריסות רספונסיביות. תוכניות העבודה שלנו מגדירות שפה ויזואלית עקבית שמעלה את חווית המשתמש."
    },
    [t.fullStack]: {
      title: t.fullStack,
      content: lang === 'en'
        ? "Production-ready blueprints with type-safe API contracts, database schemas, and frontend patterns. We bridge the gap between design and implementation with precise technical specs."
        : "תוכניות עבודה מוכנות לייצור עם חוזי API בטוחים, סכימות מסדי נתונים ודפוסי פרונטנד. אנו מגשרים על הפער בין עיצוב ליישום עם מפרטים טכניים מדויקים."
    },
    [t.optimization]: {
      title: t.optimization,
      content: lang === 'en'
        ? "High-performance strategies for scaling, security hardening, and infrastructure optimization. We ensure your system is built for speed, resilience, and long-term maintainability."
        : "אסטרטגיות ביצועים גבוהים לגדילה, הקשחת אבטחה ואופטימיזציה של תשתיות. אנו מבטיחים שהמערכת שלך בנויה למהירות, עמידות ותחזוקה לטווח ארוך."
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-x-hidden font-sans w-full max-w-full" dir={translations[lang].dir}>
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-8 py-6 sm:py-10 max-w-[1400px] mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: lang === 'en' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 flex-shrink-0"
        >
          <div className="text-3xl font-bold tracking-tighter flex items-center gap-1">
            {t.architect}<span className="text-purple-500">.</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: lang === 'en' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-10"
        >
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">{t.home}</a>
            <a href="#" className="hover:text-white transition-colors">{t.process}</a>
            <a href="#" className="hover:text-white transition-colors">{t.pricing}</a>
          </div>
          <button 
            onClick={handleEnter}
            className="px-6 py-2 bg-purple-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-purple-500 transition-all active:scale-95"
          >
            {t.launchApp}
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
            className={`absolute ${lang === 'en' ? '-left-10 sm:-left-20' : '-right-10 sm:-right-20'} top-0 text-[8rem] sm:text-[12rem] font-semibold leading-none select-none pointer-events-none hidden sm:block`}
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {t.elite}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 relative z-10"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-purple-500"></div>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-purple-500">{t.edition}</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-7xl md:text-[10rem] font-semibold leading-[0.85] tracking-tighter uppercase italic">
              {lang === 'en' ? (
                <>
                  UI<span className="text-purple-500">.</span><br />
                  <span className="text-zinc-800">DESIGN</span>
                </>
              ) : (
                <>
                  עיצוב<span className="text-purple-500">.</span><br />
                  <span className="text-zinc-800">UI</span>
                </>
              )}
            </motion.h1>
            
            <motion.div variants={itemVariants} className="max-w-md space-y-8">
              <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                {t.description}
              </p>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleEnter}
                  className="px-8 py-4 bg-purple-600 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-purple-500 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] active:scale-95"
                >
                  {t.startNow}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.guideFor}</span>
                  <span className="text-sm font-semibold text-white">{t.beginnersPros}</span>
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
                  <div className="px-3 py-1 bg-black text-[10px] font-bold uppercase tracking-tighter">+150 {t.students}</div>
                  <div className="px-3 py-1 bg-black text-[10px] font-bold uppercase tracking-tighter">+50 {t.courses}</div>
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
            <h2 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-none">
              {t.acceptNew}<br />
              <span className="text-purple-500">{t.challenges}</span>
            </h2>
            <div className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500 pb-4">
              {t.explore} / 2026
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
              { [
                { title: t.architecture, desc: t.architectureDesc, icon: <Layers className="w-6 h-6" /> },
                { title: t.uiDesignCard, desc: t.uiDesignDesc, icon: <LayoutTemplate className="w-6 h-6" /> },
                { title: t.fullStack, desc: t.fullStackDesc, icon: <Terminal className="w-6 h-6" /> },
                { title: t.optimization, desc: t.optimizationDesc, icon: <Settings2 className="w-6 h-6" /> }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ backgroundColor: "#18181b" }}
                  onClick={() => {
                    playClickSound();
                    setSelectedFeature(featureDetails[feature.title]);
                  }}
                  className="bg-black p-12 space-y-8 transition-colors group cursor-pointer"
                >
                  <div className="text-purple-500 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold uppercase tracking-tight mb-2">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium">{feature.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 group-hover:text-purple-500 transition-colors">
                    {t.learnMore} <Wand2 className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Feature Details Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border-2 border-zinc-800 p-8 sm:p-12 max-w-lg w-full shadow-2xl"
            >
              <button 
                onClick={() => {
                  playClickSound();
                  setSelectedFeature(null);
                }}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-8 bg-purple-500"></div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-purple-500">{t.explore}</h3>
                </div>
                
                <h2 className="text-4xl font-bold uppercase tracking-tighter italic text-white">
                  {selectedFeature.title}<span className="text-purple-500">.</span>
                </h2>
                
                <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                  {selectedFeature.content}
                </p>
                
                <button 
                  onClick={() => {
                    playClickSound();
                    setSelectedFeature(null);
                  }}
                  className="w-full py-4 bg-purple-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all active:scale-95"
                >
                  {lang === 'en' ? 'CLOSE' : 'סגור'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-40 px-8 bg-purple-600">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none text-black">
              {t.findYour}<br />{t.course}
            </h2>
            <p className="text-black/60 font-semibold max-w-md">
              {t.ctaDesc}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="border-b-2 border-black pb-2">
              <input type="text" placeholder={t.name} className="bg-transparent w-full outline-none placeholder:text-black/40 font-bold text-black" />
            </div>
            <div className="border-b-2 border-black pb-2">
              <input type="email" placeholder={t.email} className="bg-transparent w-full outline-none placeholder:text-black/40 font-bold text-black" />
            </div>
            <button 
              onClick={onEnter}
              className="mt-6 py-5 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all"
            >
              {t.subscribe}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-zinc-900">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="text-2xl font-bold tracking-tighter uppercase">
              {t.architect}<span className="text-purple-500">.</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              {t.footerDesc}
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-6">{t.about}</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-semibold uppercase tracking-widest">
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.ourStory}</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.team}</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.careers}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-6">{t.whatWeDo}</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-semibold uppercase tracking-widest">
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.architecture}</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.uiDesignCard}</a></li>
              <li><a href="#" className="hover:text-purple-500 transition-colors">{t.optimization}</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-6">{t.newsletter}</h4>
            <div className="flex border-b border-zinc-800 pb-2">
              <input type="email" placeholder={t.email} className="bg-transparent w-full outline-none text-xs font-semibold uppercase tracking-widest" />
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

function LoadingState({ lang, generationStage }: { lang: Language, generationStage: 'idle' | 'analyzing' | 'architecting' | 'refining' }) {
  const t = translations[lang].loading;
  const [step, setStep] = React.useState(0);
  const currentT = translations[lang].loading;
  const steps = currentT.steps;

  const icons = [
    <Search className="w-8 h-8" />,
    <Layers className="w-8 h-8" />,
    <LayoutTemplate className="w-8 h-8" />,
    <Code2 className="w-8 h-8" />,
    <Server className="w-8 h-8" />,
    <Sparkles className="w-8 h-8" />,
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

      <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[15rem] font-bold opacity-[0.03] select-none pointer-events-none italic uppercase">
        {lang === 'he' ? 'תהליך' : 'PROCESS'}
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
            {icons[step]}
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
            <h3 className="text-4xl font-bold text-white uppercase tracking-tighter italic">
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
        
        <div className="flex items-center gap-3 text-xs font-bold text-purple-500 uppercase tracking-[0.4em]">
          <Loader2 className="w-4 h-4 animate-spin" />
          {generationStage === 'analyzing' && t.analyzingRequirements}
          {generationStage === 'architecting' && t.architectingComponents}
          {generationStage === 'refining' && t.eliteRefinement}
          {generationStage === 'idle' && "Elite Engine Running"}
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
  const [generationStage, setGenerationStage] = useState<'idle' | 'analyzing' | 'architecting' | 'refining'>('idle');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeResultView, setActiveResultView] = useState<'skills' | 'detailedPrompt' | 'systemOptimization' | 'skillChain' | 'masterSkill' | 'fullView' | 'executionGuide'>('skills');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  
  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Search State
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  // API Key State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio feedback not supported');
    }
  };
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('APP_LANG');
    return (saved as Language) || 'en';
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('APP_LANG', lang);
  }, [lang]);
  const [manualApiKey, setManualApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setShowLanding(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      
      // Sort in memory to avoid composite index requirement
      projectsData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds * 1000 || 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds * 1000 || 0;
        return dateB - dateA;
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

    // Check for API key - force manual entry as requested by user
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (!savedKey) {
      showNotification(lang === 'en' ? 'Gemini API Key is required. Please set it in the settings menu.' : 'מפתח Gemini API נדרש. אנא הגדר אותו בתפריט ההגדרות.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationStage('analyzing');
    setCurrentProject(null);
    setSelectedSkill(null);
    setSaveSuccess(false);

    try {
      // Stage 1: Deep Requirement Analysis
      const analysis = await analyzeRequirements(prompt);
      
      // Stage 2: Core Architectural Generation
      setGenerationStage('architecting');
      const result = await generateSkills({
        prompt,
        audience,
        tone,
        numSkills
      }, analysis);

      // Stage 3: Elite Refinement & Hardening
      setGenerationStage('refining');
      const enrichedSkills = await enrichSkills(result.skills, prompt);

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
        skills: enrichedSkills
      });
      if (enrichedSkills.length > 0) {
        setSelectedSkill(enrichedSkills[0]);
      }
      setActiveResultView('skills');
    } catch (error: any) {
      console.error("Generation failed:", error);
      const errorMessage = error.message || "Unknown error occurred";
      showNotification(lang === 'en' ? `Failed to generate skills: ${errorMessage}` : `יצירת מיומנויות נכשלה: ${errorMessage}`, 'error');
    } finally {
      setIsGenerating(false);
      setGenerationStage('idle');
    }
  };

  const handleRefine = async () => {
    if (!selectedSkill || !currentProject || !refinementPrompt.trim()) return;
    
    // Check for API key - force manual entry as requested by user
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (!savedKey) {
      showNotification(lang === 'en' ? 'Gemini API Key is required. Please set it in the settings menu.' : 'מפתח Gemini API נדרש. אנא הגדר אותו בתפריט ההגדרות.', 'error');
      setIsSettingsOpen(true);
      return;
    }

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
      showNotification(lang === 'en' ? 'Skill refined successfully.' : 'המיומנות עודכנה בהצלחה.', 'success');
    } catch (error) {
      console.error("Refinement failed:", error);
      showNotification(lang === 'en' ? 'Failed to refine skill. Please try again.' : 'עדכון המיומנות נכשל. אנא נסה שוב.', 'error');
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

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const saveProjectToFirebase = async () => {
    if (!currentProject || !user || !customTitle.trim()) {
      if (!user) showNotification(lang === 'en' ? 'Please sign in to archive projects.' : 'אנא התחבר כדי לשמור פרויקטים בארכיון.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // Clean up project data to ensure it matches the schema
      const projectData: any = {
        userId: user.uid,
        prompt: currentProject.prompt || '',
        title: customTitle.trim(),
        audience: currentProject.audience || 'Intermediate',
        tone: currentProject.tone || 'Professional',
        numSkills: currentProject.numSkills || 5,
        detailedPrompt: currentProject.detailedPrompt || '',
        systemOptimization: currentProject.systemOptimization || '',
        skillChainOptimization: currentProject.skillChainOptimization || '',
        masterSkill: currentProject.masterSkill || '',
        skills: currentProject.skills.map(s => ({
          id: s.id,
          title: s.title,
          content: s.content,
          tags: s.tags || []
        }))
      };

      if (currentProject.id) {
        // Update existing project
        const projectRef = doc(db, 'projects', currentProject.id);
        await setDoc(projectRef, {
          ...projectData,
          createdAt: currentProject.createdAt // Preserve original creation date
        }, { merge: true });
        
        showNotification(lang === 'en' ? 'Changes saved to archive.' : 'השינויים נשמרו בארכיון.', 'success');
      } else {
        // Create new project
        const docRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp()
        });
        
        // Update current project with the new ID so subsequent saves update it
        setCurrentProject({
          ...currentProject,
          id: docRef.id,
          title: customTitle.trim()
        });
        
        showNotification(lang === 'en' ? 'Project archived successfully.' : 'הפרויקט נשמר בארכיון בהצלחה.', 'success');
      }
      
      setSaveSuccess(true);
      setIsSaveModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Save failed:", error);
      showNotification(lang === 'en' ? `Failed to save: ${error.message}` : `שמירה נכשלה: ${error.message}`, 'error');
      try {
        handleFirestoreError(error, OperationType.WRITE, currentProject.id ? `projects/${currentProject.id}` : 'projects');
      } catch (e) {}
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
      showNotification(lang === 'en' ? 'Project deleted.' : 'הפרויקט נמחק.', 'success');
    } catch (error: any) {
      console.error("Delete failed:", error);
      showNotification(lang === 'en' ? `Failed to delete: ${error.message}` : `מחיקה נכשלה: ${error.message}`, 'error');
      try {
        handleFirestoreError(error, OperationType.DELETE, `projects/${projectToDelete.id}`);
      } catch (e) {}
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
      showNotification(lang === 'en' ? 'All projects deleted.' : 'כל הפרויקטים נמחקו.', 'success');
    } catch (error: any) {
      console.error("Delete all failed:", error);
      showNotification(lang === 'en' ? `Failed to delete all: ${error.message}` : `מחיקה נכשלה: ${error.message}`, 'error');
      try {
        handleFirestoreError(error, OperationType.DELETE, 'projects');
      } catch (e) {}
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

    const executionProtocol = `# Master Execution Guide / מדריך ביצוע ראשי

## 1. Initialize with Master Prompt / אתחול עם הנחיית העל
Copy the "Full-Stack Blueprint" (DETAILED_PROMPT.md) and feed it to your development environment to set up the core architecture.
העתק את "תוכנית העבודה המלאה" (DETAILED_PROMPT.md) והזן אותה לסביבת הפיתוח שלך כדי להקים את ארכיטקטורת הליבה.

## 2. Execute Skill Chain / ביצוע שרשרת המיומנויות
Follow the "Execution Roadmap" (SKILL_CHAIN_OPTIMIZATION.md) order. Apply each "Architectural Phase" one by one, ensuring dependencies are met.
עקוב אחר סדר "מפת הדרכים לביצוע" (SKILL_CHAIN_OPTIMIZATION.md). החל כל "שלב ארכיטקטוני" אחד אחד, תוך הבטחה שכל התלויות מתקיימות.

## 3. Apply Elite Optimizations / החלת אופטימיזציות עילית
Use the "Performance Strategy" (SYSTEM_OPTIMIZATION.md) to harden security, optimize speed, and ensure scalability.
השתמש ב"אסטרטגיית הביצועים" (SYSTEM_OPTIMIZATION.md) כדי להקשיח אבטחה, למטב מהירות ולהבטיח יכולת גדילה.

## 4. Finalize with Orchestrator / סיום עם המתזמר
Apply the "Master Orchestrator" (MASTER_SKILL.md) logic to connect all components into a cohesive, finished product.
החל את לוגיקת "מתזמר העל" (MASTER_SKILL.md) כדי לחבר את כל הרכיבים למוצר מוגמר ומלוכד.`;

    zip.file('EXECUTION_PROTOCOL.md', executionProtocol);
    readmeContent += `- [Execution Protocol](./EXECUTION_PROTOCOL.md)\n`;

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
    return <LandingPage onEnter={() => setShowLanding(false)} lang={lang} />;
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8 font-sans" dir={t.dir}>
        <div className="absolute top-8 right-8 flex gap-2">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-[10px] font-bold border-2 transition-all ${lang === 'en' ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('he')}
            className={`px-3 py-1 text-[10px] font-bold border-2 transition-all ${lang === 'he' ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
          >
            HE
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-12 text-center"
        >
          <div className="space-y-6">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold uppercase tracking-tighter">
              {t.login.elite}<br />
              <span className="text-purple-500">{t.login.architect}</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg">
              {t.login.joinCircle}
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 bg-purple-600 text-white py-5 px-8 font-bold uppercase tracking-[0.2em] text-sm hover:bg-purple-500 transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] active:scale-95"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" opacity="0.4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.login.authenticate}
          </button>
          
          <div className="pt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">
            {t.login.secureAccess}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden w-full max-w-full" dir={t.dir}>
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

            <div className="text-xl sm:text-2xl font-bold tracking-tighter uppercase">
              {t.landing.architect}<span className="text-purple-500">.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="hidden md:flex bg-zinc-900 p-1 border border-zinc-800">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('he')}
                className={`px-3 py-1 text-[10px] font-bold transition-all ${lang === 'he' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                HE
              </button>
            </div>

            <div className="flex bg-zinc-900 p-1 border border-zinc-800 scale-90 sm:scale-100">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('generate');
                }}
                className={`px-4 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'generate' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {t.header.generate}
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('saved');
                }}
                className={`px-4 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'saved' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {t.header.library} ({savedProjects.length})
              </button>
            </div>
            
            <div className="h-8 w-px bg-zinc-900 hidden sm:block"></div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-3 text-zinc-500 hover:text-purple-500 transition-all group"
                title={t.header.apiKey}
              >
                <Key className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.header.apiKey}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  logOut();
                }}
                className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all group"
                title={t.header.signOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.header.signOut}</span>
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
                    playClickSound();
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-600 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.header.apiKeyConfig}</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    logOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-900 border-2 border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-600/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.header.terminateSession}</span>
                </button>
                <div className="flex bg-zinc-900 p-1 border border-zinc-800">
                  <button 
                    onClick={() => setLang('en')}
                    className={`flex-1 py-3 text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    ENGLISH
                  </button>
                  <button 
                    onClick={() => setLang('he')}
                    className={`flex-1 py-3 text-[10px] font-bold transition-all ${lang === 'he' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    עברית
                  </button>
                </div>
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
              <div className="absolute -right-10 -top-10 text-[6rem] sm:text-[10rem] font-bold opacity-[0.02] select-none pointer-events-none italic uppercase hidden sm:block">
                {t.main.input}
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-8 bg-purple-500"></div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-purple-500">{t.main.projectSpec}</h2>
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
                    placeholder={t.main.describeVision}
                    className="w-full h-48 p-8 bg-zinc-900/50 border-2 border-zinc-900 focus:border-purple-600 outline-none resize-none transition-all text-xl font-semibold tracking-tight placeholder:text-zinc-800"
                    disabled={isGenerating}
                  />
                  <div className={`absolute bottom-4 ${lang === 'en' ? 'right-4' : 'left-4'} text-[10px] font-bold text-zinc-700 uppercase tracking-widest`}>
                    {prompt.length} {t.main.chars}
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
                          <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <MonitorPlay className="w-4 h-4 text-purple-500" />
                            {t.main.targetAudience}
                          </label>
                          <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-none px-5 py-4 text-sm font-semibold focus:border-purple-600 outline-none transition-all appearance-none uppercase tracking-tight"
                            disabled={isGenerating}
                          >
                            {Object.entries(t.audiences).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            {t.main.voiceTone}
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-none px-5 py-4 text-sm font-semibold focus:border-purple-600 outline-none transition-all appearance-none uppercase tracking-tight"
                            disabled={isGenerating}
                          >
                            {Object.entries(t.tones).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <Layers className="w-4 h-4 text-purple-500" />
                            {t.main.complexity}
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
                            <span className="text-sm font-semibold text-purple-500 w-8 text-center">{numSkills}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-6">
                  {(prompt || currentProject) && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        handleReset();
                      }}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-3 bg-zinc-900 text-zinc-400 px-6 py-3 font-bold uppercase tracking-widest text-[9px] hover:text-white hover:bg-zinc-800 transition-all border-2 border-zinc-800 w-full sm:w-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t.main.resetSystem}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    onClick={() => playClickSound()}
                    className="flex items-center justify-center gap-4 bg-purple-600 text-white px-8 py-3 font-bold uppercase tracking-[0.2em] text-xs hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] active:scale-95 w-full sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.main.architecting}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t.main.executeGeneration}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <LoadingState key="loading-state" lang={lang} generationStage={generationStage} />
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
                      <div className="absolute -left-10 -top-10 text-8xl font-bold opacity-[0.02] select-none pointer-events-none italic uppercase">
                        {t.main.nav}
                      </div>
                      
                      <div className="mb-8 pb-8 border-b border-zinc-900 relative z-10">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic mb-6 leading-tight">{currentProject.title}</h3>
                        <div className="flex flex-col gap-3">
                          {currentProject.id ? (
                            <button
                              onClick={saveProjectToFirebase}
                              disabled={isGenerating || isSaving || saveSuccess}
                              className={`flex items-center justify-center gap-3 py-4 px-6 font-bold uppercase tracking-widest text-[10px] transition-all ${
                                saveSuccess 
                                  ? 'bg-emerald-600/10 text-emerald-500 border-2 border-emerald-600/30' 
                                  : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:text-white hover:border-purple-600'
                              }`}
                            >
                              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                              {saveSuccess ? t.main.archived : (lang === 'en' ? 'SAVE CHANGES' : 'שמור שינויים')}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (!user) {
                                  showNotification(lang === 'en' ? 'Please sign in to archive projects.' : 'אנא התחבר כדי לשמור פרויקטים בארכיון.', 'error');
                                  return;
                                }
                                setCustomTitle(currentProject.title);
                                setIsSaveModalOpen(true);
                              }}
                              disabled={isGenerating || isSaving || saveSuccess}
                              className={`flex items-center justify-center gap-3 py-4 px-6 font-bold uppercase tracking-widest text-[10px] transition-all ${
                                saveSuccess 
                                  ? 'bg-emerald-600/10 text-emerald-500 border-2 border-emerald-600/30' 
                                  : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:text-white hover:border-purple-600'
                              }`}
                            >
                              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                              {saveSuccess ? t.main.archived : t.main.archiveProject}
                            </button>
                          )}
                          <button
                            onClick={() => downloadAllAsZip(currentProject)}
                            className="flex items-center justify-center gap-3 bg-purple-600 text-white py-4 px-6 font-bold uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                          >
                            <FileArchive className="w-4 h-4" />
                            {t.main.downloadAsset}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
                        <div className="mb-8 space-y-2">
                          {[
                            { id: 'skills', label: t.main.phases, icon: <Layers className="w-4 h-4" /> },
                            { id: 'detailedPrompt', label: t.main.blueprint, icon: <Terminal className="w-4 h-4" /> },
                            { id: 'systemOptimization', label: t.main.strategy, icon: <Settings2 className="w-4 h-4" /> },
                            { id: 'skillChain', label: t.main.roadmap, icon: <Code2 className="w-4 h-4" /> },
                            { id: 'masterSkill', label: t.main.orchestrator, icon: <Wand2 className="w-4 h-4" /> },
                            { id: 'executionGuide', label: t.main.executionGuide, icon: <Sparkles className="w-4 h-4" /> },
                            { id: 'fullView', label: t.main.fullProjectView, icon: <MonitorPlay className="w-4 h-4" /> }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveResultView(item.id as any)}
                              className={`w-full text-left p-4 font-bold uppercase tracking-widest text-[10px] transition-all border-2 ${
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
                            <div className={`absolute inset-y-0 ${lang === 'en' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                              <Search className="h-4 w-4 text-zinc-600" />
                            </div>
                            <input
                              type="text"
                              placeholder={t.main.filterPhases}
                              value={skillSearchQuery}
                              onChange={(e) => setSkillSearchQuery(e.target.value)}
                              className={`w-full bg-zinc-900 border-2 border-zinc-800 ${lang === 'en' ? 'pl-12 pr-4' : 'pr-12 pl-4'} py-3 text-[10px] font-bold tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700`}
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
                              <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-purple-500 mb-2">Phase {index + 1}</div>
                              <div className={`text-xs font-bold uppercase tracking-tight leading-tight mb-3 ${
                                selectedSkill?.id === skill.id ? 'text-white' : 'text-zinc-500'
                              }`}>
                                {skill.title}
                              </div>
                              {skill.tags && skill.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {skill.tags.map(tag => (
                                    <span key={tag} className={`text-[8px] px-2 py-1 font-bold uppercase tracking-widest ${
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
                  <div className="flex-1 bg-white border-2 border-zinc-200 flex flex-col overflow-hidden relative shadow-2xl">
                    <div className="absolute -right-20 -bottom-20 text-[20rem] font-bold opacity-[0.03] select-none pointer-events-none italic uppercase hidden sm:block text-zinc-100">
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
                              <div className="p-4 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                                <div className="flex items-center gap-4 sm:gap-6">
                                  <div className="p-3 sm:p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                    {getIconForSkill(selectedSkill.title)}
                                  </div>
                                  <div>
                                    <h2 className="text-xl sm:text-3xl font-bold text-black uppercase tracking-tighter italic leading-none mb-2 sm:mb-3">{selectedSkill.title}</h2>
                                    <div className="flex items-center gap-4">
                                      <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{t.main.technicalSpec}</p>
                                      {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                                        <div className="hidden sm:flex items-center gap-2">
                                          <div className="w-1 h-1 bg-purple-500"></div>
                                          {selectedSkill.tags.map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-1 bg-purple-600/10 text-purple-600 font-bold uppercase tracking-widest">
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
                                  className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-2 sm:py-3 px-4 sm:px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                                >
                                  <FileArchive className="w-4 h-4" />
                                  <span className="hidden sm:inline">{t.main.download}</span>
                                </button>
                              </div>
                              
                              <div className="p-6 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar relative bg-white">
                                {isRefining && (
                                  <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-6 bg-white p-12 border-2 border-purple-600/30 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                        <Wand2 className="w-8 h-8 animate-pulse" />
                                      </div>
                                      <div className="text-center space-y-2">
                                        <p className="font-bold text-black uppercase tracking-widest text-sm italic">{t.main.refiningArch}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">{t.main.applyingAdjustments}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <ReactMarkdown>{selectedSkill.content}</ReactMarkdown>
                              </div>

                              {/* Refinement Area */}
                              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                                <div className="flex gap-4">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={refinementPrompt}
                                      onChange={(e) => setRefinementPrompt(e.target.value)}
                                      dir={/[\u0590-\u05FF]/.test(refinementPrompt) ? 'rtl' : 'ltr'}
                                      placeholder={t.main.describeRefinement}
                                      className="w-full bg-white border-2 border-zinc-200 px-6 py-4 text-[10px] font-bold tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-300 text-black"
                                      disabled={isRefining}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && refinementPrompt.trim() && !isRefining) {
                                          handleRefine();
                                        }
                                      }}
                                    />
                                    {isRefining && (
                                      <div className={`absolute ${lang === 'en' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`}>
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleRefine}
                                    disabled={!refinementPrompt.trim() || isRefining}
                                    className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-purple-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                    {isRefining ? t.main.refining : t.main.applyRefinement}
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-200 p-12 text-center">
                              <Code2 className="w-24 h-24 mb-8 opacity-10" />
                              <p className="font-bold uppercase tracking-[0.3em] text-sm italic text-zinc-400">{t.main.selectPhase}</p>
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
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Terminal className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.blueprint}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.masterImplementation}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.detailedPrompt || '', 'detailed_prompt.md')}
                              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-3 px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar bg-white">
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
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Settings2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.strategy}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.optimizationScaling}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.systemOptimization || '', 'system_optimization.md')}
                              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-3 px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar bg-white">
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
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Code2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.roadmap}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.skillChainLogic}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.skillChainOptimization || '', 'skill_chain_logic.md')}
                              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-3 px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar bg-white">
                            <ReactMarkdown>{currentProject.skillChainOptimization || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'masterSkill' ? (
                        <motion.div 
                          key="master-skill-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Wand2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.orchestrator}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.ultimateSystemLogic}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadContent(currentProject.masterSkill || '', 'master_skill.md')}
                              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-3 px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar bg-white">
                            <ReactMarkdown>{currentProject.masterSkill || ''}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : activeResultView === 'executionGuide' ? (
                        <motion.div 
                          key="execution-guide-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <Sparkles className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.executionGuide}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.guideTitle}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const protocol = `# Master Execution Guide / מדריך ביצוע ראשי

## 1. Initialize with Master Prompt / אתחול עם הנחיית העל
Copy the "Full-Stack Blueprint" (DETAILED_PROMPT.md) and feed it to your development environment to set up the core architecture.
העתק את "תוכנית העבודה המלאה" (DETAILED_PROMPT.md) והזן אותה לסביבת הפיתוח שלך כדי להקים את ארכיטקטורת הליבה.

## 2. Execute Skill Chain / ביצוע שרשרת המיומנויות
Follow the "Execution Roadmap" (SKILL_CHAIN_OPTIMIZATION.md) order. Apply each "Architectural Phase" one by one, ensuring dependencies are met.
עקוב אחר סדר "מפת הדרכים לביצוע" (SKILL_CHAIN_OPTIMIZATION.md). החל כל "שלב ארכיטקטוני" אחד אחד, תוך הבטחה שכל התלויות מתקיימות.

## 3. Apply Elite Optimizations / החלת אופטימיזציות עילית
Use the "Performance Strategy" (SYSTEM_OPTIMIZATION.md) to harden security, optimize speed, and ensure scalability.
השתמש ב"אסטרטגיית הביצועים" (SYSTEM_OPTIMIZATION.md) כדי להקשיח אבטחה, למטב מהירות ולהבטיח יכולת גדילה.

## 4. Finalize with Orchestrator / סיום עם המתזמר
Apply the "Master Orchestrator" (MASTER_SKILL.md) logic to connect all components into a cohesive, finished product.
החל את לוגיקת "מתזמר העל" (MASTER_SKILL.md) כדי לחבר את כל הרכיבים למוצר מוגמר ומלוכד.`;
                                downloadContent(protocol, 'execution_protocol.md');
                              }}
                              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border-2 border-zinc-100 py-3 px-6 hover:text-purple-600 hover:border-purple-600 transition-all"
                            >
                              <FileDown className="w-4 h-4" />
                              <span className="hidden sm:inline">Export .MD</span>
                            </button>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 custom-scrollbar bg-white space-y-16">
                            <div className="space-y-8">
                              <div className="flex items-center gap-4">
                                <div className="h-[2px] w-12 bg-purple-600"></div>
                                <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-purple-600">{t.main.guideTitle}</h2>
                              </div>
                              <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-3xl">
                                {lang === 'en' 
                                  ? 'Follow this elite protocol to transform your architectural specification into a production-ready system. Each step is designed to maintain system integrity and design excellence.'
                                  : 'עקוב אחר פרוטוקול עילית זה כדי להפוך את המפרט הארכיטקטוני שלך למערכת מוכנה לייצור. כל שלב תוכנן לשמור על שלמות המערכת ומצוינות עיצובית.'}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {[
                                { title: t.main.guideStep1, desc: t.main.guideStep1Desc, icon: <Terminal className="w-6 h-6" /> },
                                { title: t.main.guideStep2, desc: t.main.guideStep2Desc, icon: <Layers className="w-6 h-6" /> },
                                { title: t.main.guideStep3, desc: t.main.guideStep3Desc, icon: <Settings2 className="w-6 h-6" /> },
                                { title: t.main.guideStep4, desc: t.main.guideStep4Desc, icon: <Wand2 className="w-6 h-6" /> }
                              ].map((step, i) => (
                                <div key={i} className="p-8 bg-zinc-50 border-2 border-zinc-100 space-y-6 group hover:border-purple-600 transition-all">
                                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    {step.icon}
                                  </div>
                                  <div className="space-y-3">
                                    <h3 className="text-lg font-bold uppercase tracking-tight text-black">{step.title}</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="p-10 bg-black text-white space-y-6 relative overflow-hidden">
                              <div className="absolute -right-10 -bottom-10 text-[10rem] font-bold opacity-[0.05] select-none pointer-events-none italic uppercase">
                                ELITE
                              </div>
                              <div className="flex items-center gap-4 relative z-10">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em]">{t.main.technicalSpec}</h3>
                              </div>
                              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-2xl relative z-10">
                                {lang === 'en' 
                                  ? 'This protocol ensures that every architectural component is implemented in the correct sequence, maintaining system integrity and elite design standards.'
                                  : 'פרוטוקול זה מבטיח שכל רכיב ארכיטקטוני ייושם ברצף הנכון, תוך שמירה על שלמות המערכת וסטנדרטים של עיצוב עילית.'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="full-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col h-full relative z-10"
                        >
                          <div className="p-8 sm:p-10 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                <MonitorPlay className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-semibold text-black uppercase tracking-tighter italic leading-none mb-3">{t.main.fullProjectView}</h2>
                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">{t.main.allComponents}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-10 sm:p-12 overflow-y-auto flex-1 markdown-body custom-scrollbar bg-white space-y-20">
                            <section>
                              <h1>{currentProject.title}</h1>
                              <p className="italic text-zinc-500">{currentProject.prompt}</p>
                            </section>

                            <section>
                              <h2>{t.main.blueprint}</h2>
                              <ReactMarkdown>{currentProject.detailedPrompt || ''}</ReactMarkdown>
                            </section>

                            <section>
                              <h2>{t.main.phases}</h2>
                              {currentProject.skills.map((skill, idx) => (
                                <div key={skill.id} className="mt-12 pt-12 border-t border-zinc-100">
                                  <h3>Phase {idx + 1}: {skill.title}</h3>
                                  <ReactMarkdown>{skill.content}</ReactMarkdown>
                                </div>
                              ))}
                            </section>

                            <section>
                              <h2>{t.main.strategy}</h2>
                              <ReactMarkdown>{currentProject.systemOptimization || ''}</ReactMarkdown>
                            </section>

                            <section>
                              <h2>{t.main.roadmap}</h2>
                              <ReactMarkdown>{currentProject.skillChainOptimization || ''}</ReactMarkdown>
                            </section>

                            <section>
                              <h2>{t.main.orchestrator}</h2>
                              <ReactMarkdown>{currentProject.masterSkill || ''}</ReactMarkdown>
                            </section>
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
                <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-purple-500">{t.header.library}</h2>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative w-full sm:w-80">
                  <div className={`absolute inset-y-0 ${lang === 'en' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                    <Search className="h-4 w-4 text-zinc-600" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.main.searchArchive}
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    className={`w-full bg-zinc-900 border-2 border-zinc-800 ${lang === 'en' ? 'pl-12 pr-4' : 'pr-12 pl-4'} py-3 text-[10px] font-bold tracking-widest focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700`}
                  />
                </div>
                {savedProjects.length > 0 && (
                  <button
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 bg-red-500/5 border-2 border-red-500/20 py-3 px-6 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.main.purgeAll}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {savedProjects.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-40 text-zinc-800 bg-black border-2 border-zinc-900 relative overflow-hidden">
                  <div className="absolute inset-0 text-[15rem] font-bold opacity-[0.01] select-none pointer-events-none italic uppercase flex items-center justify-center">
                    {t.main.emptyArchive}
                  </div>
                  <div className="w-24 h-24 bg-zinc-900 flex items-center justify-center mb-8 border-2 border-zinc-800 relative z-10">
                    <FileArchive className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic mb-3 relative z-10">{t.main.noArchivedProjects}</h3>
                  <p className="max-w-xs text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 relative z-10">{t.main.archivedWillAppear}</p>
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
                  <p className="font-bold uppercase tracking-widest text-xs italic">{t.main.noProjectsFound} "{projectSearchQuery}"</p>
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
                    <div className="absolute -right-6 -top-6 text-6xl font-bold opacity-[0.03] select-none pointer-events-none italic uppercase group-hover:opacity-10 transition-opacity">
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
                        <span className="text-[9px] font-bold text-purple-500 bg-purple-600/10 px-3 py-1 uppercase tracking-widest border border-purple-600/20">
                          {project.skills.length} {t.main.phasesCount}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white uppercase tracking-tighter italic mb-4 line-clamp-2 group-hover:text-purple-500 transition-colors">{project.title}</h3>
                    <p className="text-xs font-medium text-zinc-500 line-clamp-3 mb-6 flex-1 leading-relaxed uppercase tracking-tight">
                      {project.prompt}
                    </p>
                    
                    {(() => {
                      const allTags = Array.from(new Set(project.skills.flatMap(s => s.tags || []))).slice(0, 3);
                      if (allTags.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {allTags.map(tag => (
                              <span key={tag} className="text-[8px] px-2 py-1 bg-zinc-900 text-zinc-600 font-semibold uppercase tracking-widest border border-zinc-800">
                                {tag}
                              </span>
                            ))}
                            {new Set(project.skills.flatMap(s => s.tags || [])).size > 3 && (
                              <span className="text-[8px] px-2 py-1 bg-black text-zinc-700 font-semibold uppercase tracking-widest">
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
                        <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.2em]">
                          {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString(lang === 'en' ? 'en-US' : 'he-IL', { month: 'short', day: 'numeric', year: 'numeric' }) : t.main.justNow}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-black border-2 border-zinc-900 w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-bold opacity-[0.02] select-none pointer-events-none italic uppercase">
                KEY
              </div>
              
              <div className="p-6 sm:p-10 border-b border-zinc-900 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 sm:gap-6">
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white transition-all sm:hidden"
                    title="Back"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="p-3 sm:p-4 bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    <Key className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-semibold text-white uppercase tracking-tighter italic leading-none">{t.modals.apiConfig}</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 bg-zinc-900 border-2 border-zinc-800 text-zinc-500 hover:text-white hover:border-purple-600 transition-all hidden sm:block"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSaveApiKey} className="p-6 sm:p-10 space-y-8 sm:space-y-10 relative z-10">
                  <div className="bg-purple-600/5 p-6 sm:p-8 border-2 border-purple-600/20 space-y-6">
                    <h3 className="text-[10px] font-semibold text-purple-500 flex items-center gap-3 uppercase tracking-[0.3em]">
                      <AlertCircle className="w-5 h-5" />
                      {t.modals.setupGuide}
                    </h3>
                    <ol className="text-[10px] sm:text-[11px] text-zinc-500 space-y-4 font-semibold uppercase tracking-widest leading-relaxed">
                      {t.modals.guideSteps.map((step: string, idx: number) => (
                        <li key={idx} className="flex gap-4">
                          <span className="text-purple-500">0{idx + 1}.</span> 
                          <span className="flex-1">
                            {idx === 0 ? (
                              <>Access <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-purple-500">Google AI Studio</a></>
                            ) : step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">
                      {t.modals.geminiKey}
                    </label>
                    <input
                      type="password"
                      value={manualApiKey}
                      onChange={(e) => {
                        setManualApiKey(e.target.value);
                        setKeyValidationStatus('idle');
                      }}
                      placeholder={t.modals.enterSecret}
                      className={`w-full bg-zinc-900 border-2 px-6 py-5 text-[10px] font-semibold uppercase tracking-widest outline-none transition-all placeholder:text-zinc-800 ${
                        keyValidationStatus === 'error' 
                          ? 'border-red-500 focus:border-red-500' 
                          : keyValidationStatus === 'success'
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-zinc-800 focus:border-purple-600'
                      }`}
                    />
                    {keyValidationStatus === 'error' && (
                      <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {t.modals.validationFailed}
                      </p>
                    )}
                    {keyValidationStatus === 'success' && (
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        {t.modals.systemOnline}
                      </p>
                    )}
                    <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest leading-relaxed">
                      {t.modals.keyStorageNote}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setKeyValidationStatus('idle');
                      }}
                      className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-3"
                      disabled={isValidatingKey}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t.modals.abort}
                    </button>
                    <button
                      type="submit"
                      disabled={isValidatingKey || !manualApiKey.trim()}
                      className={`flex-1 px-8 py-5 text-white font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-3 ${
                        keyValidationStatus === 'success'
                          ? 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                      }`}
                    >
                      {isValidatingKey ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.modals.validating}
                        </>
                      ) : keyValidationStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {t.modals.validated}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {t.modals.validateSave}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-xl w-full p-6 sm:p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-bold opacity-[0.02] select-none pointer-events-none italic uppercase">
                SAVE
              </div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white uppercase tracking-tighter italic">{t.modals.archiveProjectTitle}</h3>
                <button 
                  onClick={() => setIsSaveModalOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10">
                {t.modals.commitNote}
              </p>
              <div className="space-y-6 relative z-10">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">
                  {t.modals.projectDesignation}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t.modals.designationName}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 px-6 py-5 text-[10px] font-semibold tracking-widest text-white outline-none focus:border-purple-600 transition-all placeholder:text-zinc-800"
                  autoFocus
                />
              </div>
              <div className="flex gap-6 mt-10 relative z-10">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {t.modals.abort}
                </button>
                <button
                  onClick={saveProjectToFirebase}
                  disabled={!customTitle.trim() || isSaving}
                  className="flex-1 px-8 py-5 bg-purple-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-3"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.modals.confirmArchive}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-md w-full p-6 sm:p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-bold opacity-[0.02] select-none pointer-events-none italic uppercase">
                DEL
              </div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white uppercase tracking-tighter italic">{t.modals.purgeSpec}</h3>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                  }}
                  className="p-2 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10 leading-relaxed">
                {t.modals.purgeNote.replace('{title}', projectToDelete?.title || '')}
              </p>
              <div className="flex gap-6 relative z-10">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {t.modals.abort}
                </button>
                <button
                  onClick={deleteProject}
                  disabled={isDeleting}
                  className="flex-1 px-8 py-5 bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {t.modals.confirmPurge}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-zinc-900 max-w-md w-full p-6 sm:p-10 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-9xl font-bold opacity-[0.02] select-none pointer-events-none italic uppercase">
                ALL
              </div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white uppercase tracking-tighter italic text-red-500">{t.modals.totalPurge}</h3>
                <button 
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10 relative z-10 leading-relaxed">
                {t.modals.totalPurgeNote}
              </p>
              <div className="flex gap-6 relative z-10">
                <button
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 px-8 py-5 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-widest text-[10px] border-2 border-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {t.modals.abort}
                </button>
                <button
                  onClick={deleteAllProjects}
                  disabled={isDeleting}
                  className="flex-1 px-8 py-5 bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {t.modals.confirmTotalPurge}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Notifications */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-4 p-5 border-2 shadow-2xl backdrop-blur-xl ${
                notification.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' 
                  : notification.type === 'error'
                  ? 'bg-red-950/90 border-red-500/50 text-red-400'
                  : 'bg-zinc-900/90 border-zinc-700/50 text-zinc-300'
              }`}
            >
              <div className={`p-2 rounded-full ${
                notification.type === 'success' ? 'bg-emerald-500/20' : notification.type === 'error' ? 'bg-red-500/20' : 'bg-zinc-500/20'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest flex-1 leading-relaxed">
                {notification.message}
              </p>
              <button 
                onClick={() => setNotification(null)}
                className="p-2 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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

