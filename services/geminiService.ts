import { GoogleGenAI } from "@google/genai";

// 1. ПОЛУЧЕНИЕ КЛЮЧА
// Для Vite проектов используем import.meta.env или жесткую вставку
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyC-vmOaMUz_fBFjltcxp6RyNvyMmAmdqJ0"; 

const client = new GoogleGenAI({ apiKey });

// Проверка наличия ключа
const checkApiKey = () => {
  if (!apiKey || apiKey === "ВАШ_КЛЮЧ_ЗДЕСЬ" || apiKey === "") {
    console.error("API Key is missing!");
    alert("ОШИБКА: Не указан API ключ в файле services/geminiService.ts");
    return false;
  }
  return true;
};

/**
 * Генерация вопросов для квиза (Gemini 1.5 Flash)
 */
export const generateQuizQuestions = async (topic: string, lang: string, count: number = 5, mood: string = 'fun'): Promise<any[]> => {
  if (!checkApiKey()) return [];

  try {
    const prompt = `
      Create ${count} quiz questions about "${topic}". 
      Language: ${lang}. 
      Mood: ${mood}.
      Format: JSON array of objects with keys: 
      - question (string)
      - options (array of 4 strings)
      - correctAnswerIndex (number 0-3)
      
      Strictly return ONLY valid JSON. No markdown.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text();
    if (!text) return [];
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Quiz Error:", error);
    return [];
  }
};

/**
 * Генерация вопросов "Верю / Не верю"
 */
export const generateBelieveNotQuestions = async (topic: string, lang: string, count: number = 5): Promise<any[]> => {
  if (!checkApiKey()) return [];

  try {
    const prompt = `
      Create ${count} "True or False" facts about "${topic}".
      Language: ${lang}.
      Format: JSON array of objects:
      - question (string)
      - options (array ["True", "False"] localized)
      - correctAnswerIndex (0 for True, 1 for False)
      
      Strictly return ONLY valid JSON.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text();
    if (!text) return [];

    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Believe/Not Error:", error);
    return [];
  }
};

/**
 * Генерация изображений (Imagen 3)
 */
export const generateAiImage = async (prompt: string): Promise<string | null> => {
  if (!checkApiKey()) return null;

  try {
    // Используем модель для генерации картинок
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        safetyFilterLevel: 'block_only_high', 
        personGeneration: 'allow_adult' 
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imgData = response.generatedImages[0].image.base64;
      return `data:image/jpeg;base64,${imgData}`;
    }
    
    return null;
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    if (error.status === 403) {
        alert("Ошибка доступа (403). Для генерации картинок API ключ должен быть привязан к платежному аккаунту Google Cloud.");
    }
    return null;
  }
};

// Заглушка для совместимости, если где-то вызывается
export const generateGuestGreeting = async (name: string): Promise<string> => {
    return `Welcome, ${name}!`;
};