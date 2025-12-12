import React, { useState, useEffect } from 'react';
import { 
  FileText, Activity, Link as LinkIcon, Edit3, 
  Upload, ArrowRight, Home, LayoutGrid, FileClock, User,
  ShieldAlert, FileSearch, Pill, FileBarChart, Zap, AlertTriangle, Utensils, CheckSquare,
  Loader2, XCircle, ChevronRight, Settings, Bell, Heart
} from 'lucide-react';
import { analyzeHealthData } from './services/geminiService';
import { InputType, ToolId, AnalysisResult } from './types';
import ResultsView from './components/ResultsView';

// --- Mock Views for Meds & Profile ---
const MedsView = () => (
  <div className="p-4 space-y-6 pt-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="flex items-center justify-between mb-2">
       <h2 className="text-2xl font-bold text-gray-800">My Medications</h2>
       <button className="text-sm text-medical-blue font-medium">+ Add</button>
    </div>
    
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-medical-blue">
            <Pill size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Amoxicillin</h3>
            <p className="text-sm text-gray-500">500mg • 2x Daily (Morning/Night)</p>
          </div>
        </div>
        <div className="text-right">
           <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
        </div>
      </div>

       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-full text-orange-500">
            <Utensils size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Vitamin D3</h3>
            <p className="text-sm text-gray-500">1000 IU • 1x Daily (After meal)</p>
          </div>
        </div>
        <div className="text-right">
           <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
        </div>
      </div>
    </div>
    
    <div className="bg-blue-50 rounded-xl p-4 flex gap-3 border border-blue-100">
       <Activity className="text-medical-blue shrink-0" />
       <p className="text-sm text-blue-800 font-medium">Keep your medication list updated for better AI analysis accuracy.</p>
    </div>
  </div>
);

