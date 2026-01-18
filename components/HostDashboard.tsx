import { FirebaseService } from '../services/firebase';
import React, { useState, useEffect } from 'react';
import { LiveEvent, GameType, Language, TimingItem } from '../types';
import { Plus, Users, Calendar, Gamepad2, Database, ChevronRight, PlayCircle, X, Trash2, Edit2, MapPin, Clock, Briefcase, Info, Save, ListTodo, GripVertical, MonitorOff, MonitorCheck, AlertTriangle, Check } from 'lucide-react';
import QuizControl from './QuizControl';
import CRMView from './CRMView';

interface Props {
  activeEvent: LiveEvent | null;
  setActiveEvent: (event: LiveEvent | null) => void;
  lang: Language;
}

const TRANSLATIONS = {
  ru: {
    upcoming: 'События',
    create: 'Создать',
    manage: 'Игры',
    clients: 'База клиентов',
    infoTab: 'Планировщик',
    timingTab: 'Сценарий',
    eventsTab: 'Список',
    live: 'В ЭФИРЕ',
    soon: 'ОЖИДАНИЕ',
    guests: 'участников',
    code: 'Код',
    createTitle: 'Новое событие',
    editTitle: 'Редактировать',
    nameLabel: 'Название',
    dateLabel: 'Дата проведения',
    typeLabel: 'Тип',
    codeLabel: 'Код доступа',
    save: 'Сохранить',
    cancel: 'Отмена',
    goLive: 'ВЫЙТИ В ЭФИР',
    stopLive: 'ЗАВЕРШИТЬ ЭФИР',
    addStep: 'Добавить пункт',
    timePlaceholder: '18:00',
    endPlaceholder: '19:00',
    textPlaceholder: 'Начало велком-зоны',
    screenStatus: 'Проектор',
    screenReady: 'ПОДКЛЮЧЕН',
    screenOffline: 'ОФФЛАЙН',
    details: {
      location: 'Локация',
      notes: 'Заметки мероприятия',
      contacts: 'Важные контакты'
    }
  },
  en: {
    upcoming: 'Events',
    create: 'Create',
    manage: 'Games',
    clients: 'Customers',
    infoTab: 'Planner',
    timingTab: 'Timeline',
    eventsTab: 'List',
    live: 'LIVE',
    soon: 'PENDING',
    guests: 'guests',
    code: 'Code',
    createTitle: 'New Event',
    editTitle: 'Edit Event',
    nameLabel: 'Name',
    dateLabel: 'Event Date',
    typeLabel: 'Type',
    codeLabel: 'Access Code',
    save: 'Save',
    cancel: 'Cancel',
    goLive: 'GO LIVE',
    stopLive: 'STOP LIVE',
    addStep: 'Add Step',
    timePlaceholder: '6:00 PM',
    endPlaceholder: '7:00 PM',
    textPlaceholder: 'Welcome start',
    screenStatus: 'Screen',
    screenReady: 'CONNECTED',
    screenOffline: 'OFFLINE',
    details: {
      location: 'Location',
      notes: 'Event Notes',
      contacts: 'Key Contacts'
    }
  }
};

