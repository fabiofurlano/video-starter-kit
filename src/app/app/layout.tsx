import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "AI Video Developer Starter Kit | fal.ai",
  description: "Open-source AI video editor built for developers.",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="app-container">{children}</div>;
}
