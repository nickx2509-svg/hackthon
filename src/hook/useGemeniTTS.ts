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
    (language: LanguageOption, gender: VoiceOption) => {
      if (isSpeaking) return;

      const url = `/voice-previews/${language}-${gender}.mp3`;
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      // called synchronously inside the click handler — gesture is still valid
      audio.play().catch((err) => {
        console.error("Preview playback blocked:", err);
        setIsSpeaking(false);
      });
    },
    [isSpeaking],
  );

  return { speak, stop, isSpeaking };
}
