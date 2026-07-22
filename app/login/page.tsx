"use client";

// StudyingKube login — ported from the design project's KubeLogin component,
// variant "fullbleed" (1c): a full teal brand field on the left with the
// white form card floating to the right. Faithful to the design tokens and
// layout, adapted from the fixed 1180×760 canvas to fill the viewport, and
// wired to real Firebase auth (email+password, Google, reset, persistence).
import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

// Design tokens — day + night. The scene gently cycles day↔night ("always
// with you, night or day") while idle, and holds day while you're typing.
const LIGHT: Record<string, string> = {
  "--ink": "#16202b", "--ink-soft": "#46566a", "--faint": "#8593a3",
  "--bg": "#eef1f4", "--bg-deep": "#e5e8ec", "--card": "#ffffff", "--line": "#dce2e8",
  "--kube": "#1f6f6b", "--kube-soft": "#e2f0ef", "--kube-line": "#b4d8d5",
  "--amber": "#d98a1f", "--red": "#c9463a", "--red-soft": "#f7e2df", "--brand": "#1f6f6b",
};
const MID: Record<string, string> = {
  "--ink": "#f2e8d3", "--ink-soft": "#c8bda3", "--faint": "#8a7f6c",
  "--bg": "#1a1612", "--bg-deep": "#0f0c08", "--card": "#241d17", "--line": "#3a2f24",
  "--kube": "#5cbdb6", "--kube-soft": "#1e3a37", "--kube-line": "#2f5651",
  "--amber": "#e0a660", "--red": "#e07064", "--red-soft": "#3a1e1c", "--brand": "#0f1917",
};

const FONT_DISPLAY = "'Fraunces',Georgia,serif";
const FONT_BODY = "'Inter',ui-sans-serif,system-ui,sans-serif";
const FONT_MONO = "'JetBrains Mono',ui-monospace,monospace";

const PHRASES: { t: string; theme: "light" | "dark" }[] = [
  { t: "Always with you — by day", theme: "light" },
  { t: "…and right through the night", theme: "dark" },
  { t: "We've got you, night or day", theme: "light" },
];

const ICONS = {
  doc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M13 3v5h5"/></svg>',
  cards: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="6" width="12" height="14" rx="2"/><path d="M8 4h10a2 2 0 0 1 2 2v11"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
  chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-4 3v-3H4z"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16"/><path d="M9.5 5.4A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3-.5"/></svg>',
  checkMark: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  checkBig: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  google: '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.3 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.2-9.6 6.2-17z"/><path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.1 2.2-6.3 0-11.7-3.8-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>',
};

function cubeSVG(top: string, left: string, right: string, seam: string) {
  return `<svg width="46" height="46" viewBox="0 0 120 120" fill="none"><path d="M60 16 L104 41 L60 66 L16 41 Z" fill="${top}" stroke="${seam}" stroke-width="4" stroke-linejoin="round"/><path d="M16 41 L60 66 L60 112 L16 87 Z" fill="${left}" stroke="${seam}" stroke-width="4" stroke-linejoin="round"/><path d="M104 41 L60 66 L60 112 L104 87 Z" fill="${right}" stroke="${seam}" stroke-width="4" stroke-linejoin="round"/></svg>`;
}
const CUBE_DARK = cubeSVG("#ffffff", "rgba(255,255,255,.82)", "rgba(255,255,255,.6)", "#1f6f6b");

