"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  MessageSquare,
  Brain,
  Puzzle,
  Languages,
  RotateCcw,
} from "lucide-react";
import {
  RESULT_STORAGE_KEY,
  SETUP_STORAGE_KEY,
  StoredInterviewResult,
} from "@/src/lib/meshAPI";

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
    >
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
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-semibold" style={{ color: "#0B0B0B" }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs mb-1" style={{ color: "#9A9A94" }}>
          /10
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full"
        style={{ backgroundColor: "#EDEDE9" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, backgroundColor: "#2F5D5A" }}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const router = useRouter();
  const [result, setResult] = useState<StoredInterviewResult | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  if (!loaded || !result) return null;

  const { setup, evaluation } = result;

  return (
    <div
      className="min-h-screen w-full px-4 py-12"
      style={{ backgroundColor: "#F9F9F6" }}
    >
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#2F5D5A" }}
          >
            MockMate AI · Results
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
            style={{ color: "#0B0B0B" }}
          >
            {setup.fullName}&apos;s Interview Summary
          </h1>
          <p className="text-sm" style={{ color: "#6B6B66" }}>
            {setup.role} · {setup.experienceLevel}
          </p>
        </div>

        {/* Overall score */}
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{ backgroundColor: "#EEF3F2", border: "1px solid #DCE9E7" }}
        >
          <p
            className="text-xs font-medium tracking-widest uppercase mb-1"
            style={{ color: "#2F5D5A" }}
          >
            Overall Score
          </p>
          <p className="text-5xl font-semibold" style={{ color: "#0B0B0B" }}>
            {evaluation.overallScore.toFixed(1)}
            <span className="text-xl font-normal" style={{ color: "#9A9A94" }}>
              /10
            </span>
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#2F5D5A" }}
            >
              Strengths
            </p>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: "#4A4640" }}
                >
                  • {s}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#B5502E" }}
            >
              Weaknesses
            </p>
            <ul className="space-y-1.5">
              {evaluation.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: "#4A4640" }}
                >
                  • {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Areas to improve */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#0B0B0B" }}
          >
            Areas to Improve
          </p>
          <ul className="space-y-1.5">
            {evaluation.areasToImprove.map((a, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed"
                style={{ color: "#4A4640" }}
              >
                • {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Final recommendation */}
        <div
          className="rounded-xl p-4 mb-8 flex items-start gap-3"
          style={{ backgroundColor: "#EEF3F2", border: "1px solid #DCE9E7" }}
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

        {/* Start another interview */}
        <div className="flex justify-center">
          <button
            onClick={handleStartAnother}
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
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
