import type { Metadata, Viewport } from "next";
import "./globals.css";
import UpdateWatcher from "@/app/components/UpdateWatcher";

const OG_TITLE = "Studying Kube — climb your course, one concept at a time";
const OG_DESCRIPTION =
  "Upload your notes, PDFs and past papers. Kube turns them into a ladder of concepts, lessons, practice and mock exams.";

// Kube's public address, in ONE place. This is what link previews, the
// canonical URL and every absolute link in the page metadata are built from —
// point it at a domain you don't own and every shared link previews the wrong
// site. NEXT_PUBLIC_APP_URL overrides it the day the domain changes; it's the
// same variable the ByteLabs handoff reads.
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://studying-kube.vercel.app";

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
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    url: SITE_URL,
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
