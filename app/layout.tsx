import type { Metadata, Viewport } from "next";
import "./globals.css";
import UpdateWatcher from "@/app/components/UpdateWatcher";

const OG_TITLE = "Studying Kube — climb your course, one concept at a time";
const OG_DESCRIPTION =
  "Upload your notes, PDFs and past papers. Kube turns them into a ladder of concepts, lessons, practice and mock exams.";

export const metadata: Metadata = {
  title: {
    default: "Studying Kube",
    template: "%s — Studying Kube",
  },
  description: OG_DESCRIPTION,
  applicationName: "Studying Kube",
  keywords: [
    "study app",
    "AI tutor",
    "course ladder",
    "flashcards",
    "mock exams",
    "past papers",
    "PDF to quiz",
  ],
  authors: [{ name: "Studying Kube" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kube", statusBarStyle: "default" },
  metadataBase: new URL("https://kube.study"),
  openGraph: {
    type: "website",
    url: "https://kube.study",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    siteName: "Studying Kube",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
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
