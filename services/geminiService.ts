
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionResult, SegmentLength } from "../types";

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string,
  targetLanguage: string = 'Arabic',
  segmentLength: SegmentLength = 'medium'
): Promise<TranscriptionResult> => {
  // Initialize the GoogleGenAI client with the API key from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let lengthInstruction = "";
  if (segmentLength === 'short') {
    lengthInstruction = "اجعل الجمل قصيرة جداً (3-6 كلمات لكل مقطع)، هذا مناسب للترجمات (Captions).";
  } else if (segmentLength === 'long') {
    lengthInstruction = "اجعل الجمل طويلة، قم بدمج العبارات المترابطة في مقاطع نصية واسعة وطويلة.";
  } else {
    lengthInstruction = "استخدم طول جمل متوسط وطبيعي بناءً على سياق الكلام.";
  }

  const prompt = `
    قم بتحويل الصوت المرفق إلى نص بلغة: ${targetLanguage}.
    تعليمات هامة حول طول المقطع: ${lengthInstruction}
    قم بتوفير طوابع زمنية (timestamps) دقيقة لكل مقطع لإنشاء ملف SRT.
    يجب أن تكون الطوابع بصيغة (HH:MM:SS,mmm).
    نسق المخرجات ككائن JSON يحتوي على:
    1. "segments": مصفوفة تحتوي على "index", "start", "end", و "text".
    2. "fullText": النص الكامل المجمع.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullText: { type: Type.STRING },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["index", "start", "end", "text"]
              }
            }
          },
          required: ["fullText", "segments"]
        }
      }
    });

    // Extract the text output using the .text property.
    const text = response.text || '{}';
    const result = JSON.parse(text) as TranscriptionResult;
    return result;
  } catch (error) {
    console.error("Transcription Error:", error);
    throw new Error("حدث خطأ أثناء معالجة الملف الصوتي. تأكد من جودة الصوت والمحاولة مرة أخرى.");
  }
};
