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
    const { text, language, gender } = (await req.json()) as {
      text: string;
      language: LanguageOption;
      gender: VoiceOption;
    };

    if (!text?.trim()) {
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
      languageCode: SARVAM_LANGUAGE_CODE[language],
      speaker: SARVAM_SPEAKER[gender],
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
      { error: error?.message ?? "Failed to generate preview audio." },
      { status: 500 },
    );
  }
}
