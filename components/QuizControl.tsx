import React, { useState } from 'react';
import { LiveEvent, Language } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { updateGameState } from '../services/firebase';
import { Brain, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent;
  lang: Language;
}

const QuizControl: React.FC<Props> = ({ activeEvent, lang }) => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    // Генерируем вопросы через ИИ
    const questions = await generateQuizQuestions(topic, lang, 3);
    
    // Обновляем событие новыми вопросами
    const updatedEvent = {
      ...activeEvent,
      currentStage: 'quiz' as const,
      questions: questions
    };
    
    // Отправляем в базу
    updateGameState(updatedEvent);
    setLoading(false);
  };

  const nextStage = (stage: 'voting' | 'results') => {
    updateGameState({ ...activeEvent, currentStage: stage });
  };

  if (activeEvent.questions && activeEvent.questions.length > 0) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="text-indigo-400" />
          {lang === 'ru' ? 'Управление Квизом' : 'Quiz Control'}
        </h3>
        
        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {lang === 'ru' ? 'Текущий вопрос' : 'Current Question'}
            </span>
            <p className="font-medium mt-1">
              {activeEvent.questions[0].question}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
             <button 
               onClick={() => nextStage('voting')}
               className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl font-bold text-sm transition-colors"
             >
               {lang === 'ru' ? 'Показать Варианты' : 'Show Options'}
             </button>
             <button 
               onClick={() => nextStage('results')}
               className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl font-bold text-sm transition-colors"
             >
               {lang === 'ru' ? 'Показать Ответ' : 'Show Answer'}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Brain className="text-purple-400" />
        {lang === 'ru' ? 'Генератор AI Квиза' : 'AI Quiz Generator'}
      </h3>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={lang === 'ru' ? 'Тема вопросов (например: Кино 90х)' : 'Quiz topic...'}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
        />
        <button 
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </button>
      </div>
    </div>
  );
};

export default QuizControl;