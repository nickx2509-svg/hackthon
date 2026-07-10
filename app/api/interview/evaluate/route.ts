// app/api/interview/evaluate/route.ts
// Called once the interview is marked isFinal. Sends the full transcript
// to Claude Sonnet via Mesh and gets back a structured score — this is
// the "calculation" the Dashboard renders, done for real by the model
// rather than any client-side math.

import { NextResponse } from "next/server";
import type { InterviewSetup, InterviewMessage } from "@/src/lib/meshAPI";
import { meshChat } from "@/src/lib/mesh-server";

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

    const transcriptText = transcript
      .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are MockMate AI, evaluating the interview transcript you just conducted for a ${
      setup.role
    } (${setup.experienceLevel || "unspecified"}) position. Score honestly and constructively based ONLY on what the candidate actually said — never invent details. Respond in English regardless of the interview's language, with ONLY a raw JSON object (no markdown fences, no prose, nothing before or after it) matching exactly this shape:
{"overallScore": number, "technicalKnowledge": number, "communicationSkills": number, "problemSolving": number, "languageProficiency": number, "strengths": string[], "weaknesses": string[], "areasToImprove": string[], "finalRecommendation": string}
All scores are 0-10, one decimal place. strengths: exactly 3 items. weaknesses: 2-3 items. areasToImprove: exactly 3 items. finalRecommendation: 1-2 sentences.`;

    const raw = await meshChat([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Job description: ${setup.jobDescription || "Not provided"}\n\nFull transcript:\n${transcriptText}`,
      },
    ]);

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const evaluation = JSON.parse(cleaned);

    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error("Interview evaluate route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate the evaluation." },
      { status: 500 },
    );
  }
}