const HostDashboard: React.FC<Props> = ({ activeEvent, setActiveEvent, lang }) => {
  const [tab, setTab] = useState<'EVENTS' | 'GAMES' | 'CRM' | 'INFO' | 'TIMING'>('EVENTS');
  const [events, setEvents] = useState<LiveEvent[]>(() => {
    const saved = localStorage.getItem('mc_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
  const [formData, setFormData] = useState<Partial<LiveEvent>>({ name: '', type: 'PARTY', code: '', date: new Date().toISOString().split('T')[0] });
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isScreenConnected, setIsScreenConnected] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('mc_events', JSON.stringify(events));
  }, [events]);

  // --- ИСПРАВЛЕНИЕ: ТЕПЕРЬ КОД ВНУТРИ КОМПОНЕНТА ---
  useEffect(() => {
    // Если мы В ЭФИРЕ, отправляем данные в Firebase
    if (activeEvent && activeEvent.status === 'LIVE') {
      FirebaseService.syncEvent(activeEvent);
    }
  }, [activeEvent]); 
  // --------------------------------------------------

  // Sync monitoring
  useEffect(() => {
    const channel = new BroadcastChannel('maybeu_sync');
    let lastPulse = 0;
    
    channel.onmessage = (msg) => {
      if (msg.data.type === 'SCREEN_ALIVE') {
        lastPulse = msg.data.timestamp;
        setIsScreenConnected(true);
      }
    };

    const checkStatus = setInterval(() => {
      if (Date.now() - lastPulse > 2000) {
        setIsScreenConnected(false);
      }
    }, 1000);

    return () => {
      clearInterval(checkStatus);
      channel.close();
    };
  }, []);

  useEffect(() => {
    const checkGuests = () => {
      const counts: Record<string, number> = {};
      events.forEach(ev => {
        const reg = localStorage.getItem(`guest_registry_${ev.code}`);
        counts[ev.code] = reg ? JSON.parse(reg).length : 0;
      });
      setGuestCounts(counts);
    };
    checkGuests();
    const interval = setInterval(checkGuests, 2000);
    return () => clearInterval(interval);
  }, [events]);

  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...formData } as LiveEvent : e));
      if (activeEvent?.id === editingEvent.id) {
        const newActive = { ...activeEvent, ...formData } as LiveEvent;
        setActiveEvent(newActive);
        localStorage.setItem('active_event', JSON.stringify(newActive));
      }
    } else {
      const event: LiveEvent = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || 'Untitled',
        date: formData.date || new Date().toISOString().split('T')[0],
        code: formData.code || Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: formData.type as any || 'PARTY',
        status: 'UPCOMING',
        timetable: []
      };
      setEvents(prev => [event, ...prev]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({ name: '', type: 'PARTY', code: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (activeEvent?.id === id) {
      setActiveEvent(null);
      localStorage.removeItem('active_event');
    }
    setConfirmDeleteEventId(null);
  };

  const handleToggleLive = () => {
    if (!activeEvent) return;
    const isStopping = activeEvent.status === 'LIVE';
    const newStatus: 'UPCOMING' | 'LIVE' | 'COMPLETED' = isStopping ? 'COMPLETED' : 'LIVE';
    const updated: LiveEvent = { ...activeEvent, status: newStatus };
    setActiveEvent(updated);
    setEvents(prev => prev.map(e => e.id === activeEvent.id ? updated : e));
    localStorage.setItem('active_event', JSON.stringify(updated));

    // СИНХРОНИЗАЦИЯ ПРИ ПЕРЕКЛЮЧЕНИИ
    FirebaseService.syncEvent(updated);

    if (isStopping) {
      const currentGs = JSON.parse(localStorage.getItem('game_state') || '{}');
      localStorage.setItem('game_state', JSON.stringify({
        ...currentGs,
        isCollectingLeads: true,
        timestamp: Date.now()
      }));
    }
  };

  const updateDetail = (field: keyof LiveEvent, value: any) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, [field]: value };
    setActiveEvent(updated as LiveEvent);
    setEvents(prev => prev.map(e => e.id === activeEvent.id ? (updated as LiveEvent) : e));
    localStorage.setItem('active_event', JSON.stringify(updated));
  };

  const cascadeTimes = (list: TimingItem[]) => {
    const newList = [...list];
    for (let i = 0; i < newList.length - 1; i++) {
      if (newList[i].endTime) {
        newList[i+1].time = newList[i].endTime as string;
      }
    }
    return newList;
  };

  const addTimingStep = () => {
    if (!activeEvent) return;
    const lastStep = activeEvent.timetable?.[activeEvent.timetable.length - 1];
    const newItem: TimingItem = { 
      id: Date.now().toString(), 
      time: lastStep?.endTime || '', 
      endTime: '',
      text: '' 
    };
    updateDetail('timetable', [...(activeEvent.timetable || []), newItem]);
  };

  const updateTimingStep = (id: string, field: 'time' | 'endTime' | 'text', value: string) => {
    if (!activeEvent) return;
    let steps = [...(activeEvent.timetable || [])];
    const idx = steps.findIndex(item => item.id === id);
    if (idx === -1) return;

    steps[idx] = { ...steps[idx], [field]: value };
    steps = cascadeTimes(steps);
    updateDetail('timetable', steps);
  };

  const removeTimingStep = (id: string) => {
    if (!activeEvent) return;
    let steps = (activeEvent.timetable || []).filter(i => i.id !== id);
    steps = cascadeTimes(steps);
    updateDetail('timetable', steps);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    let list = [...(activeEvent?.timetable || [])];
    const item = list[draggedItemIndex];
    list.splice(draggedItemIndex, 1);
    list.splice(index, 0, item);
    list = cascadeTimes(list);

    setDraggedItemIndex(index);
    updateDetail('timetable', list);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="flex border-b border-slate-800 bg-slate-900/30 shrink-0 overflow-x-auto">
        <button onClick={() => setTab('EVENTS')} className={`flex-1 min-w-[60px] md:min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${tab === 'EVENTS' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>
          <Calendar size={18} className="inline md:mr-2" /> <span className="hidden md:inline">{t.eventsTab}</span>
        </button>
        <button onClick={() => setTab('INFO')} disabled={!activeEvent} className={`flex-1 min-w-[60px] md:min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors disabled:opacity-30 ${tab === 'INFO' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>
          <Info size={18} className="inline md:mr-2" /> <span className="hidden md:inline">{t.infoTab}</span>
        </button>
        <button onClick={() => setTab('TIMING')} disabled={!activeEvent} className={`flex-1 min-w-[60px] md:min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors disabled:opacity-30 ${tab === 'TIMING' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>
          <ListTodo size={18} className="inline md:mr-2" /> <span className="hidden md:inline">{t.timingTab}</span>
        </button>
        <button onClick={() => setTab('GAMES')} disabled={!activeEvent} className={`flex-1 min-w-[60px] md:min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors disabled:opacity-30 ${tab === 'GAMES' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>
          <Gamepad2 size={18} className="inline md:mr-2" /> <span className="hidden md:inline">{t.manage}</span>
        </button>
        <button onClick={() => setTab('CRM')} className={`flex-1 min-w-[60px] md:min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${tab === 'CRM' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}>
          <Database size={18} className="inline md:mr-2" /> <span className="hidden md:inline">{t.clients}</span>
        </button>
      </div>

      {/* Sync Status Bar */}
      <div className="bg-slate-900/50 px-6 py-2 border-b border-slate-800 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               {isScreenConnected ? <MonitorCheck size={14} className="text-emerald-500" /> : <MonitorOff size={14} className="text-slate-600" />}
               <span className={`text-[9px] font-black uppercase tracking-widest ${isScreenConnected ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {t.screenStatus}: {isScreenConnected ? t.screenReady : t.screenOffline}
               </span>
            </div>
         </div>
         {activeEvent && (
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
               ID: {activeEvent.id}
            </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {tab === 'EVENTS' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-3xl font-black text-white italic tracking-tighter">{t.upcoming}</h2>
              <button 
                type="button"
                onClick={() => { setEditingEvent(null); setFormData({ name: '', type: 'PARTY', code: '', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }} 
                className="bg-white text-indigo-900 w-12 h-12 md:w-auto md:px-6 md:py-2.5 rounded-xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={24} /> <span className="hidden md:inline">{t.create}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {events.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl opacity-30 italic font-bold uppercase tracking-widest">
                  Нет запланированных событий
                </div>
              ) : events.map(event => (
                <div 
                  key={event.id}