// app/api/generate-description/route.ts
// Called by the "Auto-fill with AI" button in SetupForm via the hook's
// jobDescription() function.

import { meshChat } from "@/src/lib/mesh-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { role, experienceLevel } = (await req.json()) as {
      role: string;
      experienceLevel?: string;
    };

    if (!role?.trim()) {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }

    const description = await meshChat([
      {
        role: "system",
        content:
          "You write realistic job descriptions for hiring managers. Focus on what the person actually does day to day: their core responsibilities, the kind of work they own, and the skills the role requires. Avoid generic filler like 'great communication skills' or 'fast-paced environment' unless they are genuinely specific to this role. Respond with ONLY the description text, 4-6 sentences, no headers, no bullet points, no markdown, in clear English.",
      },
      {
        role: "user",
        content: `Write a job description for a ${experienceLevel || "mid-level"} ${role} position. Describe the actual day-to-day responsibilities and what this person would be expected to work on, so the description can later be used to generate relevant interview questions for this exact role.`,
      },
    ]);

    return NextResponse.json({ description: description.trim() });
  } catch (error: any) {
    console.error("Generate description route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate the job description." },
      { status: 500 },
    );
  }
}
