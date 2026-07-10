// app/api/tts/route.ts
// Main interview-turn endpoint: takes the candidate's last answer,
// asks the LLM to score it + ask the next question, then converts
// that question into speech using the selected language/voice.
//
// This replaces your original file. Key fixes vs. the old version:
//  - Correct Mesh base URL + paths (api.meshapi.ai/v1/chat/completions,
//    api.meshapi.ai/v1/audio/speech) — the old code posted to
//    "https://meshapi.ai" with no path, which isn't a real endpoint.
//  - Uses sarvam/bulbul:v3 for audio (Indian-accented Hindi/English/
//    Hinglish) instead of openai/tts-1 voice names (onyx/nova/echo/
//    shimmer), which don't have an Indian accent.
//  - Removed the hardcoded "mockmate AI enter i sound like tis" prefix
//    bug — that was getting prepended to every single question.
//  - `model` is no longer hardcoded per-request; meshChat/meshTTS pick
//    sensible defaults, and you can override by passing extra fields.

import { NextResponse } from "next/server";
import {
  SARVAM_LANGUAGE_CODE,
  SARVAM_SPEAKER,
  type LanguageOption,
  type VoiceOption,
} from "@/src/lib/meshAPI";
import { meshChat, meshTTS } from "@/src/lib/mesh-server";

const VALID_LANGUAGES: LanguageOption[] = ["english", "hindi", "hinglish"];
const VALID_GENDERS: VoiceOption[] = ["male", "female"];

function languageInstruction(language: LanguageOption): string {
  switch (language) {
    case "hindi":
      return "Reply entirely in Hindi, written in Devanagari script.";
    case "hinglish":
      return "Reply in natural Hinglish — Hindi-English code-mixed, written in Roman script.";
    default:
      return "Reply entirely in English.";
  }
}

export async function POST(req: Request) {
  try {
    const { text, language, gender, role, experienceLevel } = await req.json();

    // 1. Validation
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }
    if (!VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }
    if (!VALID_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
    }

    // ============================================================
    // PHASE 1: Evaluate the candidate's answer + ask next question
    // ============================================================
    const generatedText = await meshChat([
      {
        role: "system",
        content: `You are MockMate AI, a friendly senior interviewer at a top tech company, conducting a mock interview for the role of ${
          role ?? "the candidate's chosen role"
        } (${experienceLevel ?? "unspecified"} level). ${languageInstruction(
          language,
        )} Read the candidate's latest answer. First, briefly state a score out of 10 for that answer in one sentence. Then ask the next relevant technical or behavioral question in exactly 2 conversational sentences. Keep your entire reply under 60 words.`,
      },
      { role: "user", content: text },
    ]);

    // ============================================================
    // PHASE 2: Convert that response into speech
    // ============================================================
    const audioBuffer = await meshTTS({
      text: generatedText,
      languageCode: SARVAM_LANGUAGE_CODE[language as LanguageOption],
      speaker: SARVAM_SPEAKER[gender as VoiceOption],
    });

    // 3. Return audio, with the text response tucked into a header
    //    so the frontend can display the transcript alongside the audio.
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-AI-Response-Text": encodeURIComponent(generatedText),
      },
    });
  } catch (error: any) {
    console.error("Interview turn route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to execute interview turn." },
      { status: 500 },
    );
  }
}
