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
