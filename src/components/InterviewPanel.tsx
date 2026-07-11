"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";
import {
  Mic,
  MicOff,
  User,
  AlertCircle,
  Sparkles,
  Clock,
  Brain,
  Volume2,
  Loader2,
  Languages,
  MessageCircle,
  CheckCircle2,
  Radio,
  Timer as TimerIcon,
} from "lucide-react";
import {
  type InterviewSetup,
  type InterviewMessage,
  type StoredInterviewResult,
  SETUP_STORAGE_KEY,
  RESULT_STORAGE_KEY,
  LANGUAGE_TABS,
  VOICE_TABS,
} from "../lib/meshAPI";
import { useInterviewAPI } from "../hook/useInterviewAPi";
import { generateSpeech } from "../lib/voice-client";
import ChatBubble from "../components/chatBubble";
import { CursorGlow } from "../components/CursorGlow";

// Display face for the spoken line — the one place we spend some
// typographic character. Everything else stays on the system sans.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

let idCounter = 0;
const nextId = () => `msg_${Date.now()}_${idCounter++}`;

// How long to pause after the interviewer finishes their closing line
// before showing the "generating report" loader — gives the moment room
// to breathe instead of yanking straight to a redirect.
const POST_CLOSING_PAUSE_MS = 5000;

type StageStatus =
  | "preparing"
  | "speaking"
  | "recording"
  | "transcribing"
  | "thinking"
  | "generating"
  | "complete"
  | "idle";

