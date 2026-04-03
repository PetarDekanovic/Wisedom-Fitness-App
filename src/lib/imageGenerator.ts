import { GoogleGenAI } from "@google/genai";

async function generateStoicAssets() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Generate Background
  const bgResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: 'A high-quality, serene background for a fitness app with Stoic motives. A weathered marble statue of a Greek philosopher in a contemplative pose, set against a dramatic sunset over a calm sea. Minimalist, elegant, cinematic lighting, 4k resolution.' }]
    },
    config: {
      imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
    }
  });

  // Extract image parts
  let bgBase64 = "";
  for (const part of bgResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      bgBase64 = part.inlineData.data;
    }
  }

  return { bgBase64 };
}
