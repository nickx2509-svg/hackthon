// lib/mesh-server.ts
// SERVER ONLY. Import this only from app/api/**/route.ts files.
// It reads process.env.MESH_API_KEY, which must never reach the browser.
// Add MESH_API_KEY=rsk_... to your .env.local

const MESH_BASE_URL = "https://api.meshapi.ai/v1";

function getKey(): string {
  const key = process.env.MESH_API_KEY;
  if (!key) {
    throw new Error(
      "MESH_API_KEY is not set. Add it to .env.local (get it from app.meshapi.ai).",
    );
  }
  return key;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Calls Mesh's OpenAI-compatible chat completions endpoint.
 * Docs: https://developers.meshapi.ai/docs/guides/quickstart
 */
export async function meshChat(
  messages: ChatMessage[],
  model: string = "anthropic/claude-sonnet-4.6",
): Promise<string> {
  const res = await fetch(`${MESH_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    throw new Error(`Mesh chat completion failed: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Mesh chat completion returned no content.");
  return text as string;
}

/**
 * Calls Mesh's Text-to-Speech endpoint (proxies Sarvam Bulbul for
 * Indian-language voices). Returns raw audio bytes (mp3 by default).
 * Docs: https://developers.meshapi.ai/docs/guides/text-to-speech
 */
export async function meshTTS(opts: {
  text: string;
  languageCode: string; // e.g. "en-IN" / "hi-IN"
  speaker: string; // e.g. "priya" / "shubh"
  model?: string; // default: sarvam/bulbul:v3
  format?: string; // default: mp3_44100_128
}): Promise<Buffer> {
  const {
    text,
    languageCode,
    speaker,
    model = "sarvam/bulbul:v3",
    format = "mp3_44100_128",
  } = opts;

  const res = await fetch(`${MESH_BASE_URL}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      speaker, // Sarvam-specific: ignored by non-Sarvam models
      target_language_code: languageCode, // Sarvam-specific
      stream: false,
      response_format: format,
    }),
  });

  if (!res.ok) {
    throw new Error(`Mesh TTS failed: ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Transcribes a recorded answer (webm/mp3/wav blob) to text.
 * Uses ElevenLabs Scribe v2, which handles Hindi/English/code-mixed
 * audio well. Leave languageCode undefined for auto-detection.
 * Docs: https://developers.meshapi.ai/docs/guides/speech-to-text
 */
export async function meshTranscribe(
  file: Blob,
  opts?: { languageCode?: string; filename?: string },
): Promise<string> {
  const form = new FormData();
  form.append("model", "elevenlabs/scribe_v2");
  form.append("file", file, opts?.filename ?? "answer.webm");
  if (opts?.languageCode) form.append("language_code", opts.languageCode);

  const res = await fetch(`${MESH_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getKey()}` }, // no Content-Type: browser/runtime sets multipart boundary
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Mesh transcription failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.text as string;
}
