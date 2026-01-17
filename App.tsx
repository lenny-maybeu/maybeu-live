
import React, { useState, useEffect } from 'react';
import { UserRole, LiveEvent, Language } from './types';
import HostDashboard from './components/HostDashboard';
import GuestPortal from './components/GuestPortal';
import BigScreenView from './components/BigScreenView';
import LandingPage from './components/LandingPage';
import { Settings, X, Globe, Home } from 'lucide-react';

const TRANSLATIONS = {
  ru: {
    host: 'Ведущий',
    guest: 'Гость',
    screen: 'Экран',
    settings: 'Настройки',
    language: 'Язык приложения',
    russian: 'Русский',
    english: 'English',
    close: 'Закрыть',
    sync: 'Cloud Sync',
    appTitle: 'Maybeu Live',
    exit: 'Выйти',
  },
  en: {
    host: 'Host',
    guest: 'Guest',
    screen: 'Screen',
    settings: 'Settings',
    language: 'App Language',
    russian: 'Русский',
    english: 'English',
    close: 'Close',
    sync: 'Cloud Sync',
    appTitle: 'Maybeu Live',
    exit: 'Exit',
  }
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeEvent, setActiveEvent] = useState<LiveEvent | null>(() => {
    const saved = localStorage.getItem('active_event');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>('ru');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleExit = () => {
    localStorage.removeItem('active_event');
    setRole(null);
    setActiveEvent(null);
  };

  const renderContent = () => {
    switch (role) {
      case 'HOST':
        return <HostDashboard setActiveEvent={setActiveEvent} activeEvent={activeEvent} lang={lang} />;
      case 'GUEST':
        return <GuestPortal activeEvent={activeEvent} lang={lang} />;
      case 'SCREEN':
        return <BigScreenView activeEvent={activeEvent} lang={lang} />;
      default:
        return <LandingPage onSelectRole={setRole} lang={lang} onLanguageChange={setLang} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {role && (
        <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex justify-between items-center sticky top-0 z-50 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleExit}>
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg italic shadow-lg shadow-indigo-500/20">M</div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">{t.appTitle}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={handleExit}
              className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-xl text-slate-400 transition-all flex items-center gap-2 px-3 py-1.5 font-bold text-xs uppercase"
            >
              <Home size={16} /> {t.exit}
            </button>
          </div>
        </nav>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings size={20} className="text-indigo-500" />
                {t.settings}
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                  <Globe size={14} /> {t.language}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setLang('ru')}
                    className={`py-3 rounded-xl font-bold transition-all border-2 ${lang === 'ru' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    {t.russian}
                  </button>
                  <button 
                    onClick={() => setLang('en')}
                    className={`py-3 rounded-xl font-bold transition-all border-2 ${lang === 'en' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    {t.english}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-slate-300 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {role && (
        <div className="fixed bottom-4 right-4 text-[10px] text-emerald-500 uppercase tracking-widest font-black flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          {t.sync}: CLOUD READY
        </div>
      )}
    </div>
  );
};

export default App;
