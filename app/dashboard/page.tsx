"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  MessageSquare,
  Brain,
  Puzzle,
  Languages,
  RotateCcw,
  FileDown,
  Loader2,
  Sparkles,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Target,
  User,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  RESULT_STORAGE_KEY,
  SETUP_STORAGE_KEY,
  StoredInterviewResult,
} from "@/src/lib/meshAPI";

// NOTE: this file uses two extra packages —
//   npm install recharts jspdf
// jsPDF is loaded dynamically inside handleGeneratePDF so it never
// touches the server bundle.

type Tier = "high" | "mid" | "low";

function tierOf(scoreOutOf10: number): Tier {
  if (scoreOutOf10 >= 8) return "high";
  if (scoreOutOf10 >= 5) return "mid";
  return "low";
}

const TIER_STYLE: Record<
  Tier,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    Icon: React.ElementType;
  }
> = {
  high: {
    color: "#2F5D5A",
    bg: "#EEF3F2",
    border: "#DCE9E7",
    label: "Strong",
    Icon: TrendingUp,
  },
  mid: {
    color: "#9C7A2E",
    bg: "#FBF3E4",
    border: "#F0E1BE",
    label: "Developing",
    Icon: Minus,
  },
  low: {
    color: "#B5502E",
    bg: "#FBEEE8",
    border: "#F2D9CC",
    label: "Needs work",
    Icon: TrendingDown,
  },
};

