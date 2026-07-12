
import { NextResponse } from "next/server";
import type { InterviewSetup, LanguageOption } from "@/src/lib/meshAPI";

import { meshChat } from "@/src/lib/mesh-server";

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

export async function POST(req: Request) {
  try {
    const { setup } = (await req.json()) as { setup: InterviewSetup };

    if (!setup?.role) {
      return NextResponse.json(
        { error: "Interview setup is missing." },
        { status: 400 },
      );
    }

    const text = await meshChat([
      {
        role: "system",
        content: `You are MockMate AI, a warm, professional senior interviewer. You're about to start a mock interview with ${
          setup.fullName || "the candidate"
        } for the role of ${setup.role} (${setup.experienceLevel || "unspecified"} level). ${languageInstruction(
          setup.language,
        )}
Greet them by name, mention you'll be conducting their mock interview for this role today, and reassure them briefly that it's a safe space to practice. Then ask your first interview question. Keep the whole thing under 35 words, natural and conversational — like a real interviewer speaking out loud, not a written message. Do not use markdown or lists.`,
      },
      { role: "user", content: "Begin the interview." },
    ]);

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error("Interview start route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to start interview." },
      { status: 500 },
    );
  }
}
