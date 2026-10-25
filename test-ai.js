
require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const cleanInput = "No one is more hated than the one that tells the truth";
const prompt = "Translate: " + cleanInput + " into Chinese with word breakdown in json";

async function run() {
  try {
    const { buildLinguisticChineseTranslation } = require("./src/lib/chineseTranslatorEngine");
    // Check what happens in server.ts generateWithFallback
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: "You are an expert Chinese linguist. Translate this English sentence into natural Simplified Chinese with words array in json: " + cleanInput }],
      temperature: 0.3
    });
    console.log("STOP REASON:", msg.stop_reason);
    console.log("USAGE:", msg.usage);
    console.log("TEXT:", msg.content[0].text);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
run();