function TierPill({ score }: { score: number }) {
  const tier = tierOf(score);
  const { color, bg, border, label, Icon } = TIER_STYLE[tier];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const tier = tierOf(value);
  const { color } = TIER_STYLE[tier];
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2.5"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E9E8E6",
        boxShadow: "0 10px 24px -20px rgba(11,11,11,0.25)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#EEF3F2", color: "#2F5D5A" }}
          >
            {icon}
          </div>
          <span className="text-xs font-medium" style={{ color: "#6B6B66" }}>
            {label}
          </span>
        </div>
        <TierPill score={value} />
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-semibold" style={{ color: "#0B0B0B" }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs mb-1" style={{ color: "#9A9A94" }}>
          /10
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "#EDEDE9" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// The "pillar" — a vertical thermometer-style gauge. This is the one
// signature visual on the page; everything else around it stays quiet.
function ScorePillar({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const pct = Math.max(2, Math.min(100, value * 10));
  const tier = tierOf(value);
  const { color, bg } = TIER_STYLE[tier];
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 sm:flex-1 min-w-[58px] sm:min-w-[64px]">
      <span className="text-xs font-bold" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
      <div
        className="relative w-full max-w-[34px] rounded-full overflow-hidden"
        style={{
          height: 132,
          backgroundColor: "#F0F0EC",
          border: "1px solid #E9E8E6",
          boxShadow: "inset 0 2px 6px rgba(11,11,11,0.06)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700"
          style={{
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`,
          }}
        />
      </div>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </div>
      <span
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: "#6B6B66" }}
      >
        {label}
      </span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 10));
  const dash = pct * circumference;
  const tier = tierOf(score);
  const { color } = TIER_STYLE[tier];

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: 132, height: 132 }}
    >
      <svg
        width={132}
        height={132}
        viewBox="0 0 132 132"
        className="-rotate-90"
      >
        <circle
          cx={66}
          cy={66}
          r={r}
          fill="none"
          stroke="#E9E8E6"
          strokeWidth={11}
        />
        <circle
          cx={66}
          cy={66}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={11}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold" style={{ color: "#0B0B0B" }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px]" style={{ color: "#9A9A94" }}>
          / 10
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const [result, setResult] = useState<StoredInterviewResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw));
    setLoaded(true);
  }, [router]);

  function handleStartAnother() {
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
    sessionStorage.removeItem(SETUP_STORAGE_KEY);
    router.push("/");
  }

  const radarData = useMemo(() => {
    if (!result) return [];
    const { evaluation } = result;
    return [
      { subject: "Technical", value: evaluation.technicalKnowledge, full: 10 },
      {
        subject: "Communication",
        value: evaluation.communicationSkills,
        full: 10,
      },
      {
        subject: "Problem Solving",
        value: evaluation.problemSolving,
        full: 10,
      },
      { subject: "Language", value: evaluation.languageProficiency, full: 10 },
    ];
  }, [result]);

  const questionCount = useMemo(() => {
    if (!result) return 0;
    return result.transcript.filter((m) => m.role === "ai").length;
  }, [result]);

  async function handleGeneratePDF() {
    if (!result) return;
    setPdfError(null);
    setGeneratingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { setup, evaluation, transcript, completedAt } = result;

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      let y = 0;

      function ensureSpace(extra: number) {
        if (y + extra > pageHeight - 48) {
          doc.addPage();
          y = 56;
        }
      }

      function heading(text: string, size = 14) {
        ensureSpace(size + 14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.setTextColor(11, 11, 11);
        doc.text(text, margin, y);
        y += size + 10;
      }

      function paragraph(
        text: string,
        size = 10,
        rgb: [number, number, number] = [74, 70, 64],
      ) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach((line: string) => {
          ensureSpace(size + 6);
          doc.text(line, margin, y);
          y += size + 6;
        });
      }

      function bulletList(items: string[], rgb: [number, number, number]) {
        items.forEach((item) => {
          const lines = doc.splitTextToSize(
            `•  ${item}`,
            pageWidth - margin * 2 - 10,
          );
          lines.forEach((line: string, idx: number) => {
            ensureSpace(16);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(rgb[0], rgb[1], rgb[2]);
            doc.text(line, margin + (idx === 0 ? 0 : 14), y);
            y += 16;
          });
        });
      }

      // Header band
      doc.setFillColor(238, 243, 242);
      doc.rect(0, 0, pageWidth, 96, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(47, 93, 90);
      doc.text("MockMate AI — Interview Report", margin, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(32, 64, 61);
      doc.text(
        `${setup.fullName} · ${setup.role} · ${setup.experienceLevel}`,
        margin,
        62,
      );
      doc.setFontSize(9);
      doc.setTextColor(106, 106, 102);
      doc.text(
        `Generated ${new Date(completedAt).toLocaleString()}`,
        margin,
        80,
      );
      y = 128;

      heading("Overall Score");
      paragraph(`${evaluation.overallScore.toFixed(1)} / 10`, 20, [11, 11, 11]);
      y += 4;

      heading("Score Breakdown");
      paragraph(
        `Technical Knowledge — ${evaluation.technicalKnowledge.toFixed(1)}/10`,
      );
      paragraph(
        `Communication Skills — ${evaluation.communicationSkills.toFixed(1)}/10`,
      );
      paragraph(`Problem Solving — ${evaluation.problemSolving.toFixed(1)}/10`);
      paragraph(
        `English Proficiency — ${evaluation.languageProficiency.toFixed(1)}/10`,
      );
      y += 6;

      heading("Strengths");
      bulletList(evaluation.strengths, [47, 93, 90]);
      y += 6;

      heading("Weaknesses — Why Marks Were Lower");
      bulletList(evaluation.weaknesses, [181, 80, 46]);
      y += 6;

      heading("Areas To Improve");
      bulletList(evaluation.areasToImprove, [11, 11, 11]);
      y += 6;

      heading("Final Recommendation");
      paragraph(evaluation.finalRecommendation);
      y += 10;

      heading("Full Interview Transcript");
      let qNum = 0;
      transcript.forEach((m) => {
        if (m.role === "ai") {
          qNum += 1;
          y += 2;
          paragraph(`Q${qNum}. ${m.text}`, 10, [32, 64, 61]);
        } else {
          paragraph(`A.  ${m.text}`, 10, [74, 70, 64]);
          y += 4;
        }
      });

      doc.save(`${setup.fullName.replace(/\s+/g, "-")}-interview-report.pdf`);
    } catch (err) {
      console.error(err);
      setPdfError("Couldn't generate the PDF just now — please try again.");
      setTimeout(() => setPdfError(null), 5000);
    } finally {
      setGeneratingPDF(false);
    }
  }

  if (!loaded || !result) return null;

  const { setup, evaluation, transcript, completedAt } = result;
  const overallTier = tierOf(evaluation.overallScore);

  let qCounter = 0;

  return (
    <div
      className="min-h-screen w-full px-5 sm:px-8 lg:px-14 py-6 sm:py-8 lg:py-10"
      style={{
        backgroundColor: "#F9F9F6",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, #0B0B0B0A 1px, transparent 0)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
              style={{
                backgroundColor: "#EEF3F2",
                color: "#2F5D5A",
                border: "1px solid #DCE9E7",
              }}
            >
              <Sparkles size={11} />
              MockMate AI · Results
            </span>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-2"
              style={{ color: "#0B0B0B" }}
            >
              {setup.fullName}&apos;s Interview Summary
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#4A4640",
                  border: "1px solid #E9E8E6",
                }}
              >
                <User size={12} />
                {setup.role}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#4A4640",
                  border: "1px solid #E9E8E6",
                }}
              >
                <BadgeCheck size={12} />
                {setup.experienceLevel}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#4A4640",
                  border: "1px solid #E9E8E6",
                }}
              >
                <MessageSquare size={12} />
                {questionCount} questions
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#4A4640",
                  border: "1px solid #E9E8E6",
                }}
              >
                <CalendarDays size={12} />
                {new Date(completedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pdfError && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
                style={{
                  backgroundColor: "#FBEEE8",
                  color: "#B5502E",
                  border: "1px solid #F2D9CC",
                }}
              >
                <AlertTriangle size={12} />
                {pdfError}
              </span>
            )}
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 w-full sm:w-auto"
              style={{
                backgroundColor: "#0B0B0B",
                color: "#FFFFFF",
                boxShadow: "0 16px 32px -16px rgba(11,11,11,0.5)",
              }}
            >
              {generatingPDF ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileDown size={16} />
              )}
              {generatingPDF ? "Generating…" : "Generate PDF Report"}
            </button>
          </div>
        </div>

        {/* Hero row: score ring + radar chart, spread edge to edge */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
          <div
            className="lg:col-span-2 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left"
            style={{
              backgroundColor: "#EEF3F2",
              border: "1px solid #DCE9E7",
              boxShadow: "0 20px 40px -26px rgba(47,93,90,0.4)",
            }}
          >
            <ScoreRing score={evaluation.overallScore} />
            <div className="flex flex-col items-center sm:items-start gap-2">
              <p
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: "#2F5D5A" }}
              >
                Overall Score
              </p>
              <TierPill score={evaluation.overallScore} />
              <p
                className="text-xs leading-relaxed max-w-[280px] sm:max-w-[220px]"
                style={{ color: "#20403D" }}
              >
                {overallTier === "high"
                  ? "A strong, hire-ready performance across the board."
                  : overallTier === "mid"
                    ? "A solid attempt with a few clear gaps to close."
                    : "Foundational gaps that need focused practice."}
              </p>
            </div>
          </div>

          <div
            className="lg:col-span-3 rounded-2xl p-5"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9E8E6",
              boxShadow: "0 20px 40px -28px rgba(11,11,11,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#EAF0FA", color: "#3B5B92" }}
              >
                <Target size={14} />
              </div>
              <p className="text-xs font-semibold" style={{ color: "#0B0B0B" }}>
                Skill Shape
              </p>
            </div>
            <p className="text-[11px] mb-2" style={{ color: "#9A9A94" }}>
              How the four scored areas compare to each other
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#E9E8E6" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#6B6B66", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="#2F5D5A"
                  fill="#2F5D5A"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score pillars — the signature element */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E9E8E6",
            boxShadow: "0 16px 34px -26px rgba(11,11,11,0.22)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F3F3F0", color: "#6B6B66" }}
            >
              <Gauge size={14} />
            </div>
            <p className="text-xs font-semibold" style={{ color: "#0B0B0B" }}>
              Score Pillars
            </p>
          </div>
          <div className="flex items-end sm:justify-between gap-3 sm:gap-6 px-1 sm:px-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            <ScorePillar
              icon={<Brain size={13} />}
              label="Technical"
              value={evaluation.technicalKnowledge}
            />
            <ScorePillar
              icon={<MessageSquare size={13} />}
              label="Communication"
              value={evaluation.communicationSkills}
            />
            <ScorePillar
              icon={<Puzzle size={13} />}
              label="Problem Solving"
              value={evaluation.problemSolving}
            />
            <ScorePillar
              icon={<Languages size={13} />}
              label="Language"
              value={evaluation.languageProficiency}
            />
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<Brain size={16} />}
            label="Technical Knowledge"
            value={evaluation.technicalKnowledge}
          />
          <MetricCard
            icon={<MessageSquare size={16} />}
            label="Communication"
            value={evaluation.communicationSkills}
          />
          <MetricCard
            icon={<Puzzle size={16} />}
            label="Problem Solving"
            value={evaluation.problemSolving}
          />
          <MetricCard
            icon={<Languages size={16} />}
            label="English Proficiency"
            value={evaluation.languageProficiency}
          />
        </div>

        {/* Strengths / weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9E8E6",
              boxShadow: "0 12px 26px -22px rgba(11,11,11,0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 size={13} style={{ color: "#2F5D5A" }} />
              <p className="text-xs font-semibold" style={{ color: "#2F5D5A" }}>
                Strengths
              </p>
            </div>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-xs leading-relaxed flex gap-1.5"
                  style={{ color: "#4A4640" }}
                >
                  <span style={{ color: "#2F5D5A" }}>•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9E8E6",
              boxShadow: "0 12px 26px -22px rgba(11,11,11,0.22)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} style={{ color: "#B5502E" }} />
              <p className="text-xs font-semibold" style={{ color: "#B5502E" }}>
                Weaknesses — why marks came in lower
              </p>
            </div>
            <ul className="space-y-1.5">
              {evaluation.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="text-xs leading-relaxed flex gap-1.5"
                  style={{ color: "#4A4640" }}
                >
                  <span style={{ color: "#B5502E" }}>•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Areas to improve */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E9E8E6",
            boxShadow: "0 12px 26px -22px rgba(11,11,11,0.22)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={13} style={{ color: "#0B0B0B" }} />
            <p className="text-xs font-semibold" style={{ color: "#0B0B0B" }}>
              Areas to Improve
            </p>
          </div>
          <ul className="space-y-1.5">
            {evaluation.areasToImprove.map((a, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed flex gap-1.5"
                style={{ color: "#4A4640" }}
              >
                <span style={{ color: "#6B6B66" }}>•</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Full transcript */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E9E8E6",
            boxShadow: "0 12px 26px -22px rgba(11,11,11,0.22)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={13} style={{ color: "#3B5B92" }} />
              <p className="text-xs font-semibold" style={{ color: "#0B0B0B" }}>
                Full Interview Transcript
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: "#F3F3F0", color: "#8A8A84" }}
            >
              {questionCount} questions
            </span>
          </div>
          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2.5">
            {transcript.map((m) => {
              const isQuestion = m.role === "ai";
              if (isQuestion) qCounter += 1;
              return (
                <div
                  key={m.id}
                  className="rounded-lg p-3 flex gap-2.5"
                  style={{
                    backgroundColor: isQuestion ? "#FBF3E4" : "#EAF0FA",
                    border: `1px solid ${isQuestion ? "#F0E1BE" : "#C9D9EE"}`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: isQuestion ? "#9C7A2E" : "#3B5B92",
                    }}
                  >
                    {isQuestion ? <Brain size={12} /> : <User size={12} />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-semibold mb-0.5"
                      style={{ color: isQuestion ? "#9C7A2E" : "#3B5B92" }}
                    >
                      {isQuestion ? `Question ${qCounter}` : "Your answer"}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#3A3733" }}
                    >
                      {m.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final recommendation */}
        <div
          className="rounded-xl p-4 mb-8 flex items-start gap-3"
          style={{
            backgroundColor: "#EEF3F2",
            border: "1px solid #DCE9E7",
            boxShadow: "0 16px 34px -26px rgba(47,93,90,0.35)",
          }}
        >
          <Award
            size={18}
            style={{ color: "#2F5D5A" }}
            className="flex-shrink-0 mt-0.5"
          />
          <div>
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "#2F5D5A" }}
            >
              Final Recommendation
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#20403D" }}>
              {evaluation.finalRecommendation}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0B0B0B",
              border: "1px solid #E9E8E6",
              boxShadow: "0 10px 24px -18px rgba(11,11,11,0.25)",
            }}
          >
            {generatingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            {generatingPDF ? "Generating…" : "Download PDF Report"}
          </button>
          <button
            onClick={handleStartAnother}
            className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: "#2F5D5A",
              color: "#FFFFFF",
              boxShadow: "0 16px 32px -18px rgba(47,93,90,0.5)",
            }}
          >
            <RotateCcw size={16} />
            Start Another Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
