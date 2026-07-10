"use client";

import { useRef, useState } from "react";
import { generateSpeech } from "../lib/elevanLabs";

export function useElevenLabs() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  async function speak(
    text: string,
    language: "english" | "hindi" | "hinglish",
    gender: "male" | "female",
  ) {
    try {
      stop();

      const blob = await generateSpeech({
        text,
        language,
        gender,
      });

      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);

      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);

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
      console.error(err);
      setIsSpeaking(false);
    }
  }

  function stop() {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    setIsSpeaking(false);
  }

  return {
    speak,
    stop,
    isSpeaking,
  };
}