function statusStyle(status: StageStatus) {
  switch (status) {
    case "speaking":
      return {
        bg: "#EAF3F1",
        color: "#2F5D5A",
        ring: "#2F5D5A26",
        label: "Interviewer is speaking",
        Icon: Volume2,
      };
    case "recording":
      return {
        bg: "#EAF0FA",
        color: "#3B5B92",
        ring: "#3B5B9226",
        label: "Recording your answer",
        Icon: Radio,
      };
    case "transcribing":
      return {
        bg: "#F3EBFA",
        color: "#7C4DAA",
        ring: "#7C4DAA26",
        label: "Understanding your answer",
        Icon: Loader2,
      };
    case "thinking":
      return {
        bg: "#FBF3E4",
        color: "#9C7A2E",
        ring: "#9C7A2E26",
        label: "Interviewer is thinking",
        Icon: Brain,
      };
    case "generating":
      return {
        bg: "#EAF3F1",
        color: "#2F5D5A",
        ring: "#2F5D5A26",
        label: "Generating your report",
        Icon: Loader2,
      };
    case "complete":
      return {
        bg: "#EEF3F2",
        color: "#2F5D5A",
        ring: "#2F5D5A26",
        label: "Interview complete",
        Icon: CheckCircle2,
      };
    case "preparing":
      return {
        bg: "#F3F3F0",
        color: "#6B6B66",
        ring: "#6B6B6626",
        label: "Preparing your interview",
        Icon: Sparkles,
      };
    default:
      return {
        bg: "#F3F3F0",
        color: "#6B6B66",
        ring: "#6B6B6626",
        label: "Ready when you are",
        Icon: Mic,
      };
  }
}

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function InterviewPanel() {
  const router = useRouter();
  const {
    start: apiStart,
    next: apiNext,
    evaluate: apiEvaluate,
    transcribe: apiTranscribe,
    error: apiError,
  } = useInterviewAPI();

  const [setup, setSetup] = useState<InterviewSetup | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<InterviewMessage[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Mic feature check — MediaRecorder + getUserMedia, and a secure context
  useEffect(() => {
    const hasRecorder =
      typeof window !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia;

    if (!hasRecorder) {
      setMicSupported(false);
      setMicError("Voice recording isn't supported in this browser.");
      return;
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      setMicSupported(false);
      setMicError(
        "Voice input needs a secure connection (HTTPS or localhost).",
      );
    }
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    setSetup(JSON.parse(raw));
  }, [router]);

  useEffect(() => {
    if (!setup) return;
    let cancelled = false;

    (async () => {
      setIsPreparing(true);
      const greeting = await apiStart(setup);
      if (cancelled) return;
      setIsPreparing(false);

      if (greeting) {
        pushMessage("ai", greeting);
        speak(greeting);
      } else {
        pushMessage(
          "ai",
          "Sorry — I couldn't start the interview right now. Please refresh the page to try again.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  // Never show raw API/JSON error text to the person — swap it for a
  // clean, muted notification instead.
  useEffect(() => {
    if (!apiError) return;
    const looksRaw = apiError.trim().startsWith("{") || apiError.length > 140;
    setToast(
      looksRaw
        ? "MockMate is temporarily unavailable — please try again in a moment."
        : apiError,
    );
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [apiError]);

  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  // Simple session clock — starts once prep is done, stops once complete.
  useEffect(() => {
    if (isPreparing || isComplete) return;
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isPreparing, isComplete]);

  function pushMessage(role: "ai" | "candidate", text: string) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role, text, timestamp: Date.now() },
    ]);
  }

  // Real TTS via Mesh/Sarvam. Returns a promise that resolves once the
  // audio actually finishes playing, so callers can wait for the
  // interviewer to genuinely stop talking before doing anything else.
  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!setup) {
        resolve();
        return;
      }
      setIsSpeaking(true);
      generateSpeech({
        text,
        language: setup.language,
        gender: setup.voiceGender,
      })
        .then((blob) => {
          if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;

          const audio = new Audio(url);
          audioElRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            resolve();
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            resolve();
          };
          audio.play().catch(() => {
            setIsSpeaking(false);
            resolve();
          });
        })
        .catch(() => {
          setIsSpeaking(false);
          resolve();
        });
    });
  }

  async function toggleRecording() {
    if (!micSupported || isThinking || isComplete || isSpeaking) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (!setup || blob.size === 0) {
          setMicError("Didn't catch any audio — try again.");
          return;
        }

        setIsTranscribing(true);
        const text = await apiTranscribe(blob, setup);
        setIsTranscribing(false);

        if (!text) {
          setMicError(apiError || "Couldn't understand that. Try again.");
          return;
        }

        submitAnswer(text);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setMicError("Microphone permission was denied. Allow it and try again.");
    }
  }

  async function submitAnswer(text: string) {
    if (!setup || !text.trim() || isThinking || isComplete) return;
    pushMessage("candidate", text);

    setIsThinking(true);
    const updatedTranscript = [
      ...messagesRef.current,
      { id: nextId(), role: "candidate" as const, text, timestamp: Date.now() },
    ];
    const result = await apiNext(setup, updatedTranscript);
    setIsThinking(false);

    if (!result) {
      pushMessage(
        "ai",
        "Sorry — something went wrong generating the next question. Try answering again.",
      );
      return;
    }

    pushMessage("ai", result.text);
    await speak(result.text); // wait for the sentence to actually finish

    if (result.isFinal) {
      setIsComplete(true);
      const finalTranscript = [
        ...updatedTranscript,
        {
          id: nextId(),
          role: "ai" as const,
          text: result.text,
          timestamp: Date.now(),
        },
      ];
      await new Promise((r) => setTimeout(r, POST_CLOSING_PAUSE_MS));
      finishInterview(finalTranscript);
    }
  }

  async function finishInterview(transcript: InterviewMessage[]) {
    if (!setup) return;
    setIsGeneratingReport(true);
    const evaluation = await apiEvaluate(setup, transcript);

    if (!evaluation) {
      setIsGeneratingReport(false);
      pushMessage(
        "ai",
        "The interview wrapped up, but I couldn't generate your evaluation just now. Please refresh — your answers are still saved in this tab.",
      );
      return;
    }

    const result: StoredInterviewResult = {
      setup,
      transcript,
      evaluation,
      completedAt: Date.now(),
    };
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
    router.push("/dashboard");
  }

  if (!setup) return null;

  const status: StageStatus = isGeneratingReport
    ? "generating"
    : isComplete
      ? "complete"
      : isThinking
        ? "thinking"
        : isTranscribing
          ? "transcribing"
          : isSpeaking
            ? "speaking"
            : isRecording
              ? "recording"
              : isPreparing
                ? "preparing"
                : "idle";

  const {
    bg: statusBg,
    color: statusColor,
    ring: statusRing,
    label: statusLabel,
    Icon: StatusIcon,
  } = statusStyle(status);

  const micDisabled =
    !micSupported || isThinking || isComplete || isSpeaking || isTranscribing;

  const voiceLabel =
    VOICE_TABS.find((v) => v.id === setup.voiceGender)?.label || "Male";
  const languageLabel =
    LANGUAGE_TABS.find((l) => l.id === setup.language)?.label || "English";

  const orbBarColor = isRecording ? "#3B5B92" : "#2F5D5A";
  const barSpeed = isSpeaking ? "0.55s" : isRecording ? "0.5s" : "2.6s";

  const questionNumber = Math.max(
    1,
    messages.filter((m) => m.role === "ai").length,
  );
  const exchangeCount = messages.filter((m) => m.role === "candidate").length;

  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#F9F9F6",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, #0B0B0B0A 1px, transparent 0)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="opacity-50">
        <CursorGlow />
      </div>

      {/* Error toast — top right, muted red, never shows raw error text */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[999] flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium max-w-xs"
          style={{
            backgroundColor: "#FBEEE8",
            color: "#B5502E",
            border: "1px solid #F2D9CC",
            boxShadow: "0 10px 30px -8px rgba(181,80,46,0.35)",
          }}
        >
          <AlertCircle size={15} className="flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        className="relative z-[2] flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          borderBottom: "1px solid #E9E8E6",
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 1px 0 rgba(11,11,11,0.02), 0 6px 16px -12px rgba(11,11,11,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#EAF3F1",
              border: "1px solid #CFE3E0",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <Sparkles size={16} style={{ color: "#2F5D5A" }} />
          </div>
          <div>
            <p
              className={`${fraunces.className} text-[15px] font-semibold`}
              style={{ color: "#0B0B0B" }}
            >
              {setup.role} Interview
            </p>
            <span
              className="inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: statusBg,
                color: statusColor,
                boxShadow: `0 0 0 3px ${statusRing}`,
              }}
            >
              <StatusIcon
                size={11}
                className={
                  status === "transcribing" || status === "generating"
                    ? "animate-spin"
                    : ""
                }
              />
              {statusLabel}
              {(status === "recording" ||
                status === "speaking" ||
                status === "thinking") && (
                <span className="flex gap-[2px] ml-0.5">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span
                    className="status-dot"
                    style={{
                      backgroundColor: statusColor,
                      animationDelay: "160ms",
                    }}
                  />
                  <span
                    className="status-dot"
                    style={{
                      backgroundColor: statusColor,
                      animationDelay: "320ms",
                    }}
                  />
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!isPreparing && (
            <>
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: "#F3F3F0",
                  color: "#6B6B66",
                  border: "1px solid #E9E8E6",
                }}
              >
                <TimerIcon size={12} />
                {formatElapsed(elapsedSeconds)}
              </span>
              {!isComplete && (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: "#F3F3F0",
                    color: "#6B6B66",
                    border: "1px solid #E9E8E6",
                  }}
                >
                  <MessageCircle size={12} />
                  Question {questionNumber}
                </span>
              )}
            </>
          )}
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "#2F5D5A" }}
          >
            MockMate AI
          </span>
        </div>
      </div>

      {/* Main area: stage + sidebar */}
      <div className="relative z-[2] flex-1 flex min-h-0">
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 gap-7">
          {isPreparing ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "#EAF3F1",
                  border: "1px solid #CFE3E0",
                  boxShadow: "0 12px 30px -14px rgba(47,93,90,0.45)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full animate-spin"
                  style={{
                    border: "3px solid transparent",
                    borderTopColor: "#2F5D5A",
                    borderRightColor: "#2F5D5A44",
                  }}
                />
                <Sparkles size={22} style={{ color: "#2F5D5A" }} />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <p
                  className={`${fraunces.className} text-base font-medium`}
                  style={{ color: "#0B0B0B" }}
                >
                  Preparing your interview
                </p>
                <p className="text-xs" style={{ color: "#9A9A94" }}>
                  Setting the scene for {languageLabel} · {voiceLabel} voice
                </p>
              </div>
            </div>
          ) : isGeneratingReport ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className="flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium"
                style={{
                  backgroundColor: "#EAF3F1",
                  color: "#2F5D5A",
                  border: "1.5px solid #CFE3E0",
                  boxShadow: "0 14px 34px -16px rgba(47,93,90,0.4)",
                }}
              >
                <Loader2 size={16} className="animate-spin" />
                Generating your report
              </div>
              <p className="text-xs" style={{ color: "#9A9A94" }}>
                Scoring {exchangeCount} answers — this takes a few seconds.
              </p>
            </div>
          ) : (
            <>
              {/* Language / voice pill */}
              <div
                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: "#EAF0FA",
                  color: "#3B5B92",
                  border: "1px solid #C9D9EE",
                  boxShadow: "0 6px 18px -12px rgba(59,91,146,0.5)",
                }}
              >
                <Languages size={14} style={{ color: "#3B5B92" }} />
                {languageLabel} · {voiceLabel} voice
              </div>

              {/* Voice orb with a slow rotating tick ring — the one
                  signature flourish, everything else stays quiet */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: 260, height: 260 }}
              >
                <svg
                  viewBox="0 0 260 260"
                  width={260}
                  height={260}
                  className="absolute inset-0"
                  style={{
                    animation: "ip-rotate 26s linear infinite",
                    opacity: isSpeaking || isRecording ? 0.9 : 0.45,
                    transition: "opacity .3s ease",
                  }}
                >
                  <circle
                    cx="130"
                    cy="130"
                    r="122"
                    fill="none"
                    stroke={orbBarColor}
                    strokeWidth="1.5"
                    strokeDasharray="1 11"
                    strokeLinecap="round"
                  />
                </svg>

                <div
                  className="rounded-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    width: 220,
                    height: 220,
                    background:
                      "radial-gradient(circle at 32% 28%, #F3F8F7 0%, #E7EFEE 70%)",
                    border: "1px solid #D3E3E1",
                    transform: isSpeaking ? "scale(1.05)" : "scale(1)",
                    boxShadow: isSpeaking
                      ? "0 0 0 18px #2F5D5A14, 0 24px 48px -20px rgba(47,93,90,0.35)"
                      : isRecording
                        ? "0 0 0 18px #3B5B9214, 0 24px 48px -20px rgba(59,91,146,0.35)"
                        : "0 20px 40px -22px rgba(11,11,11,0.18)",
                    transition: "box-shadow .3s, transform .3s",
                  }}
                >
                  <div
                    className="flex items-end justify-center gap-[8px]"
                    style={{ height: 68 }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="ip-bar"
                        style={{
                          backgroundColor: orbBarColor,
                          animationDelay: `${i * 110}ms`,
                          animationDuration: barSpeed,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Spoken / status line */}
              {isThinking ? (
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "#FBF3E4",
                    color: "#9C7A2E",
                    border: "1px solid #F0E1BE",
                    boxShadow: "0 10px 26px -16px rgba(156,122,46,0.45)",
                  }}
                >
                  <Brain size={16} />
                  Thinking through your answer
                  <span className="flex gap-[3px]">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: "#9C7A2E" }}
                    />
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor: "#9C7A2E",
                        animationDelay: "160ms",
                      }}
                    />
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor: "#9C7A2E",
                        animationDelay: "320ms",
                      }}
                    />
                  </span>
                </div>
              ) : (
                <p
                  className={`${fraunces.className} italic text-lg leading-relaxed max-w-2xl text-center rounded-2xl px-5 py-4`}
                  style={{
                    backgroundColor: "#EAF0FA",
                    color: "#3B5B92",
                    border: "1px solid #C9D9EE",
                    boxShadow: "0 12px 30px -20px rgba(59,91,146,0.4)",
                  }}
                >
                  {messages[messages.length - 1]?.role === "ai"
                    ? messages[messages.length - 1]?.text
                    : isTranscribing
                      ? "Understanding your answer…"
                      : "Go ahead — I'm listening."}
                </p>
              )}

              {!isComplete && (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    {isRecording && (
                      <>
                        <span
                          className="mic-ring"
                          style={{ borderColor: "#2F5D5A33" }}
                        />
                        <span
                          className="mic-ring"
                          style={{
                            borderColor: "#2F5D5A22",
                            animationDelay: "0.6s",
                          }}
                        />
                      </>
                    )}
                    <button
                      onClick={toggleRecording}
                      disabled={micDisabled}
                      className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: isRecording ? "#2F5D5A" : "#FFFFFF",
                        color: isRecording ? "#FFFFFF" : "#4A4640",
                        border: "1px solid #E9E8E6",
                        boxShadow: isRecording
                          ? "0 14px 34px -14px rgba(47,93,90,0.55)"
                          : "0 10px 26px -16px rgba(11,11,11,0.25)",
                      }}
                      aria-label={
                        isRecording ? "Stop recording" : "Start recording"
                      }
                    >
                      {isRecording ? <Mic size={30} /> : <MicOff size={30} />}
                    </button>
                  </div>

                  {/* Muted pill note explaining the mic lock during speech */}
                  {isSpeaking && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: "#F3F3F0",
                        color: "#8A8A84",
                        border: "1px solid #E9E8E6",
                      }}
                    >
                      <Clock size={11} />
                      Mic unlocks once the interviewer finishes speaking
                    </span>
                  )}

                  {micError && (
                    <p
                      className="text-xs max-w-xs text-center flex items-center gap-1 rounded-full px-3 py-1.5"
                      style={{
                        color: "#B5502E",
                        backgroundColor: "#FBEEE8",
                        border: "1px solid #F2D9CC",
                      }}
                    >
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {micError}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div
            className="absolute bottom-6 right-6 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              width: 148,
              height: 108,
              background: "linear-gradient(160deg, #24443F 0%, #1A332F 100%)",
              border: `2px solid ${isRecording ? "#2F5D5A" : "#0B0B0B22"}`,
              boxShadow: isRecording
                ? "0 0 0 4px #2F5D5A33, 0 18px 34px -14px rgba(11,11,11,0.5)"
                : "0 14px 30px -12px rgba(11,11,11,0.45)",
            }}
          >
            <User size={48} strokeWidth={1.5} style={{ color: "#EEF3F2" }} />
            <span
              className="absolute bottom-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#0B0B0B66", color: "#FFFFFF" }}
            >
              You
            </span>
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{
                backgroundColor: isRecording ? "#4CAF7D" : "#9A9A94",
                boxShadow: isRecording ? "0 0 0 3px #4CAF7D33" : "none",
              }}
            />
          </div>
        </div>

        {/* Chat sidebar */}
        <div
          className="w-[360px] flex-shrink-0 flex flex-col min-h-0"
          style={{
            backgroundColor: "#FFFFFF",
            borderLeft: "1px solid #E9E8E6",
            boxShadow: "-8px 0 24px -20px rgba(11,11,11,0.2)",
          }}
        >
          <div
            className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
            style={{ borderBottom: "1px solid #E9E8E6" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6B6B66" }}
            >
              Conversation
            </p>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: "#F3F3F0", color: "#8A8A84" }}
            >
              <MessageCircle size={10} />
              {exchangeCount}
            </span>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                role={m.role}
                message={m.text}
                isSpeaking={
                  m.role === "ai" &&
                  isSpeaking &&
                  m.id === messages[messages.length - 1]?.id
                }
              />
            ))}
            {isThinking && (
              <ChatBubble
                role="ai"
                message="Thinking through your answer…"
                isSpeaking
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ip-bar {
          width: 7px;
          height: 46px;
          border-radius: 9999px;
          display: inline-block;
          opacity: 0.55;
          animation-name: ip-pulse;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transition: background-color 0.3s ease;
        }
        @keyframes ip-pulse {
          0%,
          100% {
            transform: scaleY(0.35);
            opacity: 0.35;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        @keyframes ip-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .status-dot {
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          display: inline-block;
          align-self: center;
          animation: ip-dot 1.1s ease-in-out infinite;
        }
        @keyframes ip-dot {
          0%,
          80%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        .mic-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          border: 1.5px solid;
          animation: ip-mic-ring 1.8s ease-out infinite;
        }
        @keyframes ip-mic-ring {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ip-bar,
          .status-dot,
          .mic-ring {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default InterviewPanel;
