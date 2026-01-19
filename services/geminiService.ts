import { GoogleGenAI } from "@google/genai";

// 1. НАСТРОЙКА КЛЮЧА
// Вставьте ключ сюда, если не используете .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyArOLbY23EpDcvCJsUkaH9MOUnu7KosVF4"; 

const client = new GoogleGenAI({ apiKey });

// Проверка ключа
const checkApiKey = () => {
  if (!apiKey || apiKey === "ВАШ_КЛЮЧ_ЗДЕСЬ" || apiKey === "") {
    alert("ОШИБКА: Не указан API ключ в файле services/geminiService.ts");
    return false;
  }
  return true;
};

// Функция для "умной" очистки JSON от мусора
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Пробуем распарсить как есть
    return JSON.parse(text);
  } catch (e) {
    // 2. Если не вышло, ищем первую [ и последнюю ]
    try {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        const cleanJson = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(cleanJson);
      }
      throw new Error("JSON array brackets not found");
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      throw new Error("Нейросеть вернула некорректные данные. Попробуйте еще раз.");
    }
  }
};

/**
 * Генерация вопросов для квиза
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
      
      Strictly return ONLY valid JSON.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text();
    if (!text) throw new Error("Empty response");
    
    return cleanAndParseJSON(text);

  } catch (error: any) {
    console.error("Quiz Error:", error);
    alert(`Ошибка квиза: ${error.message}`);
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
      - question (string - the fact statement)
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
    if (!text) throw new Error("Empty response");

    return cleanAndParseJSON(text);

  } catch (error: any) {
    console.error("Believe/Not Error:", error);
    alert(`Ошибка генерации: ${error.message}`);
    return [];
  }
};

/**
 * Генерация изображений (Imagen 3 Fast)
 */
export const generateAiImage = async (prompt: string): Promise<string | null> => {
  if (!checkApiKey()) return null;

  try {
    const response = await client.models.generateImages({
      model: 'imagen-3.0-fast-generate-001', 
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
        alert("Ошибка 403. Для картинок нужен биллинг Google Cloud.");
    } else if (error.status === 429) {
        alert("Лимит запросов. Подождите минуту.");
    } else {
        alert(`Ошибка Арт: ${error.message}`);
    }
    return null;
  }
};

// Заглушка
export const generateGuestGreeting = async (name: string): Promise<string> => {
    return `Welcome, ${name}!`;
};