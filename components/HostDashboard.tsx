import React, { useState } from 'react';
import { LiveEvent, Language } from '../types';
import { updateGameState } from '../services/firebase';
import QuizControl from './QuizControl';
import { Settings, Play, StopCircle } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent | null;
  setActiveEvent: (event: LiveEvent | null) => void;
  lang: Language;
}

const HostDashboard: React.FC<Props> = ({ activeEvent, setActiveEvent, lang }) => {
  const [topic, setTopic] = useState('');

  const createEvent = () => {
    const newEvent: LiveEvent = {
      id: Date.now().toString(),
      title: topic || 'New Event',
      isActive: true,
      currentStage: 'waiting',
      code: Math.floor(1000 + Math.random() * 9000).toString(), // Простой код
      questions: []
    };
    setActiveEvent(newEvent); // Обновляем локально
    updateGameState(newEvent); // Отправляем в базу
  };

  const stopEvent = () => {
    setActiveEvent(null);
    updateGameState(null);
  };

  if (activeEvent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{activeEvent.title}</h1>
            <p className="text-emerald-400 text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
              LIVE — CODE: {activeEvent.code}
            </p>
          </div>
          <button 
            onClick={stopEvent}
            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <StopCircle size={18} />
            {lang === 'ru' ? 'Завершить' : 'Stop'}
          </button>
        </div>

        <QuizControl activeEvent={activeEvent} lang={lang} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
          <Settings size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {lang === 'ru' ? 'Панель Ведущего' : 'Host Dashboard'}
        </h2>
        <p className="text-slate-400 mb-6">
          {lang === 'ru' ? 'Создайте событие, чтобы начать управлять экраном' : 'Create an event to control the screen'}
        </p>
        
        <input 
          type="text" 
          placeholder={lang === 'ru' ? 'Название мероприятия...' : 'Event title...'}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        
        <button 
          onClick={createEvent}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Play size={20} />
          {lang === 'ru' ? 'Создать Событие' : 'Create Event'}
        </button>
      </div>
    </div>
  );
};

export default HostDashboard;