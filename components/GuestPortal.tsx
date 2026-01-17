import React from 'react';
import { LiveEvent, Language } from '../types';
import { User, Check } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent | null;
  lang: Language;
}

const GuestPortal: React.FC<Props> = ({ activeEvent, lang }) => {
  if (!activeEvent || !activeEvent.isActive) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">
          {lang === 'ru' ? 'Ждем ведущего...' : 'Waiting for host...'}
        </h2>
        <p className="text-slate-500 text-sm">
          {lang === 'ru' ? 'Игра скоро начнется' : 'Game will start soon'}
        </p>
      </div>
    );
  }

  if (activeEvent.currentStage === 'waiting') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-indigo-950 text-white">
        <h1 className="text-4xl font-black mb-2">{activeEvent.code}</h1>
        <p className="text-indigo-300 uppercase tracking-widest text-xs font-bold mb-8">
          {lang === 'ru' ? 'Вы в игре!' : 'You are in!'}
        </p>
        <div className="w-full max-w-xs bg-indigo-900/50 p-6 rounded-2xl border border-indigo-500/30">
          <p className="text-center text-indigo-200">
            {lang === 'ru' ? 'Смотрите на большой экран' : 'Look at the big screen'}
          </p>
        </div>
      </div>
    );
  }

  if (activeEvent.currentStage === 'quiz' && activeEvent.questions && activeEvent.questions.length > 0) {
    const question = activeEvent.questions[0];
    return (
      <div className="min-h-screen p-4 flex flex-col justify-end pb-12">
        <div className="mb-auto pt-8">
           <h3 className="text-white text-xl font-bold leading-snug">
             {question.question}
           </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, idx) => (
            <button key={idx} className="bg-slate-800 hover:bg-indigo-600 text-white p-6 rounded-xl font-bold text-lg transition-all text-left flex items-center justify-between group active:scale-95">
              <span>{opt}</span>
              <div className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-white group-hover:bg-white/20"></div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeEvent.currentStage === 'results') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-emerald-900 text-white">
        <div className="bg-emerald-500 rounded-full p-6 mb-6">
          <Check size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {lang === 'ru' ? 'Время вышло!' : 'Time is up!'}
        </h2>
      </div>
    );
  }

  return null;
};

export default GuestPortal;