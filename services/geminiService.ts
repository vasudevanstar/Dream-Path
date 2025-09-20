import { GoogleGenAI } from "@google/genai";

// FIX: API key must be obtained exclusively from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default ai;
