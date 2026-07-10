"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertCircle,
  Globe,
  Landmark,
  Shuffle,
  User,
  Users,
  Play,
  Volume2,
} from "lucide-react";
import {
  InterviewSetup,
  ROLE_OPTIONS,
  SETUP_STORAGE_KEY,
  LANGUAGE_TABS,
  VOICE_TABS,
  type LanguageOption,
  type VoiceOption,
} from "../lib/meshAPI";
import { useInterviewAPI } from "../hook/useInterviewAPi";
import SearchableCombobox from "../components/SearchableCombobox";
import { useElevenLabs } from "../hook/useElevanLabs";

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead / Principal",
];

const LANGUAGE_ICONS: Record<LanguageOption, React.ElementType> = {
  english: Globe,
  hindi: Landmark,
  hinglish: Shuffle,
};

const VOICE_ICONS: Record<VoiceOption, React.ElementType> = {
  male: User,
  female: Users,
  neutral: Sparkles,
};

const ACCENT_BLUE = "#3B5B92";
const ACCENT_BLUE_BG = "#EAF0FA";
const ACCENT_BLUE_BORDER = "#C9D9EE";

const initialState: InterviewSetup = {
  fullName: "",
  role: "",
  experienceLevel: "",
  jobDescription: "",
  language: "english",
  voiceGender: "neutral",
};

type FormErrors = Partial<Record<keyof InterviewSetup, string>>;

