// lib/mesh-server.ts
// SERVER ONLY. Import this only from app/api/**/route.ts files.
// It reads process.env.MESH_API_KEY, which must never reach the browser.
// Add MESH_API_KEY=rsk_... to your .env.local

const MESH_BASE_URL = "https://api.meshapi.ai/v1";

function getKey(): string {
  const key = process.env.MESH_API_KEY;

  console.log("Mesh Key Exists:", !!key);
  console.log("Mesh Key Prefix:", key?.slice(0, 12));

  if (!key) {
    throw new Error("MESH_API_KEY missing");
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
  maxTokens: number = 1024,
): Promise<string> {
  const res = await fetch(`${MESH_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
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
  languageCode: string;
  speaker: string;
  model?: string;
  format?: string;
}): Promise<ArrayBuffer> {
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
      speaker,
      target_language_code: languageCode,
      stream: false,
      response_format: format,
    }),
  });

  if (!res.ok) {
    throw new Error(`Mesh TTS failed: ${await res.text()}`);
  }

  return await res.arrayBuffer();
}

/**
 * Transcribes a recorded answer to text using ElevenLabs Scribe v2 via
 * Mesh. Scribe v2 supports 90+ languages via ISO 639-3 codes (see
 * SCRIBE_LANGUAGE_CODE in lib/meshAPI.ts) — leave languageCode undefined
 * to let it auto-detect, which is what we do for "hinglish" since Scribe
 * has no dedicated code-mixed option.
 */
export async function meshTranscribe(
  audio: Blob,
  opts: {
    languageCode?: string;
    filename?: string;
  } = {},
): Promise<string> {
  const formData = new FormData();

  formData.append("file", audio, opts.filename ?? "audio.webm");
  formData.append("model", "elevenlabs/scribe_v2");

  if (opts.languageCode) {
    formData.append("language", opts.languageCode);
  }

  const res = await fetch(`${MESH_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Mesh transcription failed: ${await res.text()}`);
  }

  const data = await res.json();

  return data.text ?? "";
}
