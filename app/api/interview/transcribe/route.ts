// app/api/interview/transcribe/route.ts
// Called after the candidate stops recording an answer. Receives the
// recorded audio blob and returns the transcribed text via Mesh's
// speech-to-text (ElevenLabs Scribe v2 under the hood).

import { NextResponse } from "next/server";
import { SARVAM_LANGUAGE_CODE, type LanguageOption } from "@/src/lib/meshAPI";
import { meshTranscribe } from "@/src/lib/mesh-server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const language = (form.get("language") as LanguageOption) || "english";

    if (!(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json(
        { error: "No audio was received." },
        { status: 400 },
      );
    }

    const languageCode =
      SARVAM_LANGUAGE_CODE[language] || SARVAM_LANGUAGE_CODE.english;

    const text = await meshTranscribe(audio, {
      languageCode,
      filename: "answer.webm",
    });

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Didn't catch that — no speech detected." },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Interview transcribe route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to transcribe your answer." },
      { status: 500 },
    );
  }
}
