// lib/meshAPI.ts
// Client-safe constants & types. NEVER put the MESH_API_KEY in this file —
// it gets bundled into the browser. Server-only Mesh calls live in
// lib/mesh-server.ts instead.

export type LanguageOption = "english" | "hindi" | "hinglish";
export type VoiceOption = "male" | "female";

export interface InterviewSetup {
  fullName: string;
  role: string;
  experienceLevel: string;
  jobDescription: string;
  language: LanguageOption;
  voiceGender: VoiceOption;
}

export type MessageRole = "ai" | "candidate";

export interface InterviewMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface InterviewEvaluation {
  overallScore: number;
  technicalKnowledge: number;
  communicationSkills: number;
  problemSolving: number;
  languageProficiency: number;
  strengths: string[];
  weaknesses: string[];
  areasToImprove: string[];
  finalRecommendation: string;
}

export interface StoredInterviewResult {
  setup: InterviewSetup;
  transcript: InterviewMessage[];
  evaluation: InterviewEvaluation;
  completedAt: number;
}

export const SETUP_STORAGE_KEY = "mockmate_interview_setup";
export const RESULT_STORAGE_KEY = "mockmate_interview_result";

export const LANGUAGE_TABS: { id: LanguageOption; label: string }[] = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "hinglish", label: "Hinglish" },
];

export const VOICE_TABS: { id: VoiceOption; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

export const ROLE_OPTIONS: string[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA Engineer",
  "Marketing Manager",
  "Sales Executive",
  "HR Manager",
];

/**
 * Sarvam's `target_language_code` (via Mesh API) per interview language.
 *
 * - "english"  -> en-IN  (Indian-accented English, not US/UK)
 * - "hindi"    -> hi-IN
 * - "hinglish" -> hi-IN  (Sarvam's Bulbul model handles code-mixed
 *                Hindi/English text natively — you don't send a
 *                separate "hinglish" code, just mixed-script text)
 */
export const SARVAM_LANGUAGE_CODE: Record<LanguageOption, string> = {
  english: "en-IN",
  hindi: "hi-IN",
  hinglish: "hi-IN",
};

/**
 * Sarvam bulbul:v3 speaker (voice) IDs, by gender.
 * v3 has 30+ voices with lower pronunciation error rates than v2.
 * Picked "shubh" (male) and "priya" (female) — Sarvam's own docs
 * rate these as top picks for Hindi/English naturalness.
 * Other good options: female -> ishita, roopa | male -> aditya, rohan
 * (Note: v3 speaker names are NOT interchangeable with v2 — if you
 * ever switch the model back to bulbul:v2, you must also swap these
 * IDs to the v2 set: female -> anushka/manisha/vidya/arya,
 * male -> abhilash/karun/hitesh)
 */
export const SARVAM_SPEAKER: Record<VoiceOption, string> = {
  male: "shubh",
  female: "priya",
};
