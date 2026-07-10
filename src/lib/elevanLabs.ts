export interface SpeakOptions {
  text: string;
  language: "english" | "hindi" | "hinglish";
  gender: "male" | "female";
}

export async function generateSpeech({
  text,
  language,
  gender,
}: SpeakOptions): Promise<Blob> {
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
    const err = await response.json();
    throw new Error(err.error || "Failed to generate speech.");
  }

  return await response.blob();
}
