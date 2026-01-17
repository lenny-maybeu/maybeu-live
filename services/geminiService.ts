import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizQuestion, Language } from "../types";

// Инициализация API
// Используем безопасное получение ключа
const apiKey = process.env.API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Используем быструю и дешевую модель 1.5 Flash
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateQuizQuestions = async (
  topic: string, 
  lang: Language, 
  count: number = 5,
  mood: string = "fun"
): Promise<QuizQuestion[]> => {
  try {
    const langText = lang === 'ru' ? 'русский' : 'English';
    const prompt = `Generate a list of ${count} ${mood} quiz questions on the topic "${topic}" for a live event. 
    Return strictly a JSON array. Each item must have: "id" (string), "question" (string), "options" (array of 4 strings), "correctAnswerIndex" (number 0-3). 
    Language: ${langText}. Do not use Markdown formatting, just plain JSON text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Очистка от лишних символов, если нейросеть добавила markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (e) {
    console.error("AI Quiz error", e);
    return getFallbackQuiz(topic, count);
  }
};

const getFallbackQuiz = (topic: string, count: number): QuizQuestion[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `fallback-${i}`,
    question: `Вопрос про ${topic} #${i + 1} (AI недоступен)`,
    options: ["Ответ 1", "Ответ 2", "Ответ 3", "Ответ 4"],
    correctAnswerIndex: 0
  }));
};

export const generateBelieveNotQuestions = async (
  topic: string, 
  lang: Language, 
  count: number = 5
): Promise<QuizQuestion[]> => {
  try {
    const langText = lang === 'ru' ? 'русском' : 'English';
    const options = lang === 'ru' ? ["Верю", "Не верю"] : ["Believe", "Don't Believe"];
    
    const prompt = `Generate ${count} facts about "${topic}" for a "Believe or Not" game. Some true, some false.
    Return strictly a JSON array. Each item: "id", "question", "correctAnswerIndex" (0 for True, 1 for False).
    Language: ${langText}. No Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const raw = JSON.parse(text);
    return raw.map((item: any, idx: number) => ({
      id: item.id || `bn-${idx}`,
      question: item.question,
      options: options,
      correctAnswerIndex: item.correctAnswerIndex
    }));
  } catch (e) {
    console.error("AI Believe Not error", e);
    return getFallbackBelieveNot(lang);
  }
};

const getFallbackBelieveNot = (lang: Language): QuizQuestion[] => {
  const options = lang === 'ru' ? ["Верю", "Не верю"] : ["Believe", "Don't Believe"];
  return [{
    id: 'fallback-bn',
    question: lang === 'ru' ? 'Это запасной вопрос?' : 'Is this a fallback question?',
    options: options,
    correctAnswerIndex: 0
  }];
};

export const generateGuestGreeting = async (guestName: string, occasion: string, eventType: string, lang: Language): Promise<string> => {
  try {
    const langText = lang === 'ru' ? 'русский' : 'English';
    const prompt = `Write a short, warm greeting for a guest named ${guestName} at a ${occasion}. Mention event type: ${eventType}. Language: ${langText}. Keep it under 200 characters.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return `Привет, ${guestName}! Рады тебя видеть!`;
  }
};

export const generateAiImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string | null> => {
  // Для генерации изображений пока используем надежный внешний сервис, 
  // так как Gemini API для картинок работает не везде.
  try {
    const width = 1024;
    // Добавляем случайное число, чтобы картинки не кешировались
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${width}&seed=${seed}&nologo=true&model=flux`;
  } catch (e) {
    return null;
  }
};