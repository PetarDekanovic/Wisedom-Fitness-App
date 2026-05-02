import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In Vite, we should not expose process.env.GEMINI_API_KEY to the client 
// if it's sensitive, but since this is an AI Coding agent environment, 
// we assume the key is available via the environment.
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface HealthReflectionInput {
  steps: number;
  weight: number;
  calories: number;
  userName: string;
}

export async function generateStoicReflection(data: HealthReflectionInput): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "The oracle is silent. Add a GEMINI_API_KEY to receive Stoic insights.";
  }

  const prompt = `
    You are a Stoic Philosopher and Fitness Coach. 
    Analyze the following health metrics for ${data.userName}:
    - Steps Today: ${data.steps}
    - Current Weight: ${data.weight}kg
    - Calories Expended: ${data.calories}

    Wait! Before you respond, remember:
    - If steps are high (over 8000), praise their "Discipline" and "Momentum".
    - If steps are low, remind them that "Wealth is the ability to fully experience life" and encourage a short walk for "Clarity".
    - Regarding weight (${data.weight}kg), focus on "Consistency over Perfection".
    - Use a tone that is: Cinematic, Encouraging, Grave yet Inspiring.
    - Keep it short (max 2-3 sentences).
    - End with a short original Stoic quote.

    Respond in raw text.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Nature does not hurry, yet everything is accomplished... and so it is with our connection to the AI. Please try again later.";
  }
}