const FEATURES: { text: string; ic: keyof typeof ICONS }[] = [
  { text: "Summaries & key concepts", ic: "doc" },
  { text: "Flashcards, spaced for recall", ic: "cards" },
  { text: "Quizzes that grade & explain", ic: "check" },
  { text: "An AI tutor in your pocket", ic: "chat" },
  { text: "Past-paper practice, sorted", ic: "doc" },
  { text: "Every mistake, tracked for you", ic: "check" },
  { text: "One calm ladder per course", ic: "cards" },
  { text: "Spaced repetition that sticks", ic: "chat" },
  { text: "Your notes, turned into a glossary", ic: "doc" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const H = (s: string) => ({ __html: s });

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [errEmail, setErrEmail] = useState<string | null>(null);
  const [errPassword, setErrPassword] = useState<string | null>(null);
  const [pi, setPi] = useState(0); // rotating headline
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [focused, setFocused] = useState(false);

  const interacting = !!(email || password || focused || busy || done);
  const interactingRef = useRef(interacting);
  interactingRef.current = interacting;

  // Cycle day↔night while idle; hold day while the user is engaged.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (interactingRef.current) {
        setTheme("light");
        return;
      }
      setPi((p) => {
        const next = (p + 1) % PHRASES.length;
        setTheme(PHRASES[next].theme);
        return next;
      });
    }, 3800);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (interacting && theme !== "light") setTheme("light");
  }, [interacting, theme]);

  const tok = theme === "dark" ? MID : LIGHT;

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setError(null); setNote(null); setErrEmail(null); setErrPassword(null);
  }

  async function persist() {
    try {
      await setPersistence(auth(), remember ? browserLocalPersistence : browserSessionPersistence);
    } catch { /* non-fatal — falls back to the default persistence */ }
  }

  function finish() {
    setBusy(false);
    setDone(true);
    setTimeout(() => window.location.assign("/learn"), 700);
  }

  async function submit() {
    let eE: string | null = null, eP: string | null = null;
    if (!EMAIL_RE.test(email)) eE = "Enter a valid email address.";
    if (!password) eP = "Enter your password.";
    else if (mode === "signup" && password.length < 6) eP = "Use at least 6 characters.";
    if (eE || eP) { setErrEmail(eE); setErrPassword(eP); setError(null); setNote(null); return; }

    setBusy(true); setError(null); setNote(null); setErrEmail(null); setErrPassword(null);
    try {
      await persist();
      if (mode === "signup") await createUserWithEmailAndPassword(auth(), email, password);
      else await signInWithEmailAndPassword(auth(), email, password);
      finish();
    } catch (err) {
      setBusy(false);
      setError(friendlyError(err));
    }
  }

  async function google() {
    setBusy(true); setError(null); setNote(null);
    try {
      await persist();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth(), provider);
      finish();
    } catch (err) {
      setBusy(false);
      setError(friendlyError(err));
    }
  }

  async function forgot(e: React.MouseEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setErrEmail("Enter your email first, then tap Forgot."); setNote(null); return; }
    try {
      await sendPasswordResetEmail(auth(), email);
      setNote(`Password reset link sent to ${email}.`); setError(null); setErrEmail(null);
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  const field = (bad: boolean): React.CSSProperties => ({
    width: "100%", borderRadius: 12, border: `1px solid ${bad ? "var(--red)" : "var(--line)"}`,
    background: "var(--card)", padding: "12px 13px", fontFamily: FONT_BODY, fontSize: 14,
    color: "var(--ink)", outline: "none",
  });
  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: 9, borderRadius: 9, border: "none", cursor: "pointer",
    fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13,
    background: active ? "var(--card)" : "transparent", color: active ? "var(--kube)" : "var(--faint)",
    boxShadow: active ? "0 1px 3px rgba(15,32,50,.12)" : "none",
  });

  const rootStyle = {
    ...tok, position: "relative", minHeight: "100dvh", width: "100%", display: "flex",
    overflow: "hidden", fontFamily: FONT_BODY, color: "var(--ink)", background: "var(--brand)",
    transition: "background .8s ease",
  } as React.CSSProperties;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS} />
      <style>{`
        @keyframes kl-spin { to { transform: rotate(360deg); } }
        @keyframes kl-fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes kl-cube { 0% { opacity: 0; transform: rotateY(-85deg); } 55% { opacity: 1; transform: rotateY(12deg); } 100% { opacity: 1; transform: rotateY(0); } }
        @keyframes kl-reel { 0%,7.94% { transform: translateY(0); } 11.11%,19.05% { transform: translateY(-44px); } 22.22%,30.16% { transform: translateY(-88px); } 33.33%,41.27% { transform: translateY(-132px); } 44.44%,52.38% { transform: translateY(-176px); } 55.56%,63.49% { transform: translateY(-220px); } 66.67%,74.6% { transform: translateY(-264px); } 77.78%,85.71% { transform: translateY(-308px); } 88.89%,96.83% { transform: translateY(-352px); } 100% { transform: translateY(-396px); } }
        .kl input::placeholder { color: var(--faint); }
        .kl input:focus { border-color: var(--kube) !important; box-shadow: 0 0 0 3px var(--kube-soft); }
        .kl a { color: var(--kube); text-decoration: none; }
        .kl a:hover { text-decoration: underline; }
        .kl-google:hover { background: var(--bg-deep); }
        @media (max-width: 860px) { .kl-brand { display: none !important; } .kl-form { width: 100% !important; } }
        @media (prefers-reduced-motion: reduce) { .kl [style] { animation: none !important; } }
      `}</style>

      <main className="kl" style={rootStyle}>
        {/* Full teal brand field (left) */}
        <div
          className="kl-brand"
          style={{
            position: "relative", flex: "0 0 56%", display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "0 40px 0 clamp(40px,6vw,88px)", overflow: "hidden", zIndex: 1,
          }}
        >
          <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", border: "1px solid rgba(255,255,255,.14)", right: -200, top: -180, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "rgba(255,255,255,.06)", left: -160, bottom: -150, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span dangerouslySetInnerHTML={H(CUBE_DARK)} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 33, letterSpacing: "-.02em", color: "#fff" }}>StudyingKube</span>
            </div>
            <div style={{ perspective: 850, margin: "30px 0 0", minHeight: 96 }}>
              <h2 key={pi} style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: "clamp(30px,3.4vw,40px)", lineHeight: 1.12, letterSpacing: "-.02em", color: "#fff", margin: 0, maxWidth: "15ch", transformOrigin: "center", animation: "kl-cube .62s cubic-bezier(.34,1.3,.5,1) both" }}>
                {PHRASES[pi].t}
              </h2>
            </div>
            {/* Slot-machine reel: features scroll continuously, the centre row lit. */}
            <div style={{ position: "relative", marginTop: 16, height: 220, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg,transparent 0%,#000 28%,#000 72%,transparent 100%)", maskImage: "linear-gradient(180deg,transparent 0%,#000 28%,#000 72%,transparent 100%)" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 88, height: 44, background: "rgba(255,255,255,.16)", borderRadius: 12 }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, animation: "kl-reel 12.6s ease-in-out infinite" }}>
                {[...FEATURES, ...FEATURES].map((f, i) => (
                  <div key={i} style={{ height: 44, display: "flex", alignItems: "center", gap: 13, padding: "0 12px" }}>
                    <span style={{ flex: "none", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.16)", color: "#fff" }} dangerouslySetInnerHTML={H(ICONS[f.ic])} />
                    <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating form (right) */}
        <div className="kl-form" style={{ flex: 1, display: "grid", placeItems: "center", padding: 40, position: "relative", zIndex: 2 }}>
          <div style={{ width: 384, maxWidth: "100%", background: "var(--card)", borderRadius: 22, padding: 30, border: "1px solid var(--line)", boxShadow: "0 44px 90px -44px rgba(15,32,50,.55)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "22px 6px 12px" }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--kube)", display: "grid", placeItems: "center", margin: "0 auto" }} dangerouslySetInnerHTML={H(ICONS.checkBig)} />
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 23, color: "var(--ink)", marginTop: 16 }}>You&apos;re in</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 8, color: "var(--ink-soft)", fontSize: 13.5 }}>
                  <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid var(--kube-line)", borderTopColor: "var(--kube)", animation: "kl-spin .8s linear infinite", display: "inline-block" }} />
                  Taking you to your ladder…
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", background: "var(--bg-deep)", borderRadius: 12, padding: 4, marginBottom: 20 }}>
                  <button onClick={() => switchMode("signin")} style={tab(mode === "signin")}>Sign in</button>
                  <button onClick={() => switchMode("signup")} style={tab(mode === "signup")}>Create account</button>
                </div>

                {error && (
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "var(--red-soft)", border: "1px solid var(--red)", borderRadius: 11, padding: "10px 12px", marginBottom: 16 }}>
                    <span style={{ color: "var(--red)", flex: "none", marginTop: 1 }} dangerouslySetInnerHTML={H(ICONS.warn)} />
                    <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--red)" }}>{error}</span>
                  </div>
                )}
                {note && (
                  <div style={{ background: "var(--kube-soft)", border: "1px solid var(--kube-line)", borderRadius: 11, padding: "10px 12px", marginBottom: 16, fontSize: 12.5, lineHeight: 1.45, color: "var(--kube)" }}>{note}</div>
                )}

                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Email</label>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrEmail(null); }}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="you@university.edu" style={field(!!errEmail)}
                />
                {errEmail && <div style={{ fontSize: 11.5, color: "var(--red)", margin: "5px 2px 0" }}>{errEmail}</div>}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 6px" }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>Password</label>
                  <a href="#" onClick={forgot} style={{ fontSize: 11.5, fontWeight: 600 }}>Forgot?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"} value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrPassword(null); }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="••••••••" style={{ ...field(!!errPassword), paddingRight: 40 }}
                  />
                  <button onClick={() => setShowPw((v) => !v)} type="button" title="Show or hide password" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--faint)", display: "grid", placeItems: "center", width: 30, height: 30 }} dangerouslySetInnerHTML={H(showPw ? ICONS.eyeOff : ICONS.eye)} />
                </div>
                {errPassword && <div style={{ fontSize: 11.5, color: "var(--red)", margin: "5px 2px 0" }}>{errPassword}</div>}

                <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "16px 0 20px", cursor: "pointer" }} onClick={() => setRemember((v) => !v)}>
                  <span style={{ flex: "none", width: 20, height: 20, borderRadius: 6, border: `2px solid ${remember ? "var(--kube)" : "var(--line)"}`, background: remember ? "var(--kube)" : "var(--card)", display: "grid", placeItems: "center" }} dangerouslySetInnerHTML={H(remember ? ICONS.checkMark : "")} />
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Keep me signed in</span>
                </div>

                <button onClick={submit} disabled={busy} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: "var(--kube)", color: "#fff", border: "none", borderRadius: 13, padding: 13, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1, boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>
                  {busy && <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,.5)", borderTopColor: "#fff", animation: "kl-spin .8s linear infinite", display: "inline-block" }} />}
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)" }}>or</span>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>

                <button onClick={google} disabled={busy} className="kl-google" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 13, padding: 12, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13.5, color: "var(--ink)", cursor: busy ? "default" : "pointer" }}>
                  <span style={{ display: "grid", placeItems: "center", width: 18, height: 18 }} dangerouslySetInnerHTML={H(ICONS.google)} />
                  Continue with Google
                </button>

                <p style={{ margin: "18px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--faint)", textAlign: "center" }}>
                  By continuing you agree to StudyingKube&apos;s <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function friendlyError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email.";
    case "auth/too-many-requests":
      return "Too many attempts — wait a moment and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup — allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "You already signed up with this email using a different method. Use that one.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled yet. Enable it in Firebase Auth → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in. Add it in Firebase Auth → Settings → Authorized domains.";
    default:
      return err instanceof Error ? err.message : "Something went wrong.";
  }
}
