// hook/useGemeniTTS.ts
// Matches the exact import path used in your SetupForm.tsx:
//   import { useGeminiTTS } from "../hook/useGemeniTTS";
//
// NOTE: kept the original filename + export name (useGeminiTTS) purely
// so your existing form component doesn't need an import change. Under
// the hood this now calls Mesh API's /api/tts/preview route (Sarvam
// Bulbul voices), not Gemini — rename it later if you want, just update
// the import in SetupForm.tsx too.

"use client";

import { useState, useRef, useCallback } from "react";
import type { LanguageOption, VoiceOption } from "../lib/meshAPI";

export function useGeminiTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, language: LanguageOption, gender: VoiceOption) => {
      if (isSpeaking) return;
      setIsSpeaking(true);
      try {
        const res = await fetch("/api/tts/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language, gender }),
        });
        if (!res.ok) throw new Error("Preview audio request failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };

        await audio.play();
      } catch (err) {
        console.error("Voice preview error:", err);
        setIsSpeaking(false);
      }
    },
    [isSpeaking],
  );

  return { speak, stop, isSpeaking };
}
