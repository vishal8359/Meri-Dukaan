import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello world"
    });
    console.log("GEMINI WORKS:", response.text);
  } catch (e) {
    console.log("GEMINI ERROR:", e.message);
  }
}

run();
