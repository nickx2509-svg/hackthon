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

export const SARVAM_LANGUAGE_CODE: Record<LanguageOption, string> = {
  english: "en-IN",
  hindi: "hi-IN",
  hinglish: "hi-IN",
};

export const SARVAM_SPEAKER: Record<VoiceOption, string> = {
  male: "shubh",
  female: "roopa",
};
export const SCRIBE_LANGUAGE_CODE: Partial<Record<LanguageOption, string>> = {
  english: "eng",
  hindi: "hin",
};
