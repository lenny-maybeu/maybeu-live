import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, update, remove } from "firebase/database";
import { LiveEvent } from "../types";

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

// Тип для функции отписки
type Unsubscribe = () => void;

export class FirebaseService {
  
  // --- STATE ---
  // Возвращаем функцию отписки (Unsubscribe), чтобы useEffect не падал
  static subscribeToGameState(callback: (data: any) => void): Unsubscribe {
    const unsub = onValue(ref(db, 'gameState'), (snapshot) => callback(snapshot.val()));
    return unsub; 
  }

  // Принимаем любые доп. аргументы (...args), чтобы старый код не ломался
  static onGameStateChange(callback: (data: any) => void, ...args: any[]): Unsubscribe {
    return this.subscribeToGameState(callback);
  }

  static updateGameState(event: LiveEvent | null) {
    set(ref(db, 'gameState'), { activeEvent: event, timestamp: Date.now() });
  }

  static async resetGame() {
    await set(ref(db, 'gameState'), null);
  }
  
  // Принимаем аргументы, даже если не используем их
  static async resetEvent(...args: any[]) {
    await this.resetGame();
  }

  // --- GUESTS ---
  // Используем ...args, чтобы принять и объект, и отдельные параметры
  static registerGuest(...args: any[]) {
    // Пробуем понять, что нам передали (id+name или объект)
    let guestId, name;
    if (typeof args[0] === 'object') {
       guestId = args[0].id;
       name = args[0].name;
    } else {
       guestId = args[0];
       name = args[1];
    }
    if (guestId) {
        set(ref(db, `guests/${guestId}`), { name, joinedAt: Date.now(), score: 0 });
    }
  }

  static onGuestsCountChange(callback: (count: number) => void, ...args: any[]): Unsubscribe {
    const unsub = onValue(ref(db, 'guests'), (snapshot) => callback(snapshot.size));
    return unsub;
  }

  // --- PULSE & PROGRESS ---
  static sendScreenPulse(...args: any[]) {
    set(ref(db, 'screenPulse'), Date.now());
  }

  static onScreenPulseChange(callback: (val: any) => void, ...args: any[]): Unsubscribe {
    const unsub = onValue(ref(db, 'screenPulse'), (snapshot) => callback(snapshot.val()));
    return unsub;
  }

  static onPushProgressChange(callback: (val: any) => void, ...args: any[]): Unsubscribe {
    const unsub = onValue(ref(db, 'pushProgress'), (snapshot) => callback(snapshot.val()));
    return unsub;
  }

  static updatePushProgress(val: any, ...args: any[]) {
    set(ref(db, 'pushProgress'), val);
  }

  // --- ANSWERS & IMAGES ---
  // Принимаем до 5 аргументов (как в ошибке)
  static submitAnswer(...args: any[]) {
    // Берем первые два как основные, остальное игнорируем
    const guestId = args[0];
    const answerIdx = args[1];
    const key = push(ref(db, 'answers')).key;
    update(ref(db), { [`answers/${key}`]: { guestId, answerIdx, timestamp: Date.now() } });
  }

  static onAnswersChange(callback: (data: any) => void, ...args: any[]): Unsubscribe {
    const unsub = onValue(ref(db, 'answers'), (snapshot) => callback(snapshot.val()));
    return unsub;
  }

  static addGuestImage(arg1: any, ...args: any[]) {
    // Если передали объект {url, user...} или просто аргументы
    const payload = typeof arg1 === 'object' ? arg1 : { guestId: arg1, imageUrl: args[0] };
    push(ref(db, 'guestImages'), payload);
  }

  static onImagesChange(callback: (data: any) => void, ...args: any[]): Unsubscribe {
    const unsub = onValue(ref(db, 'guestImages'), (snapshot) => callback(snapshot.val()));
    return unsub;
  }
}

// Экспорты для совместимости
export const updateGameState = FirebaseService.updateGameState;
export const subscribeToGameState = FirebaseService.subscribeToGameState;