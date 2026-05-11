import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateRideDescription = async (origin: string, destination: string, lang: string = 'ar'): Promise<string> => {
  if (!genAI) {
    console.warn("Gemini API Key not found. Returning mock description.");
    return lang === 'ar' 
      ? `رحلة من ${origin} إلى ${destination}. ابحث عن ركاب!`
      : `Heading from ${origin} to ${destination}. Flexible with music and stops.`;
  }

  try {
    const model = genAI.models;
    const prompt = lang === 'ar'
      ? `Write a short, friendly, and inviting description (max 15 words) in Arabic for a carpool ride from ${origin} to ${destination}. Mention comfort or punctuality. Do not use quotes.`
      : `Write a short, friendly, and inviting description (max 15 words) in English for a carpool ride from ${origin} to ${destination}. Mention comfort or punctuality. Do not use quotes.`;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return lang === 'ar' 
      ? `رحلة من ${origin} إلى ${destination}.`
      : `Trip from ${origin} to ${destination}.`;
  }
};