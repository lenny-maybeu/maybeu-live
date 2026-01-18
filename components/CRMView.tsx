import { FirebaseService } from '../services/firebase';
import React, { useState, useEffect } from 'react';
import { Download, Search, Trash2, User, Phone, Calendar, MessageSquare, Database } from 'lucide-react';
import { GuestRecord, Language } from '../types';

interface Props {
  lang: Language;
}

const TRANSLATIONS = {
  ru: {
    title: 'База клиентов',
    subtitle: 'Сбор контактов после мероприятий',
    search: 'Поиск по имени или телефону...',
    download: 'Скачать CSV',
    clear: 'Очистить базу',
    noData: 'База пуста. Контакты появятся здесь после завершения эфира.',
    cols: { name: 'Имя', contact: 'Контакты', bday: 'День рождения', notes: 'Отзыв / Заметки', date: 'Дата события' },
    total: 'Всего записей'
  },
  en: {
    title: 'CRM Database',
    subtitle: 'Collected contacts from events',
    search: 'Search by name or phone...',
    download: 'Download CSV',
    clear: 'Clear Database',
    noData: 'Database is empty. Contacts will appear here after event ends.',
    cols: { name: 'Name', contact: 'Contact', bday: 'Birthday', notes: 'Feedback', date: 'Date' },
    total: 'Total records'
  }
};

const CRMView: React.FC<Props> = ({ lang }) => {
  const [leads, setLeads] = useState<GuestRecord[]>([]);
  const [search, setSearch] = useState('');
  const t = TRANSLATIONS[lang];

  // ПОДПИСКА НА FIREBASE ВМЕСТО LOCALSTORAGE
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToLeads((data) => {
      // Firebase возвращает данные, мы их сразу кладем в стейт
      setLeads(data as GuestRecord[]);
    });

    // Отписываемся при выходе с экрана
    return () => unsubscribe();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.phone?.includes(search) || 
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = () => {
    if (leads.length === 0) return;
    
    // BOM для корректного отображения кириллицы в Excel
    const BOM = "\uFEFF"; 
    const headers = [t.cols.name, t.cols.contact, t.cols.bday, t.cols.notes, t.cols.date].join(';');
    const rows = leads.map(l => 
      `"${l.name}";"${l.phone || l.email}";"${l.birthday || ''}";"${l.notes || ''}";"${l.lastEventDate || ''}"`
    ).join('\n');

    const csvContent = BOM + headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maybeu_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (confirm(lang === 'ru' ? 'Вы уверены? Это удалит ВСЕ контакты из облака.' : 'Are you sure? This will delete ALL contacts from cloud.')) {
      FirebaseService.clearLeads();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white italic flex items-center gap-3">
               <Database className="text-indigo-500" /> {t.title}
            </h2>
            <p className="text-slate-400 font-bold mt-2">{t.subtitle}</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleClear}
               disabled={leads.length === 0}
               className="px-6 py-3 bg-slate-900 text-rose-500 border border-slate-800 hover:bg-rose-950/30 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all disabled:opacity-50"
             >
                <Trash2 size={16} /> <span className="hidden md:inline">{t.clear}</span>
             </button>
             <button 
               onClick={handleDownload}
               disabled={leads.length === 0}
               className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
             >
                <Download size={16} /> {t.download}
             </button>
          </div>
       </div>

       <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
          />
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                     <tr>
                        <th className="p-6">{t.cols.name}</th>
                        <th className="p-6">{t.cols.contact}</th>
                        <th className="p-6">{t.cols.bday}</th>
                        <th className="p-6">{t.cols.notes}</th>
                        <th className="p-6">{t.cols.date}</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {filteredLeads.map((lead, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                           <td className="p-6 font-bold text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                 <User size={14} />
                              </div>
                              {lead.name}
                           </td>
                           <td className="p-6 font-medium text-slate-300">
                              <div className="flex items-center gap-2">
                                 <Phone size={14} className="text-slate-600" />
                                 {lead.phone || lead.email || '-'}
                              </div>
                           </td>
                           <td className="p-6 font-medium text-slate-300">
                              {lead.birthday && (
                                 <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-600" />
                                    {lead.birthday}
                                 </div>
                              )}
                           </td>
                           <td className="p-6 font-medium text-slate-400 italic max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:break-words">
                              {lead.notes && (
                                 <div className="flex items-center gap-2">
                                    <MessageSquare size={14} className="text-slate-600 shrink-0" />
                                    {lead.notes.replace('Отзыв: ', '')}
                                 </div>
                              )}
                           </td>
                           <td className="p-6 font-bold text-slate-500 text-xs">
                              {lead.lastEventDate}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database size={32} className="text-slate-600" />
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-widest">{t.noData}</p>
            </div>
          )}
          <div className="bg-slate-950 p-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
             {t.total}: {leads.length}
          </div>
       </div>
    </div>
  );
};

export default CRMView;