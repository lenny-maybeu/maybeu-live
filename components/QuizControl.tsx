import React, { useState } from 'react';
import { LiveEvent, Language } from '../types';
import { generateQuizQuestions, generateBelieveNotQuestions } from '../services/geminiService';
import { updateGameState } from '../services/firebase';
import { Brain, ArrowRight, Sparkles, HelpCircle, Check, Loader2 } from 'lucide-react';

interface Props {
  activeEvent: LiveEvent;
  lang: Language;
}

const QuizControl: React.FC<Props> = ({ activeEvent, lang }) => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');

  // Умная генерация в зависимости от режима
  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    
    let questions = [];
    
    // Если режим "Верю/Не верю" - вызываем соответствующую функцию ИИ
    if (activeEvent.gameType === 'believe_not') {
        questions = await generateBelieveNotQuestions(topic, lang, 3);
    } else {
        // Иначе обычный квиз
        questions = await generateQuizQuestions(topic, lang, 3);
    }
    
    const updatedEvent = {
      ...activeEvent,
      currentStage: 'quiz' as const, // переводим игру в стадию вопросов
      questions: questions
    };
    
    updateGameState(updatedEvent);
    setLoading(false);
  };

  const nextStage = (stage: 'voting' | 'results') => {
    updateGameState({ ...activeEvent, currentStage: stage });
  };

  // Если вопросы уже есть - показываем управление текущим вопросом
  if (activeEvent.questions && activeEvent.questions.length > 0) {
    const q = activeEvent.questions[0];
    return (
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            <HelpCircle />
            {lang === 'ru' ? 'Идет игра' : 'Game Active'}
            </h3>
            <span className="bg-slate-800 px-3 py-1 rounded text-sm text-slate-400">
                {activeEvent.gameType === 'believe_not' ? 'True/False' : 'Quiz Mode'}
            </span>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
            {lang === 'ru' ? 'Вопрос на экране' : 'On Screen'}
          </span>
          <p className="text-2xl font-bold text-white leading-relaxed">
            {q.question}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => nextStage('voting')}
               className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-xl font-bold text-white transition-all shadow-lg flex flex-col items-center gap-1"
             >
               <span className="text-lg">{lang === 'ru' ? 'Показать Варианты' : 'Show Options'}</span>
               <span className="text-xs opacity-70 font-normal">Шаг 1</span>
             </button>
             <button 
               onClick={() => nextStage('results')}
               className="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-xl font-bold text-white transition-all shadow-lg flex flex-col items-center gap-1"
             >
               <span className="text-lg">{lang === 'ru' ? 'Показать Ответ' : 'Show Answer'}</span>
               <span className="text-xs opacity-70 font-normal">Шаг 2</span>
             </button>
        </div>
      </div>
    );
  }

  // Если вопросов нет - показываем генератор
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <Sparkles className="text-purple-400" />
        {lang === 'ru' ? 'AI Генератор раунда' : 'AI Round Generator'}
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        {lang === 'ru' ? 'Введите тему, и ИИ придумает вопросы для текущего режима.' : 'Enter a topic and AI will generate questions.'}
      </p>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={lang === 'ru' ? 'Тема раунда (например: Спорт)' : 'Round topic...'}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 outline-none focus:border-purple-500 transition-all text-white"
        />
        <button 
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-8 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg shadow-purple-900/20"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </button>
      </div>
    </div>
  );
};

export default QuizControl;