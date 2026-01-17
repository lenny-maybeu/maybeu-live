import React from 'react';
import { LiveEvent, Language } from '../types';
import { QrCode, Trophy, Activity } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent | null;
  lang: Language;
}

const BigScreenView: React.FC<Props> = ({ activeEvent, lang }) => {
  if (!activeEvent || !activeEvent.isActive) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-pulse opacity-50 mb-8">
          <Activity size={120} />
        </div>
        <h1 className="text-6xl font-black tracking-tighter mb-4">Maybeu Live</h1>
        <p className="text-2xl text-slate-400 uppercase tracking-widest">
          {lang === 'ru' ? 'Ожидание подключения...' : 'Waiting for signal...'}
        </p>
      </div>
    );
  }

  // Экран ОЖИДАНИЯ (Показываем код для входа)
  if (activeEvent.currentStage === 'waiting') {
    return (
      <div className="h-screen w-screen bg-indigo-950 flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30')] bg-cover opacity-20"></div>
        <div className="z-10 text-center p-12 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-bold text-indigo-300 mb-6 uppercase tracking-widest">
            {lang === 'ru' ? 'Присоединяйтесь к игре' : 'Join the game'}
          </h2>
          <div className="text-9xl font-black mb-8 text-white tracking-widest font-mono">
            {activeEvent.code}
          </div>
          <div className="flex items-center justify-center gap-4 text-slate-300">
            <QrCode size={32} />
            <span className="text-xl">scan to join</span>
          </div>
        </div>
      </div>
    );
  }

  // Экран ВОПРОСА
  if (activeEvent.currentStage === 'quiz' && activeEvent.questions && activeEvent.questions.length > 0) {
    const question = activeEvent.questions[0];
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white p-12">
        <h2 className="text-5xl font-bold text-center mb-12 leading-tight max-w-5xl">
          {question.question}
        </h2>
        <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
          {question.options.map((opt, idx) => (
            <div key={idx} className="bg-slate-800 p-8 rounded-2xl text-3xl font-bold border-l-8 border-indigo-500 flex items-center shadow-lg">
              <span className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mr-6 text-2xl">
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Экран РЕЗУЛЬТАТА
  if (activeEvent.currentStage === 'results' && activeEvent.questions && activeEvent.questions.length > 0) {
    const question = activeEvent.questions[0];
    const correctOpt = question.options[question.correctAnswerIndex];
    return (
      <div className="h-screen w-screen bg-emerald-950 flex flex-col items-center justify-center text-white p-8">
        <Trophy size={120} className="text-yellow-400 mb-8 animate-bounce" />
        <h2 className="text-4xl font-bold text-emerald-300 mb-6 uppercase">
          {lang === 'ru' ? 'Правильный ответ' : 'Correct Answer'}
        </h2>
        <div className="bg-emerald-600 p-12 rounded-3xl text-6xl font-black shadow-2xl border-4 border-emerald-400">
          {correctOpt}
        </div>
      </div>
    );
  }

  return null;
};

export default BigScreenView;