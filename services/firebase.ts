
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, push, remove, get } from 'firebase/database';

// Конфигурация Firebase, предоставленная пользователем
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
  // Управление глобальным состоянием игры (тип игры, текущий вопрос, стадия)
  updateGameState: async (eventCode: string, state: any) => {
    if (!eventCode) return;
    await set(ref(db, `events/${eventCode}/gameState`), {
      ...state,
      timestamp: Date.now()
    });
  },

  // Подписка на изменение состояния игры
  onGameStateChange: (eventCode: string, callback: (state: any) => void) => {
    const stateRef = ref(db, `events/${eventCode}/gameState`);
    return onValue(stateRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  // Регистрация гостя в событии
  registerGuest: async (eventCode: string, guestName: string) => {
    const guestRef = ref(db, `events/${eventCode}/guests/${guestName}`);
    await set(guestRef, { joinedAt: Date.now(), lastSeen: Date.now() });
  },

  // Получение количества онлайн гостей
  onGuestsCountChange: (eventCode: string, callback: (count: number) => void) => {
    const guestsRef = ref(db, `events/${eventCode}/guests`);
    return onValue(guestsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.keys(data).length : 0);
    });
  },

  // Отправка ответа на квиз
  submitAnswer: async (eventCode: string, type: 'quiz' | 'quest', key: string | number, name: string, data: any) => {
    const answerRef = ref(db, `events/${eventCode}/answers/${type}/${key}/${name}`);
    await set(answerRef, { ...data, timestamp: Date.now() });
  },

  // Подписка на все ответы (для экрана результатов)
  onAnswersChange: (eventCode: string, type: 'quiz' | 'quest', callback: (data: any) => void) => {
    const answersRef = ref(db, `events/${eventCode}/answers/${type}`);
    return onValue(answersRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  },

  // Обновление прогресса в игре "Жми!" (Push It)
  updatePushProgress: async (eventCode: string, name: string, count: number) => {
    await set(ref(db, `events/${eventCode}/pushProgress/${name}`), count);
  },

  // Подписка на прогресс гонки
  onPushProgressChange: (eventCode: string, callback: (data: any) => void) => {
    const pushRef = ref(db, `events/${eventCode}/pushProgress`);
    return onValue(pushRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  },

  // Добавление ИИ-арта
  addGuestImage: async (eventCode: string, imageData: any) => {
    const imagesRef = ref(db, `events/${eventCode}/images`);
    const newImageRef = push(imagesRef);
    await set(newImageRef, imageData);
  },

  // Подписка на галерею ИИ-артов
  onImagesChange: (eventCode: string, callback: (images: any[]) => void) => {
    const imagesRef = ref(db, `events/${eventCode}/images`);
    return onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      const imagesList = data ? Object.values(data) : [];
      callback(imagesList);
    });
  },

  // Пульс для проверки соединения экрана
  sendScreenPulse: (eventCode: string) => {
    set(ref(db, `events/${eventCode}/screenPulse`), Date.now());
  },

  onScreenPulseChange: (eventCode: string, callback: (timestamp: number) => void) => {
    const pulseRef = ref(db, `events/${eventCode}/screenPulse`);
    return onValue(pulseRef, (snapshot) => {
      callback(snapshot.val() || 0);
    });
  },

  // Полная очистка данных игры
  resetEvent: async (eventCode: string) => {
    await remove(ref(db, `events/${eventCode}/gameState`));
    await remove(ref(db, `events/${eventCode}/pushProgress`));
    await remove(ref(db, `events/${eventCode}/answers`));
  }
};