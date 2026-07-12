import { NextResponse } from "next/server";
import type {
  InterviewSetup,
  InterviewMessage,
  LanguageOption,
} from "@/src/lib/meshAPI";
import { meshChat } from "@/src/lib/mesh-server";

const END_MARKER = "[[END_INTERVIEW]]";

const MARKER_PATTERN = /[\s.,!?]*\**_*\[\[END_INTERVIEW\]\]\**_*[\s.,!?]*/gi;

const TOTAL_QUESTIONS = 6;

function languageInstruction(language: LanguageOption): string {
  switch (language) {
    case "hindi":
      return "Reply entirely in Hindi, written in Devanagari script.";
    case "hinglish":
      return "Reply in natural Hinglish — Hindi-English code-mixed, written in Roman script.";
    default:
      return "Reply entirely in English.";
  }
}

function cleanClosingText(raw: string): string {
  let text = raw.replace(MARKER_PATTERN, " ");
  text = text
    .replace(/\*\*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  text = text.replace(/\s+([.,!?])/g, "$1");
  return text;
}

export async function POST(req: Request) {
  try {
    const { setup, transcript } = (await req.json()) as {
      setup: InterviewSetup;
      transcript: InterviewMessage[];
    };

    if (!setup?.role || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: "Setup and transcript are required." },
        { status: 400 },
      );
    }

    const askedSoFar = transcript.filter((m) => m.role === "ai").length;

    const systemPrompt = `You are MockMate AI, a friendly senior interviewer conducting a live mock interview for the role of ${
      setup.role
    } (${setup.experienceLevel || "unspecified"} level). ${languageInstruction(setup.language)}

Rules:
- You ask one question at a time and read the candidate's spoken answers.
- Briefly react to their last answer in one short, natural sentence (encouraging, conversational - not a numeric score), then ask the next relevant technical or behavioral question.
- Plan for about ${TOTAL_QUESTIONS} questions total across the whole interview. You have asked ${askedSoFar} so far.
- Keep every reply short — under 25 words — since it will be spoken out loud.
- When you've asked enough questions (around question ${TOTAL_QUESTIONS}) and it's time to wrap up: thank the candidate warmly for their time, briefly say the interview is complete, and end your message with exactly this token on its own with nothing after it: ${END_MARKER}
- Never include ${END_MARKER} unless you are actually ending the interview in that exact message.
- Do not wrap the marker in markdown formatting (no asterisks, no bold) and do not put any punctuation directly touching it.
- Do not use markdown or lists.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...transcript.map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
        content: m.text,
      })),
    ];

    const raw = await meshChat(messages);
    const isFinal = MARKER_PATTERN.test(raw);
    MARKER_PATTERN.lastIndex = 0;
    const text = isFinal ? cleanClosingText(raw) : raw.trim();

    return NextResponse.json({ text, isFinal });
  } catch (error: any) {
    console.error("Interview next route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate the next question." },
      { status: 500 },
    );
  }
}
