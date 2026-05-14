export interface HealthReflectionInput {
  steps: number;
  weight: number;
  calories: number;
  userName: string;
}

export async function generateStoicReflection(data: HealthReflectionInput): Promise<string> {
  try {
    const response = await fetch('/api/ai/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.text || "Nature does not hurry, yet everything is accomplished...";
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return "Nature does not hurry, yet everything is accomplished... and so it is with our connection to the AI. Please try again later.";
  }
}
