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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 65000);

  try {
    const response = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, gender }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to generate speech.");
    }

    return await response.blob();
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Voice generation timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
