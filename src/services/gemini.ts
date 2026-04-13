import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAISearchResponse = async (query: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `You are an assistant for the EL ZATONA dashboard. 
          Based on the following context from our database, answer the user's query: "${query}"
          
          Context:
          ${context}
          
          Provide a concise and helpful answer in the same language as the query (Arabic or English).` }]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, I couldn't process your request at the moment.";
  }
};
