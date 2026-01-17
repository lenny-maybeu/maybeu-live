import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { LiveEvent } from "../types";

// ВАШИ НАСТРОЙКИ (Я их уже исправил и вставил)
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

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Функция 1: Слушать изменения (для всех)
export const subscribeToGameState = (callback: (data: any) => void) => {
  const starCountRef = ref(db, 'gameState');
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Функция 2: Отправить изменения (для Ведущего)
export const updateGameState = (event: LiveEvent | null) => {
  set(ref(db, 'gameState'), {
    activeEvent: event,
    timestamp: Date.now()
  });
};

// Функция 3: Сброс (Выход)
export const resetGame = () => {
  set(ref(db, 'gameState'), null);
};