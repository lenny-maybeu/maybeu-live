import React, { useState } from 'react';
import { LiveEvent, Language, GameType } from '../types';
import { updateGameState } from '../services/firebase';
import QuizControl from './QuizControl';
import { Settings, Play, StopCircle, Brain, ThumbsUp, Activity } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent | null;
  setActiveEvent: (event: LiveEvent | null) => void;
  lang: Language;
}

const HostDashboard: React.FC<Props> = ({ activeEvent, setActiveEvent, lang }) => {
  const [topic, setTopic] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameType>('quiz');

  const createEvent = () => {
    const newEvent: LiveEvent = {
      id: Date.now().toString(),
      title: topic || (lang === 'ru' ? 'Новое событие' : 'New Event'),
      isActive: true,
      currentStage: 'waiting',
      gameType: selectedMode,
      code: Math.floor(1000 + Math.random() * 9000).toString(),
      questions: []
    };
    setActiveEvent(newEvent);
    updateGameState(newEvent);
  };

  const stopEvent = () => {
    setActiveEvent(null);
    updateGameState(null);
  };

  if (activeEvent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-2xl font-bold text-white">{activeEvent.title}</h1>
               <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded border border-indigo-500/30 uppercase font-bold">
                 {activeEvent.gameType === 'believe_not' ? (lang === 'ru' ? 'Верю / Не верю' : 'Believe/Not') : 'Quiz'}
               </span>
            </div>
            <p className="text-emerald-400 text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
              LIVE — CODE: <span className="text-xl font-bold text-white">{activeEvent.code}</span>
            </p>
          </div>
          <button 
            onClick={stopEvent}
            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-rose-500/20"
          >
            <StopCircle size={20} />
            {lang === 'ru' ? 'Завершить' : 'Stop Event'}
          </button>
        </div>

        {/* Подключаем умный контроллер */}
        <QuizControl activeEvent={activeEvent} lang={lang} />
      </div>
    );
  }

  // Экран создания события (выбор режима)
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-2 text-white">
          {lang === 'ru' ? 'Панель Ведущего' : 'Host Dashboard'}
        </h2>
        <p className="text-slate-400 mb-8">
          {lang === 'ru' ? 'Выберите режим и тему игры' : 'Choose game mode and topic'}
        </p>

        {/* Выбор режима */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setSelectedMode('quiz')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMode === 'quiz' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
          >
            <Brain size={32} className={selectedMode === 'quiz' ? 'text-indigo-400' : ''} />
            <span className="font-bold">{lang === 'ru' ? 'Викторина' : 'Quiz'}</span>
          </button>

          <button 
            onClick={() => setSelectedMode('believe_not')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMode === 'believe_not' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
          >
            <ThumbsUp size={32} className={selectedMode === 'believe_not' ? 'text-indigo-400' : ''} />
            <span className="font-bold">{lang === 'ru' ? 'Верю / Не верю' : 'Fact Check'}</span>
          </button>
        </div>
        
        <input 
          type="text" 
          placeholder={lang === 'ru' ? 'Тема игры (например: История Таджикистана)' : 'Game topic...'}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        
        <button 
          onClick={createEvent}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-500/20"
        >
          <Play size={24} />
          {lang === 'ru' ? 'Запустить Игру' : 'Start Game'}
        </button>
      </div>
    </div>
  );
};

export default HostDashboard;