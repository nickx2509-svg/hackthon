// app/api/voice/route.ts
// Called by generateSpeech() (lib/voice-client.ts) for every line the
// interviewer speaks. Proxies Mesh's text-to-speech (Sarvam Bulbul) and
// streams back real audio instead of the browser's speechSynthesis.

import { NextResponse } from "next/server";
import {
  SARVAM_LANGUAGE_CODE,
  SARVAM_SPEAKER,
  type LanguageOption,
  type VoiceOption,
} from "@/src/lib/meshAPI";
import { meshTTS } from "@/src/lib/mesh-server";

export async function POST(req: Request) {
  try {
    const { text, language, gender } = (await req.json()) as {
      text: string;
      language: LanguageOption;
      gender: VoiceOption;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const languageCode =
      SARVAM_LANGUAGE_CODE[language] || SARVAM_LANGUAGE_CODE.english;
    const speaker = SARVAM_SPEAKER[gender] || SARVAM_SPEAKER.male;

    const audioBuffer = await meshTTS({ text, languageCode, speaker });

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Voice route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate speech." },
      { status: 500 },
    );
  }
}
