"use client";

import { useCallback, useState } from "react";
import {
  startInterview,
  getNextQuestion,
  evaluateInterview,
  generateJobDescription,
  isClosingStatement,
  type InterviewSetup,
  type InterviewMessage,
  type InterviewEvaluation,
} from "../lib/meshAPI";

/**
 * Thin hook wrapper around lib/meshAPI's real Mesh-backed calls.
 * Not required — InterviewPanel/SetupForm/Dashboard already call the lib
 * functions directly and manage their own loading state (isThinking,
 * isPreparing, etc). Use this hook only if you refactor those components
 * to centralize state, or want a reusable interview client elsewhere.
 */
export function useInterviewAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const start = useCallback(
    (setup: InterviewSetup) => run(() => startInterview(setup)),
    [run],
  );

  const next = useCallback(
    (setup: InterviewSetup, transcript: InterviewMessage[]) =>
      run(() => getNextQuestion(setup, transcript)),
    [run],
  );

  const evaluate = useCallback(
    (setup: InterviewSetup, transcript: InterviewMessage[]) =>
      run(() => evaluateInterview(setup, transcript)),
    [run],
  );

  const jobDescription = useCallback(
    (role: string, experienceLevel: string) =>
      run(() => generateJobDescription(role, experienceLevel)),
    [run],
  );

  return {
    loading,
    error,
    start,
    next,
    evaluate,
    jobDescription,
    isClosingStatement,
  } satisfies {
    loading: boolean;
    error: string | null;
    start: (setup: InterviewSetup) => Promise<string | null>;
    next: (
      setup: InterviewSetup,
      transcript: InterviewMessage[],
    ) => Promise<string | null>;
    evaluate: (
      setup: InterviewSetup,
      transcript: InterviewMessage[],
    ) => Promise<InterviewEvaluation | null>;
    jobDescription: (
      role: string,
      experienceLevel: string,
    ) => Promise<string | null>;
    isClosingStatement: (text: string) => boolean;
  };
}