function SetupForm() {
  const router = useRouter();
  const {
    jobDescription: generateJobDescription,
    loading: isGeneratingDesc,
    error: apiError,
  } = useInterviewAPI();

  const [formData, setFormData] = useState<InterviewSetup>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isStarting, setIsStarting] = useState(false);
  const [hoveredVoice, setHoveredVoice] = useState<VoiceOption | null>(null);

  const { speak, isSpeaking } = useElevenLabs();
  const handleChange = (field: keyof InterviewSetup, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!formData.fullName.trim()) next.fullName = "Enter your full name";
    if (!formData.role.trim())
      next.role = "Enter the role you are applying for";
    if (!formData.experienceLevel)
      next.experienceLevel = "Select your experience level";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsStarting(true);
    sessionStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(formData));

    setTimeout(() => {
      router.push("/interview");
    }, 250);
  };

  const handleAutoFillDescription = async () => {
    if (!formData.role.trim()) {
      setErrors((prev) => ({
        ...prev,
        role: "Pick a role first so AI knows what to write",
      }));
      return;
    }
    const desc = await generateJobDescription(
      formData.role,
      formData.experienceLevel,
    );
    if (desc) handleChange("jobDescription", desc);
  };

  const inputStyle = (hasError?: string) => ({
    backgroundColor: "#F9F9F6",
    border: `1px solid ${hasError ? "#C7714F" : "#E9E8E6"}`,
    color: "#0B0B0B",
  });

  return (
    <div
      id="setup-form"
      className="scroll-mt-24 w-full flex items-center justify-center px-4 py-20 md:py-28"
      style={{ backgroundColor: "#F9F9F6" }}
    >
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#2F5D5A" }}
          >
            MockMate AI
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
            style={{ color: "#0B0B0B" }}
          >
            Set up your mock interview
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "#6B6B66" }}
          >
            Tell us a bit about the role you&apos;re preparing for.
            <br className="hidden sm:block" />
            Your interviewer will take it from there.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_1px_2px_rgba(11,11,11,0.04)]"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
        >
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="e.g. Nick Carter"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                ...inputStyle(errors.fullName),
                ["--tw-ring-color" as any]: "#2F5D5A33",
              }}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs" style={{ color: "#B5502E" }}>
                {errors.fullName}
              </p>
            )}
          </div>

          <SearchableCombobox
            label="Role Applying For"
            value={formData.role}
            onChange={(v) => handleChange("role", v)}
            options={ROLE_OPTIONS}
            placeholder="Search or type a role, e.g. Frontend Developer"
            allowCreate
            error={errors.role}
          />

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => handleChange("experienceLevel", e.target.value)}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none appearance-none cursor-pointer"
              style={{
                ...inputStyle(errors.experienceLevel),
                color: formData.experienceLevel ? "#0B0B0B" : "#9A9A94",
              }}
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="mt-1 text-xs" style={{ color: "#B5502E" }}>
                {errors.experienceLevel}
              </p>
            )}
          </div>

          {/* Interview Language — tab group */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              Interview Language
            </label>
            <div
              className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E9E8E6",
              }}
            >
              {LANGUAGE_TABS.map((lang) => {
                const Icon = LANGUAGE_ICONS[lang.id];
                const active = formData.language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleChange("language", lang.id)}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg py-3 px-2 text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: active ? ACCENT_BLUE_BG : "#FFFFFF",
                      color: active ? ACCENT_BLUE : "#6B6B66",
                      border: `1px solid ${active ? ACCENT_BLUE_BORDER : "transparent"}`,
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interviewer Voice — tab group with hover-to-preview */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              Interviewer Voice
            </label>
            <div
              className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E9E8E6",
              }}
            >
              {VOICE_TABS.map((voice) => {
                const Icon = VOICE_ICONS[voice.id];
                const active = formData.voiceGender === voice.id;
                const hovered = hoveredVoice === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => handleChange("voiceGender", voice.id)}
                    onMouseEnter={() => setHoveredVoice(voice.id)}
                    onMouseLeave={() => setHoveredVoice(null)}
                    className="relative flex flex-col items-center justify-center gap-1 rounded-lg py-3 px-2 text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: active ? ACCENT_BLUE_BG : "#FFFFFF",
                      color: active ? ACCENT_BLUE : "#6B6B66",
                      border: `1px solid ${active ? ACCENT_BLUE_BORDER : "transparent"}`,
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    {voice.label}

                    <button
                      type="button"
                      disabled={isSpeaking}
                      aria-label={`Preview ${voice.label} voice`}
                      onClick={async (e) => {
                        e.stopPropagation();

                        const previewText = {
                          english:
                            "Hello. I'm your MockMate AI interviewer. This is how I will sound during your interview. Best of luck.",

                          hindi:
                            "नमस्ते। मैं आपका MockMate AI इंटरव्यूअर हूँ। इंटरव्यू के दौरान मेरी आवाज़ कुछ ऐसी सुनाई देगी। आपको शुभकामनाएँ।",

                          hinglish:
                            "Hello! Main aapka MockMate AI interviewer hoon. Interview ke dauran meri voice kuch aisi hogi. All the best!",
                        };

                        await speak(
                          previewText[formData.language],
                          formData.language,
                          formData.voiceGender === "neutral"
                            ? "female"
                            : formData.voiceGender,
                        );
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
                      style={{
                        backgroundColor: active ? ACCENT_BLUE : "#2F5D5A",
                        color: "#FFFFFF",
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "scale(1)" : "scale(0.7)",
                        boxShadow: "0 2px 6px rgba(11,11,11,0.18)",
                      }}
                    >
                      {isSpeaking ? (
                        <Volume2 size={11} className="animate-pulse" />
                      ) : (
                        <Play size={11} />
                      )}{" "}
                    </button>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: "#9A9A94" }}>
              Hover a voice and tap the icon to preview it.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-sm font-medium"
                style={{ color: "#0B0B0B" }}
              >
                Job Description{" "}
                <span className="font-normal" style={{ color: "#9A9A94" }}>
                  (optional)
                </span>
              </label>
              <button
                type="button"
                onClick={handleAutoFillDescription}
                disabled={isGeneratingDesc}
                className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: "#EEF3F2",
                  color: "#2F5D5A",
                  border: "1px solid #DCE9E7",
                }}
              >
                <Sparkles
                  size={13}
                  className={isGeneratingDesc ? "animate-pulse" : ""}
                />
                {isGeneratingDesc ? "Generating…" : "Auto-fill with AI"}
              </button>
            </div>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              placeholder="Paste the job description, or click Auto-fill with AI"
              rows={4}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none transition-colors focus:ring-2"
              style={{
                ...inputStyle(),
                ["--tw-ring-color" as any]: "#2F5D5A33",
              }}
            />
            {apiError && (
              <p
                className="mt-1.5 text-xs flex items-center gap-1"
                style={{ color: "#B5502E" }}
              >
                <AlertCircle size={12} className="flex-shrink-0" />
                Couldn&apos;t auto-fill: {apiError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isStarting}
            className="w-full rounded-lg py-3 text-sm font-medium transition-all duration-200 disabled:opacity-70 hover:opacity-90 active:scale-[0.99]"
            style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
          >
            {isStarting ? "Starting interview…" : "Start Interview"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: "#9A9A94" }}>
          Nothing is saved beyond this browser tab — no account, no history.
        </p>
      </div>
    </div>
  );
}

export default SetupForm;
