// app/api/interview/start/route.ts
// Called once when the interview page loads. Sends the setup to Claude
// Sonnet via Mesh and gets back a greeting + first question.

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
        { error: "Setup is required." },
        { status: 400 },
      );
    }

    const systemPrompt = `You are MockMate AI, a friendly senior interviewer about to begin a live mock interview for the role of ${
      setup.role
    } (${setup.experienceLevel || "unspecified"} level). ${languageInstruction(setup.language)}

Rules:
- Greet the candidate by name (${setup.fullName || "there"}), briefly introduce yourself as the interviewer, and explain that the interview is starting now.
- Then ask your first question — something warm and easy, like asking them to introduce themselves or walk through their background.
- Keep your whole reply under 45 words since it will be spoken out loud.
- Do not use markdown, lists, or any end-of-interview marker in this message.`;

    const text = await meshChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Begin the interview." },
    ]);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Interview start route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to start the interview." },
      { status: 500 },
    );
  }
}
