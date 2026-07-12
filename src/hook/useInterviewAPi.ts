"use client";

import { useState, useCallback } from "react";
import type {
  InterviewSetup,
  InterviewMessage,
  InterviewEvaluation,
} from "../lib/meshAPI";

export function useInterviewAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobDescription = useCallback(
    async (role: string, experienceLevel: string): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/generate-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, experienceLevel }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to generate description");
        return data.description as string;
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const start = useCallback(
    async (setup: InterviewSetup): Promise<string | null> => {
      setError(null);
      try {
        const res = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start interview");
        return data.text as string;
      } catch (err: any) {
        setError(
          err?.message ??
            "Couldn't start the interview. Check your connection.",
        );
        return null;
      }
    },
    [],
  );

  const next = useCallback(
    async (
      setup: InterviewSetup,
      transcript: InterviewMessage[],
    ): Promise<{ text: string; isFinal: boolean } | null> => {
      setError(null);
      try {
        const res = await fetch("/api/interview/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup, transcript }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to generate next question");
        return { text: data.text as string, isFinal: Boolean(data.isFinal) };
      } catch (err: any) {
        setError(
          err?.message ?? "Something went wrong generating the next question.",
        );
        return null;
      }
    },
    [],
  );

  const evaluate = useCallback(
    async (
      setup: InterviewSetup,
      transcript: InterviewMessage[],
    ): Promise<InterviewEvaluation | null> => {
      setError(null);
      try {
        const res = await fetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup, transcript }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to generate evaluation");
        return data.evaluation as InterviewEvaluation;
      } catch (err: any) {
        setError(
          err?.message ??
            "Couldn't generate your evaluation. Please try again.",
        );
        return null;
      }
    },
    [],
  );

  const transcribe = useCallback(
    async (audio: Blob, setup: InterviewSetup): Promise<string | null> => {
      setError(null);
      try {
        const form = new FormData();
        form.append("audio", audio, "answer.webm");
        form.append("language", setup.language);

        const res = await fetch("/api/interview/transcribe", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to transcribe your answer");
        return data.text as string;
      } catch (err: any) {
        setError(err?.message ?? "Couldn't understand that. Please try again.");
        return null;
      }
    },
    [],
  );

  return { jobDescription, start, next, evaluate, transcribe, loading, error };
}
