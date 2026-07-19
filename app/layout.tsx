import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studying Kube",
  description:
    "Turn your notes, PDFs, lectures and articles into summaries, flashcards, quizzes and an AI tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
