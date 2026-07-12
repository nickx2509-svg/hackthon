import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Interview",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
