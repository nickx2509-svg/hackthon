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
    const error = await response.json();

    throw new Error(error.error || "Failed to generate speech.");
  }

  return await response.blob();
}
