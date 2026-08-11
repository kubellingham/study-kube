import type { Metadata, Viewport } from "next";
import "./globals.css";
import UpdateWatcher from "@/app/components/UpdateWatcher";

export const metadata: Metadata = {
  title: "Studying Kube",
  description:
    "Turn your notes, PDFs, lectures and articles into summaries, flashcards, quizzes and an AI tutor.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kube", statusBarStyle: "default" },
};

// Without this, phones lay the page out at ~980px and zoom out — everything
// looks tiny. viewportFit=cover lets us pad for the notch/home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eef1f4",
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
        <UpdateWatcher />
      </body>
    </html>
  );
}
