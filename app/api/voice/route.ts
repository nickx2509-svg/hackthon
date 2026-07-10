// app/api/voice/route.ts

import { NextRequest, NextResponse } from "next/server";

function getVoiceId(language: string, gender: string) {
  if (language === "hindi") {
    return gender === "female"
      ? process.env.ELEVENLABS_HINDI_FEMALE_VOICE_ID!
      : process.env.ELEVENLABS_HINDI_MALE_VOICE_ID!;
  }

  if (language === "hinglish") {
    return gender === "female"
      ? process.env.ELEVENLABS_HINGLISH_FEMALE_VOICE_ID!
      : process.env.ELEVENLABS_HINGLISH_MALE_VOICE_ID!;
  }

  return gender === "female"
    ? process.env.ELEVENLABS_ENGLISH_FEMALE_VOICE_ID!
    : process.env.ELEVENLABS_ENGLISH_MALE_VOICE_ID!;
}

export async function POST(req: NextRequest) {
  try {
    const { text, language, gender } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY" },
        { status: 500 },
      );
    }

    const voiceId = getVoiceId(language, gender);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error,
        },
        {
          status: response.status,
        },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate voice.",
      },
      {
        status: 500,
      },
    );
  }
}