const ProfileView = () => (
  <div className="p-4 space-y-6 pt-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-medical-blue to-blue-600 opacity-10"></div>
        <div className="relative">
           <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto mb-3 shadow-md">
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                 <User size={40} />
              </div>
           </div>
           <h2 className="text-xl font-bold text-gray-800">Guest Patient</h2>
           <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
             <span className="bg-gray-100 px-2 py-0.5 rounded">Age: --</span>
             <span className="bg-gray-100 px-2 py-0.5 rounded">Blood: --</span>
           </div>
        </div>
     </div>

     <div className="space-y-2">
        <h3 className="font-bold text-gray-800 ml-1 text-sm uppercase tracking-wide">Settings</h3>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
           <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
             <div className="flex items-center gap-3">
               <Bell size={18} className="text-gray-400" />
               <span className="text-gray-700 font-medium">Notifications</span>
             </div>
             <div className="w-10 h-6 bg-medical-blue rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div></div>
           </button>
           <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
             <div className="flex items-center gap-3">
               <Heart size={18} className="text-gray-400" />
               <span className="text-gray-700 font-medium">Health Data Sync</span>
             </div>
             <span className="text-gray-400 text-sm flex items-center gap-1">Off <ChevronRight size={16} /></span>
           </button>
           <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
             <div className="flex items-center gap-3">
               <Settings size={18} className="text-gray-400" />
               <span className="text-gray-700 font-medium">General Settings</span>
             </div>
             <ChevronRight size={16} className="text-gray-400" />
           </button>
        </div>
     </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState<InputType>('report');
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'meds' | 'profile'>('home');
  const [activeNav, setActiveNav] = useState<'home' | 'tools' | 'meds' | 'profile'>('home');

  // Input States
  const [symptomsInput, setSymptomsInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  
  const [recentAnalyses, setRecentAnalyses] = useState<{title: string, date: string, type: string}[]>([
    { title: "CBC Report Summary", date: "2 mins ago", type: "Summary" },
    { title: "Vitamin D Test", date: "Yesterday", type: "Key Findings" },
    { title: "Symptoms Review", date: "2 days ago", type: "General Info" }
  ]);

  useEffect(() => {
    setError(null);
  }, [activeTab, symptomsInput, urlInput, textInput, selectedFile]);

  // Handle Navigation
  const handleNavChange = (nav: 'home' | 'tools' | 'meds' | 'profile') => {
    setActiveNav(nav);
    if (nav === 'tools') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('analysis-tools');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setCurrentView(nav === 'home' ? 'home' : nav === 'meds' ? 'meds' : 'profile');
      if (nav === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnalyze = async (tool: ToolId = 'summary') => {
    setError(null);
    let content = '';
    
    switch (activeTab) {
      case 'report':
        if (selectedFile) {
          content = `[File Uploaded: ${selectedFile.name}] Content simulation: Patient shows signs of mild anemia with Hemoglobin at 11.5 g/dL. White blood cell count is normal. Reports fatigue and dizziness.`;
        } else {
          setError("Please upload a file to analyze.");
          return;
        }
        break;
      case 'symptoms':
        content = symptomsInput;
        break;
      case 'url':
        content = urlInput;
        break;
      case 'text':
        content = textInput;
        break;
    }

    if (!content.trim()) {
      setError("Please enter details or upload a file to proceed.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const resultText = await analyzeHealthData(content, activeTab, tool);
      
      if (resultText.startsWith("Error")) {
        setError(resultText); 
      } else {
        const newResult: AnalysisResult = {
          type: tool,
          content: resultText,
          timestamp: Date.now()
        };
        setCurrentResult(newResult);
        setRecentAnalyses(prev => [
          { 
            title: activeTab === 'report' ? 'Medical Report' : 'Health Analysis', 
            date: 'Just now', 
            type: tool.charAt(0).toUpperCase() + tool.slice(1) 
          },
          ...prev.slice(0, 2)
        ]);
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: InputType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 ${
        activeTab === id 
          ? 'border-medical-blue text-medical-blue bg-blue-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label === 'Report' ? 'Report' : label === 'Symptoms' ? 'Symp' : label}</span>
    </button>
  );

  const ToolButton = ({ id, label, icon: Icon, color }: { id: ToolId, label: string, icon: any, color: string }) => (
    <button 
      onClick={() => handleAnalyze(id)}
      disabled={isAnalyzing}
      className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-medical-blue/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className={`p-2.5 rounded-full bg-opacity-10 mb-2 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-medical-blue animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-800 font-semibold animate-pulse">Analyzing health data...</p>
        </div>
      )}

      {/* 1. Header */}
      <header className="bg-white sticky top-0 z-20 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => handleNavChange('home')}>
          <div className="bg-medical-blue p-1.5 rounded-lg shadow-sm shadow-blue-200 cursor-pointer">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight cursor-pointer">HealthAI <span className="text-medical-blue font-normal">Analyzer</span></h1>
        </div>
        <button 
          onClick={() => handleNavChange('profile')}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <User size={20} />
        </button>
      </header>

      <main className="max-w-xl mx-auto pt-4 px-4">
        {currentView === 'home' && (
          <div className="space-y-6 pb-24 animate-in fade-in zoom-in-95 duration-300">
            {/* 2. Input Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="flex border-b border-gray-100">
                <TabButton id="report" label="Report" icon={FileText} />
                <TabButton id="symptoms" label="Symptoms" icon={Activity} />
                <TabButton id="url" label="URL" icon={LinkIcon} />
                <TabButton id="text" label="Text" icon={Edit3} />
              </div>

              <div className="p-5">
                {activeTab === 'report' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-medical-blue/50 transition-all cursor-pointer relative group">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.png,.txt" />
                    <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-medical-blue" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {selectedFile ? selectedFile.name : "Upload Lab Report"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG detected</p>
                  </div>
                )}
                
                {activeTab === 'symptoms' && (
                  <textarea 
                    value={symptomsInput}
                    onChange={(e) => setSymptomsInput(e.target.value)}
                    placeholder="Describe your symptoms here... (e.g., 'I have had a high fever and dry cough for 3 days')"
                    className="w-full h-40 p-4 bg-white rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/10 resize-none text-gray-900 placeholder-gray-400 text-base transition-all outline-none"
                  />
                )}

                {activeTab === 'url' && (
                  <input 
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste link to medical article..."
                    className="w-full p-4 bg-white rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/10 text-gray-900 placeholder-gray-400 text-base transition-all outline-none"
                  />
                )}

                {activeTab === 'text' && (
                  <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste any health text, doctor's notes, or diagnosis details here..."
                    className="w-full h-40 p-4 bg-white rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/10 resize-none text-gray-900 placeholder-gray-400 text-base transition-all outline-none"
                  />
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button 
                  onClick={() => handleAnalyze('summary')}
                  disabled={isAnalyzing}
                  className="mt-4 w-full bg-gradient-to-r from-medical-blue to-medical-dark hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isAnalyzing ? "Analyzing..." : <>ANALYZE HEALTH DATA <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </section>

            {/* 3. Quick Healthcare AI Tools */}
            <section id="analysis-tools" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analysis Tools</h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <ToolButton id="summary" label="Summary" icon={FileText} color="text-medical-blue" />
                <ToolButton id="risk" label="Risk" icon={ShieldAlert} color="text-red-500" />
                <ToolButton id="insights" label="Insights" icon={Zap} color="text-purple-500" />
                <ToolButton id="recommendations" label="Do's/Don'ts" icon={CheckSquare} color="text-green-600" />
                
                <ToolButton id="warning_signs" label="Warnings" icon={AlertTriangle} color="text-orange-500" />
                <ToolButton id="nutrition" label="Nutrition" icon={Utensils} color="text-indigo-500" />
                <ToolButton id="breakdown" label="Breakdown" icon={FileSearch} color="text-cyan-600" />
                <ToolButton id="compare" label="Compare" icon={FileBarChart} color="text-gray-600" />
              </div>
            </section>

            {/* 4. Recent Analyses */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Activity</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-50">
                {recentAnalyses.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-medical-blue transition-colors">
                      <FileClock size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-medical-blue transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.type} • {item.date}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-medical-blue transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        
        {currentView === 'meds' && <MedsView />}
        {currentView === 'profile' && <ProfileView />}
      </main>

      {/* Result Modal */}
      {currentResult && (
        <ResultsView result={currentResult} onClose={() => setCurrentResult(null)} />
      )}

      {/* 5. Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] h-[80px]">
        <button 
          onClick={() => handleNavChange('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeNav === 'home' ? 'text-medical-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home size={22} className={activeNav === 'home' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        
        <button 
          onClick={() => handleNavChange('tools')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeNav === 'tools' ? 'text-medical-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutGrid size={22} className={activeNav === 'tools' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Tools</span>
        </button>
        
        <div className="relative -top-6">
           <button 
            onClick={() => { 
              handleNavChange('home');
              setActiveTab('report'); 
            }}
            className="w-14 h-14 bg-gradient-to-br from-medical-blue to-medical-dark rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
           >
             <Upload size={24} />
           </button>
        </div>
        
        <button 
          onClick={() => handleNavChange('meds')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeNav === 'meds' ? 'text-medical-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Pill size={22} className={activeNav === 'meds' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Meds</span>
        </button>
        
        <button 
          onClick={() => handleNavChange('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeNav === 'profile' ? 'text-medical-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={22} className={activeNav === 'profile' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;