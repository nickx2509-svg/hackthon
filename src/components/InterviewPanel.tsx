"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, User, Send, AlertCircle, Sparkles } from "lucide-react";
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

let idCounter = 0;
const nextId = () => `msg_${Date.now()}_${idCounter++}`;

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");

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
      setMicError(
        "Voice recording isn't supported in this browser. Use the text box below instead.",
      );
      return;
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      setMicSupported(false);
      setMicError(
        "Voice input needs a secure connection (HTTPS or localhost). Use the text box below instead.",
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
          "Sorry — I couldn't start the interview right now. Check your connection and refresh the page to try again.",
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

  // Clean up any in-flight audio on unmount
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  function pushMessage(role: "ai" | "candidate", text: string) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role, text, timestamp: Date.now() },
    ]);
  }

  // Real TTS via Mesh/Sarvam instead of the browser's speechSynthesis.
  // If it fails for any reason, the text is already visible in the chat,
  // so we fail silently rather than blocking the interview.
  async function speak(text: string) {
    if (!setup) return;
    try {
      setIsSpeaking(true);
      const blob = await generateSpeech({
        text,
        language: setup.language,
        gender: setup.voiceGender,
      });

      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioElRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
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
          setMicError(
            "Didn't catch any audio — try again or type your answer.",
          );
          return;
        }

        setIsTranscribing(true);
        const text = await apiTranscribe(blob, setup);
        setIsTranscribing(false);

        if (!text) {
          setMicError(
            apiError ||
              "Couldn't understand that. Try again or type your answer.",
          );
          return;
        }

        submitAnswer(text);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setMicError(
        "Microphone permission was denied. Allow it in your browser settings and try again.",
      );
    }
  }

  function handleTextSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    submitAnswer(text);
  }

  function handleTextKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
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
        "Sorry — something went wrong on my end generating the next question. Could you try sending that answer again?",
      );
      return;
    }

    pushMessage("ai", result.text);
    speak(result.text);

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
      finishInterview(finalTranscript);
    }
  }

  async function finishInterview(transcript: InterviewMessage[]) {
    if (!setup) return;
    const evaluation = await apiEvaluate(setup, transcript);

    if (!evaluation) {
      pushMessage(
        "ai",
        "The interview wrapped up, but I couldn't generate your evaluation just now. Please try refreshing — your answers are still in this tab's session.",
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
    setIsRedirecting(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  if (!setup) return null;

  const statusText = isRedirecting
    ? "Wrapping up — taking you to your results…"
    : isComplete
      ? "Interview complete"
      : isThinking
        ? "Interviewer is thinking…"
        : isTranscribing
          ? "Understanding your answer…"
          : isSpeaking
            ? "Interviewer is speaking…"
            : isRecording
              ? "Recording…"
              : "In progress";

  const micDisabled =
    !micSupported || isThinking || isComplete || isSpeaking || isTranscribing;
  const inputDisabled = isThinking || isComplete;

  const voiceLabel =
    VOICE_TABS.find((v) => v.id === setup.voiceGender)?.label || "Male";
  const languageLabel =
    LANGUAGE_TABS.find((l) => l.id === setup.language)?.label || "English";

  const orbBarColor = isRecording ? "#3B5B92" : "#2F5D5A";
  const barSpeed = isSpeaking ? "0.55s" : isRecording ? "0.5s" : "2.6s";

  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#F9F9F6" }}
    >
      <div className="opacity-50">
        <CursorGlow />
      </div>

      {/* Header */}
      <div
        className="relative z-[2] flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          borderBottom: "1px solid #E9E8E6",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "#0B0B0B" }}>
            {setup.role} Interview
          </p>
          <p className="text-xs" style={{ color: "#9A9A94" }}>
            {statusText}
          </p>
        </div>
        <span
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: "#2F5D5A" }}
        >
          MockMate AI
        </span>
      </div>

      {/* Main area: stage + sidebar */}
      <div className="relative z-[2] flex-1 flex min-h-0">
        {/* Stage (left) */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 gap-6">
          {isPreparing ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full animate-spin"
                style={{
                  border: "3px solid #E9E8E6",
                  borderTopColor: "#2F5D5A",
                }}
              />
              <p className="text-sm" style={{ color: "#6B6B66" }}>
                Preparing your interview…
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E9E8E6",
                  color: "#6B6B66",
                }}
              >
                <Sparkles size={11} style={{ color: "#2F5D5A" }} />
                {languageLabel} · {voiceLabel} voice
              </div>

              <div
                className="rounded-full flex items-center justify-center transition-transform duration-300"
                style={{
                  width: 220,
                  height: 220,
                  background:
                    "radial-gradient(circle at 32% 28%, #F3F8F7 0%, #E7EFEE 70%)",
                  border: "1px solid #D3E3E1",
                  transform: isSpeaking ? "scale(1.04)" : "scale(1)",
                  boxShadow: isSpeaking
                    ? "0 0 0 16px #2F5D5A14"
                    : isRecording
                      ? "0 0 0 16px #3B5B9214"
                      : "0 0 0 0px #2F5D5A00",
                  transition: "box-shadow .3s, transform .3s",
                }}
              >
                <div
                  className="flex items-end justify-center gap-[7px]"
                  style={{ height: 60 }}
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

              <p
                className="text-lg leading-relaxed max-w-lg text-center"
                style={{ color: "#20403D" }}
              >
                {isRedirecting
                  ? "Thank you for your time — generating your evaluation…"
                  : messages[messages.length - 1]?.role === "ai"
                    ? messages[messages.length - 1]?.text
                    : isThinking
                      ? "Thinking through your answer…"
                      : isTranscribing
                        ? "Understanding your answer…"
                        : "Go ahead — I'm listening."}
              </p>

              {!isComplete && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleRecording}
                    disabled={micDisabled}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: isRecording ? "#2F5D5A" : "#FFFFFF",
                      color: isRecording ? "#FFFFFF" : "#4A4640",
                      border: "1px solid #E9E8E6",
                      boxShadow: isRecording ? "0 0 0 10px #2F5D5A22" : "none",
                    }}
                    aria-label={
                      isRecording ? "Stop recording" : "Start recording"
                    }
                  >
                    {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  {isSpeaking && (
                    <p className="text-xs" style={{ color: "#9A9A94" }}>
                      Wait for the interviewer to finish…
                    </p>
                  )}
                  {(micError || apiError) && (
                    <p
                      className="text-xs max-w-xs text-center flex items-center gap-1"
                      style={{ color: "#B5502E" }}
                    >
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {micError || apiError}
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
              backgroundColor: "#20403D",
              border: `2px solid ${isRecording ? "#2F5D5A" : "#0B0B0B22"}`,
              boxShadow: isRecording
                ? "0 0 0 4px #2F5D5A33"
                : "0 4px 14px rgba(11,11,11,0.12)",
            }}
          >
            <User size={44} strokeWidth={1.5} style={{ color: "#EEF3F2" }} />
            <span
              className="absolute bottom-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#0B0B0B66", color: "#FFFFFF" }}
            >
              You
            </span>
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: isRecording ? "#4CAF7D" : "#9A9A94" }}
            />
          </div>
        </div>

        {/* Chat sidebar (right) */}
        <div
          className="w-[360px] flex-shrink-0 flex flex-col min-h-0"
          style={{
            backgroundColor: "#FFFFFF",
            borderLeft: "1px solid #E9E8E6",
          }}
        >
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #E9E8E6" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6B6B66" }}
            >
              Conversation
            </p>
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

          <form
            onSubmit={handleTextSubmit}
            className="flex-shrink-0 px-3 py-3 flex items-end gap-2"
            style={{ borderTop: "1px solid #E9E8E6" }}
          >
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextKeyDown}
              disabled={inputDisabled}
              placeholder={
                isComplete
                  ? "Interview finished"
                  : "Type your answer… (Enter to send)"
              }
              rows={3}
              className="flex-1 resize-none rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 disabled:opacity-60"
              style={{
                backgroundColor: "#F9F9F6",
                border: "1px solid #E9E8E6",
                color: "#0B0B0B",
                minHeight: 84,
                ["--tw-ring-color" as any]: "#2F5D5A33",
              }}
            />
            <button
              type="submit"
              disabled={inputDisabled || !textInput.trim()}
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
              aria-label="Send answer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .ip-bar {
          width: 6px;
          height: 42px;
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
      `}</style>
    </div>
  );
}

export default InterviewPanel;
