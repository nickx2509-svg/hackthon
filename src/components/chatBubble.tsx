"use client";

import React, { useEffect, useState } from "react";
import { MessageRole } from "../lib/meshAPI";

interface ChatBubbleProps {
  role: MessageRole;
  message: string;
  isSpeaking?: boolean;
}

function ChatBubble({ role, message, isSpeaking = false }: ChatBubbleProps) {
  const isAI = role === "ai";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className="w-full flex"
      style={{ justifyContent: isAI ? "flex-start" : "flex-end" }}
    >
      <div
        className="flex items-end gap-2 max-w-[92%]"
        style={{ flexDirection: isAI ? "row" : "row-reverse" }}
      >
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
          style={{
            backgroundColor: isAI ? "#E7EFEE" : "#F3F1EC",
            color: isAI ? "#2F5D5A" : "#7A6F5E",
            border: `1px solid ${isAI ? "#D3E3E1" : "#E9E3D8"}`,
          }}
        >
          {isAI ? "AI" : "You"}
        </div>

        <div
          className="rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed transition-all duration-300 ease-out break-words whitespace-pre-wrap"
          style={{
            backgroundColor: isAI ? "#EEF3F2" : "#F3F1EC",
            color: isAI ? "#20403D" : "#4A4640",
            border: `1px solid ${isAI ? "#DCE9E7" : "#EAE4D9"}`,
            borderBottomLeftRadius: isAI ? 4 : undefined,
            borderBottomRightRadius: !isAI ? 4 : undefined,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {message}

          {isAI && isSpeaking && (
            <span className="inline-flex items-center gap-[3px] ml-2 align-middle">
              <span className="mm-dot" style={{ animationDelay: "0ms" }} />
              <span className="mm-dot" style={{ animationDelay: "150ms" }} />
              <span className="mm-dot" style={{ animationDelay: "300ms" }} />
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .mm-dot {
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background-color: #2f5d5a;
          display: inline-block;
          animation: mm-pulse 1s ease-in-out infinite;
        }
        @keyframes mm-pulse {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}

export default ChatBubble;
