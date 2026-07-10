import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
const VALID_LANGUAGES = ["english", "hindi", "hinglish"] as const;
const VALID_GENDERS = ["male", "female"] as const;

function getVoiceName(language: string, gender: string): string {
  switch (language) {
    case "english":
      return gender === "male" ? "Puck" : "Aoede";

    case "hindi":
      return gender === "male" ? "Kore" : "Leda";

    case "hinglish":
      return gender === "male" ? "Puck" : "Aoede";

    default:
      return "Aoede";
  }
}
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16,
) {
  const headerSize = 44;
  const dataSize = pcmBuffer.length;

  const wavBuffer = Buffer.alloc(headerSize + dataSize);

  // RIFF
  wavBuffer.write("RIFF", 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write("WAVE", 8);

  // fmt
  wavBuffer.write("fmt ", 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20); // PCM
  wavBuffer.writeUInt16LE(channels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);

  const byteRate = (sampleRate * channels * bitsPerSample) / 8;

  wavBuffer.writeUInt32LE(byteRate, 28);

  const blockAlign = (channels * bitsPerSample) / 8;

  wavBuffer.writeUInt16LE(blockAlign, 32);

  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data
  wavBuffer.write("data", 36);

  wavBuffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

export async function POST(req: Request) {
  try {
    const { text, language, gender } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "Text is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        {
          error: "Invalid language.",
        },
        {
          status: 400,
        },
      );
    }

    if (!VALID_GENDERS.includes(gender)) {
      return NextResponse.json(
        {
          error: "Invalid gender.",
        },
        {
          status: 400,
        },
      );
    }

    const voiceName = getVoiceName(language, gender);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are MockMate AI.

You are conducting a professional mock interview.

Speak exactly like a friendly senior interviewer at Google, Microsoft or Amazon.

Your voice should feel:
- Warm
- Confident
- Calm
- Conversational
- Human

Never sound robotic.

Pause naturally.

Emphasize important words naturally.

Do not explain anything.

Do not answer the transcript.

Do not add extra words.

Read ONLY the transcript exactly as written.

Transcript:

${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.data,
    )?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("Gemini did not return any audio.");
    }
    console.log(response.candidates?.[0]?.content?.parts);
    console.log(
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType,
    );

    const pcmBuffer = Buffer.from(base64Audio, "base64");

    const wavBuffer = pcmToWav(pcmBuffer);
    return new NextResponse(wavBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error?.message ?? "Failed to generate speech.",
      },
      {
        status: 500,
      },
    );
  }
}
