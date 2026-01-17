import React from 'react';
import { LiveEvent, Language } from '../types';

interface Props {
  activeEvent: LiveEvent | null;
  lang: Language;
}

const CRMView: React.FC<Props> = ({ lang }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
      <h2 className="text-2xl font-bold mb-2">
        {lang === 'ru' ? 'CRM Система' : 'CRM System'}
      </h2>
      <p>
        {lang === 'ru' ? 'Этот раздел в разработке...' : 'Module under construction...'}
      </p>
    </div>
  );
};

export default CRMView;