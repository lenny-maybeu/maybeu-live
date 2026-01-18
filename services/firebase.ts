import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, push, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC-vmOaMUz_fBFjltcxp6RyNvyMmAmdqJ0",
  authDomain: "maybeu-live.firebaseapp.com",
  databaseURL: "https://maybeu-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "maybeu-live",
  storageBucket: "maybeu-live.firebasestorage.app",
  messagingSenderId: "192864240880",
  appId: "1:192864240880:web:78fed94f46e3b19a2eae35",
  measurementId: "G-1BC95R85WM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const FirebaseService = {
  // --- СОБЫТИЯ (Для HostDashboard) ---
  // Когда ведущий меняет что-то, мы сохраняем это в облако
  syncEvent: (event: any) => {
    if (!event) return;
    // Сохраняем как "активное событие" для всех
    set(ref(db, 'currentEvent'), event);
  },

  // --- ИГРА (Для QuizControl) ---
  syncGameState: (state: any) => {
    set(ref(db, 'gameState'), { ...state, timestamp: Date.now() });
  },

  // --- ГОСТИ (Для GuestPortal) ---
  // Гость ищет событие по коду
  findEventByCode: async (code: string) => {
    const snapshot = await get(ref(db, 'currentEvent'));
    const event = snapshot.val();
    if (event && event.code === code) return event;
    return null;
  },

  joinEvent: (guestName: string) => {
    const id = guestName.replace(/[^a-zA-Z0-9]/g, '');
    set(ref(db, `guests/${id}`), { name: guestName, online: true, timestamp: Date.now() });
  },

  // --- ЭКРАН (Для BigScreen) ---
  subscribeToEverything: (
    onEvent: (e: any) => void, 
    onGame: (g: any) => void, 
    onGuests: (c: number) => void
  ) => {
    onValue(ref(db, 'currentEvent'), (s) => onEvent(s.val()));
    onValue(ref(db, 'gameState'), (s) => onGame(s.val()));
    onValue(ref(db, 'guests'), (s) => onGuests(s.size));
  },

  // --- ИНТЕРАКТИВЫ ---
  sendPush: (guestName: string, count: number) => {
    update(ref(db, 'race'), { [guestName]: count });
  },

  subscribeToRace: (cb: (data: any) => void) => {
    onValue(ref(db, 'race'), (s) => cb(s.val()));
  },
  
  sendAnswer: (guestName: string, answerIdx: number) => {
      push(ref(db, 'answers'), { guestName, answerIdx });
  },
  
  subscribeToAnswers: (cb: (data: any) => void) => {
      onValue(ref(db, 'answers'), (s) => cb(s.val()));
  },

  sendImage: (url: string, user: string) => {
      push(ref(db, 'images'), { url, user });
  },

  subscribeToImages: (cb: (data: any) => void) => {
      onValue(ref(db, 'images'), (s) => cb(s.val()));
  }
};