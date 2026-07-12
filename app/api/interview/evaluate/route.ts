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

    const systemPrompt = `You are MockMate AI, a warm and encouraging interview coach reviewing a completed practice interview for a ${
      setup.role
    } (${setup.experienceLevel || "unspecified"}) position. Your goal is to help the candidate see real, honest, achievable progress — grade like a supportive coach, not a strict technical exam grader who docks points for every imperfection.

SCORING SCALE — use this as your anchor, not an academic 0-10 curve:
- 9.0–10: Exceptional, essentially interview-ready. Reserve this for truly outstanding answers — most candidates should NOT land here.
- 7.0–8.9: Solid, competent performance with normal room to grow. THIS SHOULD BE THE MOST COMMON RANGE for a candidate who engaged seriously and gave real, on-topic answers to every question — even if those answers weren't perfectly polished, missed some technical depth, or could have used a sharper example.
- 5.0–6.9: Adequate but noticeably underdeveloped — answers were on-topic but thin, vague, or missing key substance in multiple places.
- Below 5.0: Reserved ONLY for answers that were largely off-topic, extremely short non-answers ("I don't know", one-word replies), or showed no relevant understanding at all.

Default assumption: if the candidate answered every question with real, relevant content, their overall score should land in the 7–8.5 range by default. Do not subtract heavily for missing buzzwords, imperfect structure, or answers that "could have been more specific" — that's normal for any real interview and belongs in weaknesses/areasToImprove, not a low score. Only score below 6 if the substance was actually missing, not just the polish.

Score honestly and constructively based ONLY on what the candidate actually said — never invent details. Respond in English regardless of the interview's language, with ONLY a raw JSON object (no markdown fences, no prose, nothing before or after it) matching exactly this shape:
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
