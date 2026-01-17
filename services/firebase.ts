import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, update } from "firebase/database";

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

const getCallback = (args: any[]) => args.find(arg => typeof arg === 'function');

export class FirebaseService {
  
  // --- STATE ---
  static subscribeToGameState(...args: any[]) {
    console.log("🔥 Firebase: Проверка состояния игры...");
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'gameState'), (s) => {
        console.log("🔥 Firebase: Данные игры получены", s.val());
        cb(s.val());
    });
    return () => {};
  }

  static onGameStateChange(...args: any[]) {
    return this.subscribeToGameState(...args);
  }

  static updateGameState(data: any, ...args: any[]) {
    console.log("🔥 Firebase: Обновление игры ->", data);
    set(ref(db, 'gameState'), { activeEvent: data, timestamp: Date.now() });
  }

  static async resetGame(...args: any[]) {
    console.log("🔥 Firebase: Сброс игры");
    await set(ref(db, 'gameState'), null);
  }
  
  static async resetEvent(...args: any[]) {
    await this.resetGame();
  }

  // --- GUESTS ---
  static registerGuest(...args: any[]) {
    let id, name;
    if (typeof args[0] === 'object') {
      id = args[0].id || args[0].guestId;
      name = args[0].name;
    } else {
      id = args[0];
      name = args[1];
    }
    console.log(`🔥 Firebase: Гость ${name} пытается войти...`);
    if (id) set(ref(db, `guests/${id}`), { name, joinedAt: Date.now(), score: 0 });
  }

  static onGuestsCountChange(...args: any[]) {
    console.log("🔥 Firebase: Подписка на количество гостей");
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'guests'), (s) => cb(s.size));
    return () => {};
  }

  // --- SCREEN PULSE ---
  static sendScreenPulse(...args: any[]) {
    // console.log("🔥 Тук-тук (Пульс отправлен)"); // Можно раскомментировать, если нужно
    set(ref(db, 'screenPulse'), Date.now());
  }

  static onScreenPulseChange(...args: any[]) {
    console.log("🔥 Firebase: Слушаем пульс экрана...");
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'screenPulse'), (s) => cb(s.val()));
    return () => {};
  }

  // --- ANSWERS & OTHER ---
  static submitAnswer(...args: any[]) {
    console.log("🔥 Firebase: Ответ отправлен");
    const arg1 = args[0];
    const key = push(ref(db, 'answers')).key;
    const payload = typeof arg1 === 'object' ? arg1 : { guestId: arg1, answerIdx: args[1] };
    update(ref(db), { [`answers/${key}`]: payload });
  }

  static onAnswersChange(...args: any[]) {
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'answers'), (s) => cb(s.val()));
    return () => {};
  }
  
  static addGuestImage(...args: any[]) {
    console.log("🔥 Firebase: Загрузка картинки");
    const payload = typeof args[0] === 'object' ? args[0] : { guestId: args[0], imageUrl: args[1] };
    push(ref(db, 'guestImages'), payload);
  }
  
  static onImagesChange(...args: any[]) {
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'guestImages'), (s) => cb(s.val()));
    return () => {};
  }

  static updatePushProgress(val: any) {
    set(ref(db, 'pushProgress'), val);
  }

  static onPushProgressChange(...args: any[]) {
    const cb = getCallback(args);
    if (cb) return onValue(ref(db, 'pushProgress'), (s) => cb(s.val()));
    return () => {};
  }
}

export const updateGameState = FirebaseService.updateGameState;
export const subscribeToGameState = FirebaseService.subscribeToGameState;