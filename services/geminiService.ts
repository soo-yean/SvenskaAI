import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, QuizQuestion, TtsVoice } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to decode audio for TTS
// Decodes raw PCM 16-bit LE 24kHz data from Gemini TTS
export const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Ensure we have an even number of bytes for Int16Array
  const alignedLength = bytes.length - (bytes.length % 2);
  const dataInt16 = new Int16Array(bytes.buffer, 0, alignedLength / 2);

  const numChannels = 1;
  const buffer = audioContext.createBuffer(
    numChannels,
    dataInt16.length,
    sampleRate
  );
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < dataInt16.length; i++) {
    // Normalize 16-bit integer to float [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }

  return buffer;
};

export const generateDailyWord = async (): Promise<any> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt =
      "Generate a 'Word of the Day' for a Swedish learner. Return JSON with keys: swedish, english, exampleSentence (in Swedish), exampleTranslation (in English), and pronunciationTip.";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            swedish: { type: Type.STRING },
            english: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            exampleTranslation: { type: Type.STRING },
            pronunciationTip: { type: Type.STRING },
          },
          required: [
            "swedish",
            "english",
            "exampleSentence",
            "exampleTranslation",
            "pronunciationTip",
          ],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);

      // Runtime validation
      const requiredKeys = [
        "swedish",
        "english",
        "exampleSentence",
        "exampleTranslation",
        "pronunciationTip",
      ];
      const missingKeys = requiredKeys.filter((key) => !data[key]);

      if (missingKeys.length > 0) {
        console.warn(
          `Missing keys in daily word response: ${missingKeys.join(", ")}`
        );
        // If swedish exists but others are missing, we might still be able to use it,
        // but for now let's be strict to avoid broken UI
        throw new Error(
          `Invalid response structure. Missing: ${missingKeys.join(", ")}`
        );
      }

      return data;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error fetching daily word:", error);
    return null;
  }
};

export const generateQuiz = async (
  topic: string,
  difficulty: string
): Promise<QuizQuestion[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Create a strict JSON array of 5 multiple-choice questions for learning Swedish. Topic: ${topic}. Difficulty: ${difficulty}. 
    Each object must have: 'question', 'options' (array of 4 strings), 'correctAnswerIndex' (0-3 integer), and 'explanation' (string).`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Quiz generation error:", error);
    return [];
  }
};

export const generateChatResponse = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          "You are Sven, a friendly and encouraging Swedish language tutor. You speak a mix of English and Swedish. When the user speaks English, you teach them the Swedish equivalent. If they speak Swedish, you correct their grammar gently and keep the conversation going. Keep responses concise (under 80 words) unless explaining a complex grammar concept.",
      },
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chatSession.sendMessage({ message: newMessage });
    return result.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "Ursäkta, I'm having trouble connecting to the server. Let's try again.";
  }
};

export const translateAndExplain = async (
  text: string
): Promise<{ translation: string; explanation: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following text to Swedish (if English) or English (if Swedish). Then provide a brief grammar breakdown or cultural note. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to translate");
  } catch (error) {
    return {
      translation: "Error",
      explanation: "Could not process translation.",
    };
  }
};

export const generateSpeech = async (
  text: string,
  voiceName: string = "Fenrir"
): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      // Create a temporary context just for decoding
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      try {
        const buffer = await decodeAudioData(base64Audio, audioContext, 24000);
        return buffer;
      } finally {
        // Close the context to release hardware resources
        await audioContext.close();
      }
    }
    return null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};
