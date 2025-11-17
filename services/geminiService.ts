import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getFinancialCoachResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: 'You are SpendSmart AI, a friendly and helpful personal finance coach. Provide concise, actionable advice. Do not use markdown formatting.'
      }
    });
    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Error getting financial coach response:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const analyzeReceipt = async (imageFile: File): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
      text: `Analyze this receipt and extract the merchant name, date, total amount, and a list of items with their prices. Present the result as a JSON object with keys: "merchant", "date", "total", and "items" (an array of objects with "name" and "price").`
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith('```')) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
    }
    
    return jsonString;

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return "Error: Could not analyze the receipt. Please try a clearer image.";
  }
};

export const getFinancialInsights = async (topic: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide insights and up-to-date information on the following financial topic: ${topic}`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { text, sources };
  } catch (error) {
    console.error("Error getting financial insights:", error);
    return { text: "Sorry, I couldn't fetch insights on that topic. Please try again.", sources: [] };
  }
};

export const getDeepFinancialAnalysis = async (userData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Perform a deep and comprehensive financial analysis based on the following user data. Provide actionable steps, identify risks, and suggest opportunities for growth. User data: ${userData}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting deep financial analysis:", error);
    return "Sorry, an error occurred during the deep analysis. Please try again later.";
  }
};
