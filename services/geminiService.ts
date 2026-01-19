import { GoogleGenAI } from "@google/genai";

// 1. НАСТРОЙКА КЛЮЧА
// Вставьте ваш ключ сюда вместо "ВАШ_КЛЮЧ_ЗДЕСЬ"
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "ВАШ_КЛЮЧ_ЗДЕСЬ"; 

const client = new GoogleGenAI({ apiKey });

// Проверка ключа перед запросом
const checkApiKey = () => {
  if (!apiKey || apiKey === "ВАШ_КЛЮЧ_ЗДЕСЬ" || apiKey === "") {
    alert("ОШИБКА: Вы забыли вставить API ключ в файл services/geminiService.ts (строка 5)!");
    return false;
  }
  return true;
};

// Функция для очистки JSON от лишнего текста (markdown, пробелы)
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Пробуем распарсить сразу
    return JSON.parse(text);
  } catch (e) {
    // 2. Если не вышло, ищем массив [...] внутри текста
    try {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        const cleanJson = text.substring(firstBracket, lastBracket + 1);
        return JSON.parse(cleanJson);
      }
      throw new Error("В ответе не найден JSON массив");
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Нейросеть вернула некорректные данные. Попробуйте еще раз.");
    }
  }
};

/**
 * Генерация вопросов для квиза
 * Используем самую быструю текстовую модель: gemini-1.5-flash
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
      
      Example:
      [{"question":"Q1","options":["A","B","C","D"],"correctAnswerIndex":0}]
      
      Strictly return ONLY valid JSON.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text();
    if (!text) throw new Error("Пустой ответ от нейросети");
    
    return cleanAndParseJSON(text);

  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    // Выводим РЕАЛЬНУЮ причину ошибки
    alert(`Ошибка квиза: ${error.message || error.toString()}`);
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
    if (!text) throw new Error("Пустой ответ от нейросети");

    return cleanAndParseJSON(text);

  } catch (error: any) {
    console.error("Believe/Not Error:", error);
    alert(`Ошибка игры "Верю/Не верю": ${error.message || error.toString()}`);
    return [];
  }
};

/**
 * Генерация изображений (ИИ Арт)
 * Используем быструю модель: imagen-3.0-fast-generate-001
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
    
    // Обработка частых ошибок
    if (error.status === 403) {
        alert("Ошибка 403: Запрещено. Для генерации картинок API ключ должен быть привязан к платежному аккаунту Google Cloud (Billing).");
    } else if (error.status === 429) {
        alert("Слишком много запросов. Подождите минуту.");
    } else {
        alert(`Ошибка генерации Арт: ${error.message || error.toString()}`);
    }
    return null;
  }
};

// Заглушка для совместимости
export const generateGuestGreeting = async (name: string): Promise<string> => {
    return `Welcome, ${name}!`;
};