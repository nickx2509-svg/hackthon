// lib/meshAPI.ts
//
// Real integration layer. Every call goes through our own Next.js route
// (/api/interview), which is the only place holding MESH_API_KEY.

export type LanguageOption = "english" | "hindi" | "hinglish";
export type VoiceOption = "male" | "female" | "neutral";

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

export const SETUP_STORAGE_KEY = "mockmate_setup";
export const RESULT_STORAGE_KEY = "mockmate_result";

export const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer (iOS/Android)",
  "DevOps Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Cloud Engineer",
];

// Tab metadata for language selection — icon choice lives in the component,
// this just carries the sample line used for voice previews and the closest
// speechSynthesis locale.
export const LANGUAGE_TABS: {
  id: LanguageOption;
  label: string;
  sample: string;
  ttsLang: string;
}[] = [
  {
    id: "english",
    label: "English",
    sample: "Hello, thanks for joining. I'll be your interviewer today.",
    ttsLang: "en-US",
  },
  {
    id: "hindi",
    label: "हिंदी",
    sample: "नमस्ते, आज मैं आपका साक्षात्कार लूंगा।",
    ttsLang: "hi-IN",
  },
  {
    id: "hinglish",
    label: "Hinglish",
    sample: "Hello, aaj main aapka interview lunga. Chaliye shuru karte hain.",
    ttsLang: "en-IN",
  },
];

// Tab metadata for voice selection — pitch/rate drive an audible male vs
// female vs neutral difference regardless of which system voices a given
// browser happens to have installed (those vary too much to rely on).
export const VOICE_TABS: {
  id: VoiceOption;
  label: string;
  pitch: number;
  rate: number;
}[] = [
  { id: "male", label: "Male", pitch: 0.82, rate: 0.98 },
  { id: "female", label: "Female", pitch: 1.25, rate: 1.0 },
  { id: "neutral", label: "Neutral", pitch: 1.0, rate: 1.0 },
];

const CLOSING_PHRASE = "This concludes our interview";

async function callInterviewAPI<T = any>(
  payload: Record<string, unknown>,
): Promise<T> {
  const res = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Interview API failed (${res.status})`);
  }
  return data as T;
}

export async function startInterview(setup: InterviewSetup): Promise<string> {
  const data = await callInterviewAPI<{ text: string }>({
    action: "start",
    setup,
  });
  return data.text;
}

export async function getNextQuestion(
  setup: InterviewSetup,
  transcript: InterviewMessage[],
): Promise<string> {
  const data = await callInterviewAPI<{ text: string }>({
    action: "next",
    setup,
    transcript,
  });
  return data.text;
}

export function isClosingStatement(text: string): boolean {
  return text.includes(CLOSING_PHRASE);
}

export async function generateJobDescription(
  role: string,
  experienceLevel: string,
): Promise<string> {
  const data = await callInterviewAPI<{ text: string }>({
    action: "jobdesc",
    setup: { role, experienceLevel },
  });
  return data.text;
}

export async function evaluateInterview(
  setup: InterviewSetup,
  transcript: InterviewMessage[],
): Promise<InterviewEvaluation> {
  const data = await callInterviewAPI<InterviewEvaluation>({
    action: "evaluate",
    setup,
    transcript,
  });
  return data;
}
