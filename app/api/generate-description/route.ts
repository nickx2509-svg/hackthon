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
          "You write short, realistic job descriptions for hiring managers. Respond with ONLY the description text, 3-5 sentences, no headers or markdown, in English.",
      },
      {
        role: "user",
        content: `Write a job description for a ${experienceLevel || "mid-level"} ${role} position.`,
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
