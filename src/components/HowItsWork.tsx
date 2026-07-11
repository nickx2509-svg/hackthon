"use client";

import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ClipboardEdit,
  MessageCircle,
  Mic,
  BrainCircuit,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// Muted-blue keyword highlight, matches the accent used for voice/language
// tabs elsewhere in the app so the whole product feels visually consistent.
function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 font-semibold"
      style={{ backgroundColor: "#EAF0FA", color: "#3B5B92" }}
    >
      {children}
    </span>
  );
}

// Small muted pill next to a step heading — a quick tag for what powers
// that particular step.
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: "#EEF3F2",
        color: "#2F5D5A",
        border: "1px solid #DCE9E7",
      }}
    >
      <Sparkles size={9} />
      {children}
    </span>
  );
}

const STEPS = [
  {
    icon: ClipboardEdit,
    title: "Set up your interview",
    tag: null as string | null,
    body: (
      <>
        Enter your name, target role, experience level, and pick an{" "}
        <Hl>interview language</Hl> and <Hl>interviewer voice</Hl>. Everything
        you enter stays in your <Hl>browser session</Hl> only — no signup, no
        database, nothing saved once you close the tab.
      </>
    ),
  },
  {
    icon: MessageCircle,
    title: "Meet your AI interviewer",
    tag: "Gemini voice",
    body: (
      <>
        <Hl>MeshAPI</Hl> greets you by name and asks the first question. It's
        spoken aloud using <Hl>Gemini's text-to-speech</Hl>, so it feels like an
        actual conversation, not a quiz form.
      </>
    ),
  },
  {
    icon: Mic,
    title: "Answer by voice, mic off by default",
    tag: "Gemini transcription",
    body: (
      <>
        Tap the mic to start recording — until you tap it, the interviewer{" "}
        <Hl>can't hear anything</Hl> you say. Tap again to stop, and{" "}
        <Hl>Gemini transcribes</Hl> your answer into text automatically. Your
        reply appears instantly in the conversation panel on the right.
      </>
    ),
  },
  {
    icon: BrainCircuit,
    title: "Adaptive follow-ups",
    tag: null,
    body: (
      <>
        <Hl>MeshAPI</Hl> reads your last answer and decides the next question
        based on it — going deeper on strong answers, redirecting on vague ones
        — the same way a real interviewer adjusts on the fly.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Interview wraps up naturally",
    tag: null,
    body: (
      <>
        Once the AI has enough to evaluate you, it closes the interview with a
        clear thank-you message. The app detects this <Hl>completion signal</Hl>{" "}
        automatically and stops asking questions.
      </>
    ),
  },
  {
    icon: LayoutDashboard,
    title: "Get your evaluation dashboard",
    tag: "PDF report",
    body: (
      <>
        Your full transcript is sent to <Hl>MeshAPI</Hl> for a professional{" "}
        <Hl>AI evaluation</Hl> — scored metric cards for technical knowledge,
        communication, problem solving, and language proficiency, plus
        strengths, weaknesses, and a final recommendation. You can also{" "}
        <Hl>download it as a PDF</Hl> to keep or share.
      </>
    ),
  },
];

export function HowItWork() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 w-full px-4 py-20 md:py-28"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#2F5D5A" }}
          >
            How It Works
          </span>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
            style={{ color: "#0B0B0B" }}
          >
            From setup to evaluation, end to end
          </h2>
          <p
            className="text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: "#6B6B66" }}
          >
            A quick walkthrough of exactly what happens behind the scenes every
            time you start a mock interview.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-14"
          style={{ backgroundColor: "#FDF6EC", border: "1px solid #F0E0BE" }}
        >
          <AlertTriangle
            size={18}
            style={{ color: "#B5822E" }}
            className="flex-shrink-0 mt-0.5"
          />
          <p className="text-xs leading-relaxed" style={{ color: "#6B5A33" }}>
            <strong>Disclaimer:</strong> MockMate AI was built purely for the{" "}
            <strong>MeshAPI Hackathon</strong>, hosted by{" "}
            <strong>Dhruv Rathee</strong>. It's a demo MVP built to showcase
            what MeshAPI can power in an interactive interview flow - not a
            production product, and no data is stored beyond your current
            browser tab.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
                className="group flex gap-4 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#F9F9F6",
                  border: "1px solid #E9E8E6",
                }}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-shadow duration-200 group-hover:shadow-md"
                    style={{
                      backgroundColor: "#EEF3F2",
                      border: "1px solid #DCE9E7",
                    }}
                  >
                    <Icon size={22} style={{ color: "#2F5D5A" }} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="mt-2 h-full w-px flex-1"
                      style={{ backgroundColor: "#E9E8E6" }}
                    />
                  )}
                </div>

                <div className="pb-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
                    >
                      {i + 1}
                    </span>
                    <h3
                      className="text-base font-semibold"
                      style={{ color: "#0B0B0B" }}
                    >
                      {step.title}
                    </h3>
                    {step.tag && <Tag>{step.tag}</Tag>}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#4A4640" }}
                  >
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <p className="text-sm" style={{ color: "#9A9A94" }}>
            That's the whole flow — no accounts, no history, just a real-feeling
            interview from start to finish.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
