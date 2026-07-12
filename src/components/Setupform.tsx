"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Loader2,
  Briefcase,
  BadgeCheck,
  Info,
  FileText,
  LucideIcon,
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
import { useGeminiTTS } from "../hook/useGemeniTTS";

// Draft key — separate from SETUP_STORAGE_KEY (which holds the *submitted*
// setup used by the interview page). This one just keeps whatever the
// person has typed so far so a refresh doesn't wipe an unfinished form.
const SETUP_DRAFT_KEY = "mockmate_interview_setup_draft";

function loadDraft(): InterviewSetup | null {
  try {
    const raw = sessionStorage.getItem(SETUP_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as InterviewSetup) : null;
  } catch {
    return null;
  }
}

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

const VOICE_ICONS: Record<VoiceOption, LucideIcon> = {
  male: User,
  female: Users,
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
  voiceGender: "female",
};

type FormErrors = Partial<Record<keyof InterviewSetup, string>>;

function SetupForm() {
  const router = useRouter();
  const {
    jobDescription: generateJobDescription,
    loading: isGeneratingDesc,
    error: apiError,
  } = useInterviewAPI();
  const { speak, stop, isSpeaking } = useGeminiTTS();

  // Restore any in-progress draft on first render, instead of always
  // starting blank — this is what makes a refresh keep your typed values.
  const [formData, setFormData] = useState<InterviewSetup>(
    () => loadDraft() ?? initialState,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isStarting, setIsStarting] = useState(false);
  const [hoveredVoice, setHoveredVoice] = useState<VoiceOption | null>(null);

  // Persist the draft on every change so a refresh restores it exactly.
  useEffect(() => {
    try {
      sessionStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // non-fatal — worst case a refresh loses the draft this one time
    }
  }, [formData]);

  const handleChange = (field: keyof InterviewSetup, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isFormValid = useMemo(
    () =>
      Boolean(
        formData.fullName.trim() &&
        formData.role.trim() &&
        formData.experienceLevel,
      ),
    [formData.fullName, formData.role, formData.experienceLevel],
  );

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
    if (isStarting) return;
    if (!validate()) return;

    setIsStarting(true);
    sessionStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(formData));
    // The draft's job is done once the interview actually starts.
    sessionStorage.removeItem(SETUP_DRAFT_KEY);

    setTimeout(() => {
      router.push("/interview");
    }, 550);
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
      <div className="w-full max-w-2xl">
        <div className="mb-11 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            style={{
              backgroundColor: "#EEF3F2",
              color: "#2F5D5A",
              border: "1px solid #DCE9E7",
            }}
          >
            <Sparkles size={12} />
            MockMate AI · Setup
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.08]"
            style={{ color: "#0B0B0B" }}
          >
            Set up your mock interview
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
            style={{ color: "#6B6B66" }}
          >
            A few details, and your interviewer will build the whole session
            around them — role, level, language, even the voice you hear.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-7 sm:p-10 space-y-7"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E9E8E6",
            boxShadow: "0 24px 60px -32px rgba(11,11,11,0.22)",
          }}
        >
          <div>
            <label
              className="flex items-center gap-1.5 text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              <User size={14} style={{ color: "#6B6B66" }} />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="e.g. Nick Carter"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-colors focus:ring-2"
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

          <SearchableCombobox
            label="Experience Level"
            value={formData.experienceLevel}
            onChange={(v) => handleChange("experienceLevel", v)}
            options={EXPERIENCE_LEVELS}
            placeholder="Select your experience level"
            allowCreate={false}
            error={errors.experienceLevel}
          />

          <div>
            <label
              className="flex items-center gap-1.5 text-sm font-medium mb-1.5"
              style={{ color: "#0B0B0B" }}
            >
              <Globe size={14} style={{ color: "#6B6B66" }} />
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
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg py-3.5 px-2 text-xs font-medium border transition-all duration-150 ${
                      active
                        ? "border-[#C9D9EE]"
                        : "border-transparent hover:bg-[#F5F8F7] hover:border-[#DCE9E7]"
                    }`}
                    style={{
                      backgroundColor: active ? ACCENT_BLUE_BG : "#FFFFFF",
                      color: active ? ACCENT_BLUE : "#6B6B66",
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "#0B0B0B" }}
              >
                <Play size={13} style={{ color: "#6B6B66" }} />
                Interviewer Voice
              </label>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: "#EEF3F2",
                  color: "#2F5D5A",
                  border: "1px solid #DCE9E7",
                }}
              >
                <Sparkles size={9} />
                Gemini voice
              </span>
            </div>
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
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-lg py-3.5 px-2 text-xs font-medium border transition-all duration-150 ${
                      active
                        ? "border-[#C9D9EE]"
                        : "border-transparent hover:bg-[#F5F8F7] hover:border-[#DCE9E7]"
                    }`}
                    style={{
                      backgroundColor: active ? ACCENT_BLUE_BG : "#FFFFFF",
                      color: active ? ACCENT_BLUE : "#6B6B66",
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    {voice.label}

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Preview ${voice.label} voice`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSpeaking) return;
                        speak(formData.language, voice.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          (e.currentTarget as HTMLDivElement).click();
                        }
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: active ? ACCENT_BLUE : "#2F5D5A",
                        color: "#FFFFFF",
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "scale(1)" : "scale(0.7)",
                        boxShadow: "0 2px 6px rgba(11,11,11,0.18)",
                        pointerEvents: isSpeaking ? "none" : "auto",
                      }}
                    >
                      {isSpeaking ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <Play size={11} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: "#9A9A94" }}>
              Hover a voice and tap the icon to preview it.
            </p>
          </div>

          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ backgroundColor: "#F3F3F0", border: "1px solid #E9E8E6" }}
          >
            <Info
              size={14}
              style={{ color: "#8A8A84" }}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="text-xs leading-relaxed" style={{ color: "#6B6B66" }}>
              Your microphone stays off until you tap it during the interview —
              nothing is heard until then, and Gemini transcribes your answer
              automatically once you stop recording.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "#0B0B0B" }}
              >
                <FileText size={14} style={{ color: "#6B6B66" }} />
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
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none resize-none transition-colors focus:ring-2"
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

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isStarting}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed hover:enabled:opacity-90 active:enabled:scale-[0.99]"
              style={{
                backgroundColor: !isFormValid ? "#E9E8E6" : "#2F5D5A",
                color: !isFormValid ? "#9A9A94" : "#FFFFFF",
                boxShadow:
                  isFormValid && !isStarting
                    ? "0 16px 32px -18px rgba(47,93,90,0.5)"
                    : "none",
              }}
            >
              {isStarting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Starting interview…
                </>
              ) : (
                "Start Interview"
              )}
            </button>
            {isStarting && (
              <div
                className="mt-3 h-1 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: "#EDEDE9" }}
              >
                <div
                  className="mm-start-bar h-full rounded-full"
                  style={{ backgroundColor: "#2F5D5A" }}
                />
              </div>
            )}
            {!isFormValid && !isStarting && (
              <p
                className="mt-2 text-xs text-center"
                style={{ color: "#9A9A94" }}
              >
                Fill in your name, role, and experience level to continue.
              </p>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: "#9A9A94" }}>
          Nothing is saved beyond this browser tab — no account, no history.
        </p>
      </div>

      <style jsx>{`
        .mm-start-bar {
          width: 0%;
          animation: mm-start-fill 0.55s ease-out forwards;
        }
        @keyframes mm-start-fill {
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SetupForm;
