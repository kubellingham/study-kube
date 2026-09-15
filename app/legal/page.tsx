import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal — Studying Kube",
  description: "How Studying Kube handles your data, and the terms of using it.",
};

// One honest page covering both privacy and terms. Deliberately short —
// a reviewer or lecturer can read it in a minute, and it sets expectations
// for the Science City demo without pretending to be a large SaaS.
export default function LegalPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#eef1f4",
        color: "#16202b",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        padding: "56px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8593a3",
            textDecoration: "none",
          }}
        >
          ← Back to Kube
        </Link>

        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            margin: "18px 0 8px",
          }}
        >
          Privacy &amp; terms
        </h1>
        <p style={{ color: "#46566a", fontSize: 15, margin: 0 }}>
          Last updated: 15 September 2026. Studying Kube is built and operated
          by an independent developer at <a href="mailto:ikube77@gmail.com" style={{ color: "#1f6f6b" }}>ikube77@gmail.com</a>.
        </p>

        <Section title="What we store about you">
          <ul style={LIST}>
            <li>Your name and email (from your Google sign-in).</li>
            <li>Your uploaded course material — PDFs, notes, decks, past papers.</li>
            <li>The courses, lessons, exams and progress Kube generates from that material.</li>
            <li>Basic account state: referral code, crew membership, subscription tier.</li>
          </ul>
          <p style={P}>
            Everything sits in Google Firebase (Firestore + Auth). Payments go
            through Stripe. AI generation goes through Anthropic and OpenRouter
            — only the text and images you upload leave our servers, and they
            leave only long enough to build your ladder.
          </p>
        </Section>

        <Section title="What we don&rsquo;t do">
          <ul style={LIST}>
            <li>We don&apos;t sell or rent your data.</li>
            <li>We don&apos;t share it with advertisers.</li>
            <li>We don&apos;t train models on it.</li>
            <li>We don&apos;t read your files by hand — only Kube&apos;s automated pipeline touches them.</li>
          </ul>
        </Section>

        <Section title="Deleting your data">
          <p style={P}>
            Email <a href="mailto:ikube77@gmail.com" style={{ color: "#1f6f6b" }}>ikube77@gmail.com</a> from the address on your account and ask.
            Everything associated with your account will be removed from
            Firestore within a few working days. Backups (see below) age out on
            their own schedule.
          </p>
        </Section>

        <Section title="Terms of use — the short version">
          <ul style={LIST}>
            <li>
              Kube is a study aid. It can be wrong. Cross-check anything
              exam-critical with your notes and your lecturer.
            </li>
            <li>
              Upload only material you&apos;re allowed to — your own notes,
              your own past papers, public course pages. Don&apos;t upload
              copyrighted material you don&apos;t have a right to use.
            </li>
            <li>
              Don&apos;t upload other people&apos;s personal information.
            </li>
            <li>
              Don&apos;t try to break the app, spam it, or use it to
              automate cheating on someone else&apos;s coursework — we&apos;ll
              revoke access.
            </li>
            <li>
              Paid subscriptions renew monthly unless you cancel. Refund
              requests within seven days of a charge, no questions asked —
              email the address above.
            </li>
            <li>
              We can suspend accounts and pull down the service if we have to
              — this is still an early independent project. If we ever wind
              down, you&apos;ll get notice and a chance to export your data.
            </li>
          </ul>
        </Section>

        <Section title="Contact">
          <p style={P}>
            Questions, corrections, or a data-deletion request: <a href="mailto:ikube77@gmail.com" style={{ color: "#1f6f6b" }}>ikube77@gmail.com</a>.
          </p>
        </Section>

        <p style={{ marginTop: 48, color: "#8593a3", fontSize: 13 }}>
          © {new Date().getFullYear()} Studying Kube.
        </p>
      </div>
    </div>
  );
}

const P: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#16202b",
  margin: "8px 0 0",
};

const LIST: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#16202b",
  paddingLeft: 22,
  margin: "8px 0 0",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 36 }}>
      <h2
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "-0.01em",
          margin: "0 0 6px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
