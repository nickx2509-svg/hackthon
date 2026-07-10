// app/api/tts/preview/route.ts
// Pure text-to-speech, no LLM call. Used by the hover "play" icon
// next to each voice option in the setup form, so the user can hear
// the voice before starting the interview.

import { NextResponse } from "next/server";
import {
  SARVAM_LANGUAGE_CODE,
  SARVAM_SPEAKER,
  type LanguageOption,
  type VoiceOption,
} from "@/src/lib/meshAPI";
import { meshTTS } from "@/src/lib/mesh-server";

const VALID_LANGUAGES: LanguageOption[] = ["english", "hindi", "hinglish"];
const VALID_GENDERS: VoiceOption[] = ["male", "female"];

export async function POST(req: Request) {
  try {
    const { text, language, gender } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }
    if (!VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }
    if (!VALID_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
    }

    const audioBuffer = await meshTTS({
      text,
      languageCode: SARVAM_LANGUAGE_CODE[language as LanguageOption],
      speaker: SARVAM_SPEAKER[gender as VoiceOption],
    });

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("TTS preview route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Voice preview failed." },
      { status: 500 },
    );
  }
}
