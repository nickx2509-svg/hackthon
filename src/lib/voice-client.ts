// lib/voice-client.ts
// Client-side helper that calls our own /api/voice route, which proxies
// Mesh's Sarvam Bulbul text-to-speech. Returns a playable audio Blob.

export type VoiceLanguage = "english" | "hindi" | "hinglish";
export type VoiceGender = "male" | "female";

interface GenerateSpeechOptions {
  text: string;
  language: VoiceLanguage;
  gender: VoiceGender;
}

export async function generateSpeech({
  text,
  language,
  gender,
}: GenerateSpeechOptions): Promise<Blob> {
  const response = await fetch("/api/voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      language,
      gender,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to generate speech.");
  }

  return await response.blob();
}
