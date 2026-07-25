"use client";

// Kube marketing landing (imported from Claude Design "Kube Landing v2").
// Markup + keyframes are the design verbatim; the scroll motion and the
// auth/checkout overlay flows are a type-safe port of the design's logic,
// with the mock auth/checkout swapped for REAL Firebase auth + Stripe.
// Rendered at "/" for signed-out visitors (signed-in users go to /learn).
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";

const CSS = "@keyframes k-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }\n  @keyframes k-tilt { from { opacity: 0; transform: perspective(1200px) rotateY(-7deg) translateY(26px) scale(0.97); } to { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateY(0) scale(1); } }\n  @keyframes k-locate { 0% { box-shadow: 0 0 0 0 rgba(217,138,31,0.5); } 70% { box-shadow: 0 0 0 26px rgba(217,138,31,0); } 100% { box-shadow: 0 0 0 0 rgba(217,138,31,0); } }\n  @keyframes k-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }\n  @keyframes k-drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-16px, 12px); } }\n  @keyframes k-drift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(14px, -10px); } }\n  @keyframes k-bar-grow { from { width: 0%; } to { width: 38%; } }\n  @keyframes kl-spin { to { transform: rotate(360deg); } }\n  @keyframes kl-cube { 0% { opacity: 0; transform: rotateY(-85deg); } 55% { opacity: 1; transform: rotateY(12deg); } 100% { opacity: 1; transform: rotateY(0); } }\n  @keyframes kl-reel { 0%,7.94% { transform: translateY(0); } 11.11%,19.05% { transform: translateY(-44px); } 22.22%,30.16% { transform: translateY(-88px); } 33.33%,41.27% { transform: translateY(-132px); } 44.44%,52.38% { transform: translateY(-176px); } 55.56%,63.49% { transform: translateY(-220px); } 66.67%,74.6% { transform: translateY(-264px); } 77.78%,85.71% { transform: translateY(-308px); } 88.89%,96.83% { transform: translateY(-352px); } 100% { transform: translateY(-396px); } }\n  @keyframes kl-in { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }\n  .kl-input::placeholder { color: #8593a3; }\n  .kl-input:focus { border-color: #1f6f6b !important; box-shadow: 0 0 0 3px #e2f0ef; }\n  .kl-google:hover { background: #e5e8ec; }\n  .kl-clue:hover { background: #e2f0ef !important; border-color: #1f6f6b !important; }\n  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }\n  .kube-landing a { color: #1f6f6b; text-decoration: none; }\n  .kube-landing a:hover { color: #16544f; text-decoration: underline; }\n  [data-clue]:hover [data-tip] { opacity: 1 !important; transform: translateY(0) !important; }";
const BODY = "<div data-screen-label=\"Kube landing — 1b deepened\" style=\"position: relative\">\n\n  <div data-progress style=\"position: fixed; left: 0; top: 0; z-index: 60; height: 3px; width: 0%; background: #1f6f6b\"></div>\n\n  <div style=\"position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; height: 72px; padding: 0 56px; background: rgba(238,241,244,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #dce2e8\">\n    <span style=\"display: flex; align-items: center; gap: 11px\">\n      <svg width=\"26\" height=\"26\" viewBox=\"0 0 120 120\" fill=\"none\"><path d=\"M60 16 L104 41 L60 66 L16 41 Z\" fill=\"#2b8480\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path><path d=\"M16 41 L60 66 L60 112 L16 87 Z\" fill=\"#1f6f6b\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path><path d=\"M104 41 L60 66 L60 112 L104 87 Z\" fill=\"#175a56\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path></svg>\n      <span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 21px; letter-spacing: -0.02em\"><span style=\"color: #16202b\">Studying</span><span style=\"color: #1f6f6b\">Kube</span></span>\n    </span>\n    <span style=\"display: flex; align-items: center; gap: 22px\">\n      <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8593a3\">From $1 a month</span>\n      <a href=\"#plans\" data-act=\"openSignin\" style=\"font-size: 14px; font-weight: 600; color: #46566a\">Sign in</a>\n      <button type=\"button\" data-act=\"goPlans\" data-cta style=\"border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13.5px; padding: 10px 20px; border-radius: 999px; box-shadow: 0 3px 0 rgba(20,32,43,0.18)\">Start climbing</button>\n    </span>\n  </div>\n\n  <div style=\"position: relative; overflow: hidden; padding: 104px 56px 0\">\n    <div style=\"position: absolute; width: 620px; height: 620px; border-radius: 50%; border: 1px solid #b4d8d5; opacity: 0.5; left: 62%; top: -230px; animation: k-drift 18s ease-in-out infinite\"></div>\n    <div style=\"position: absolute; width: 430px; height: 430px; border-radius: 50%; background: #e2f0ef; opacity: 0.55; left: -150px; top: 300px; animation: k-drift2 22s ease-in-out infinite\"></div>\n\n    <div style=\"position: relative; z-index: 2; display: flex; align-items: center; gap: 72px; max-width: 1300px; margin: 0 auto\">\n      <div style=\"flex: 1; max-width: 560px\">\n        <span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #8593a3; animation: k-rise 0.7s cubic-bezier(.22,1,.36,1) both\">One step at a time</span>\n        <h1 style=\"margin: 20px 0 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 62px; line-height: 1.04; letter-spacing: -0.025em; text-wrap: pretty\">\n          <span style=\"display: block; animation: k-rise 0.9s cubic-bezier(.22,1,.36,1) 0.12s both\">Studying feels huge.</span>\n          <span style=\"display: block; animation: k-rise 0.9s cubic-bezier(.22,1,.36,1) 0.32s both\">Kube makes it small.</span>\n        </h1>\n        <p style=\"margin: 26px 0 0; max-width: 450px; font-size: 19.5px; line-height: 1.62; color: #46566a; text-wrap: pretty; animation: k-rise 0.9s cubic-bezier(.22,1,.36,1) 0.58s both\">One clear step at a time — for every subject, all semester long. You'll always know what today's step is.</p>\n        <div style=\"display: flex; align-items: center; gap: 20px; margin-top: 38px; animation: k-rise 0.9s cubic-bezier(.22,1,.36,1) 0.78s both\">\n          <button type=\"button\" data-act=\"goPlans\" data-cta style=\"border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16.5px; padding: 17px 34px; border-radius: 14px; box-shadow: 0 4px 0 rgba(20,32,43,0.18)\">Start climbing</button>\n          <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: #8593a3\">From $1 a month.</span>\n        </div>\n      </div>\n\n      <div style=\"flex: none; width: 600px; animation: k-tilt 1.1s cubic-bezier(.22,1,.36,1) 0.5s both\">\n        <div style=\"background: #fff; border: 1px solid #dce2e8; border-radius: 16px; box-shadow: 0 34px 64px -30px rgba(15,32,50,0.36); overflow: hidden\">\n          <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid #dce2e8\">\n            <span><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #8593a3\">CSE46D</span><span style=\"display: block; margin-top: 3px; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 18px; letter-spacing: -0.02em\">Computer organisation</span></span>\n            <span style=\"font-size: 12px; color: #8593a3\">9 of 24 climbed</span>\n          </div>\n          <div style=\"padding: 18px 22px 0\"><span style=\"display: block; height: 8px; border-radius: 999px; background: #dce2e8; overflow: hidden\"><span style=\"display: block; height: 100%; border-radius: 999px; background: #1f6f6b; animation: k-bar-grow 1.4s cubic-bezier(.22,1,.36,1) 1.3s both\"></span></span></div>\n          <div style=\"display: flex; flex-direction: column; gap: 14px; padding: 22px\">\n            <span style=\"display: flex; align-items: center; gap: 14px; animation: k-rise 0.7s cubic-bezier(.22,1,.36,1) 1.15s both\">\n              <span style=\"flex: none; width: 38px; height: 38px; border-radius: 50%; background: #1f6f6b; display: grid; place-items: center; box-shadow: 0 0 0 3px #fff, 0 0 0 5px #b4d8d5\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n              <span><span style=\"display: block; font-size: 15px; font-weight: 500\">Addressing modes</span><span style=\"display: block; font-size: 12px; color: #8593a3\">Unit 2 · done</span></span>\n            </span>\n            <span style=\"display: flex; align-items: center; gap: 14px; padding: 12px 14px; margin: -4px -14px; background: #f8ecd7; border: 1px solid #eccb85; border-radius: 12px; animation: k-rise 0.7s cubic-bezier(.22,1,.36,1) 1.45s both\">\n              <span style=\"flex: none; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 3px solid #d98a1f; display: grid; place-items: center; animation: k-bob 2.6s ease-in-out 2.4s infinite\"><span style=\"width: 9px; height: 9px; border-radius: 50%; background: #d98a1f\"></span></span>\n              <span style=\"flex: 1\"><span style=\"display: block; font-size: 15px; font-weight: 600\">Data transfer methods</span><span style=\"display: block; font-size: 12px; color: #d98a1f\">Unit 3 · today's step</span></span>\n              <span style=\"flex: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #46566a\">12 min</span>\n            </span>\n            <span style=\"display: flex; align-items: center; gap: 14px; animation: k-rise 0.7s cubic-bezier(.22,1,.36,1) 1.7s both\">\n              <span style=\"flex: none; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 2px solid #dce2e8\"></span>\n              <span><span style=\"display: block; font-size: 15px; font-weight: 500; color: #46566a\">Arithmetic circuits</span><span style=\"display: block; font-size: 12px; color: #8593a3\">Unit 4 · up next</span></span>\n            </span>\n            <span style=\"display: flex; align-items: center; gap: 14px; animation: k-rise 0.7s cubic-bezier(.22,1,.36,1) 1.9s both\">\n              <span style=\"flex: none; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 2px solid #dce2e8\"></span>\n              <span><span style=\"display: block; font-size: 15px; font-weight: 500; color: #46566a\">Memory hierarchy</span><span style=\"display: block; font-size: 12px; color: #8593a3\">Unit 5</span></span>\n            </span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div data-cue style=\"display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 76px 0 0; padding-bottom: 44px; animation: k-rise 1s ease-out 2.2s both\">\n      <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #8593a3\">Scroll</span>\n      <span style=\"color: #b4d8d5; animation: k-bob 2.4s ease-in-out infinite\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"></path></svg></span>\n    </div>\n  </div>\n\n  <div data-pin data-vh=\"520\" style=\"position: relative; height: 520vh\">\n    <div style=\"position: sticky; top: 0; height: 100vh; min-height: 780px; overflow: hidden\">\n      <div data-stage style=\"position: absolute; left: 50%; top: 50%; width: 1440px; height: 820px; margin: -410px 0 0 -720px\">\n\n        <div style=\"position: absolute; left: 72px; top: 214px; width: 480px\">\n          <div style=\"position: relative; height: 136px\">\n            <h2 data-beat=\"h2a\" style=\"position: absolute; left: 0; top: 0; margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 52px; line-height: 1.06; letter-spacing: -0.025em; opacity: 0\">You know the feeling.</h2>\n            <h2 data-beat=\"h2b\" style=\"position: absolute; left: 0; top: 0; margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 52px; line-height: 1.06; letter-spacing: -0.025em; opacity: 0; text-wrap: pretty\">What if it just… made sense?</h2>\n          </div>\n          <div style=\"position: relative; height: 300px; margin-top: 14px\">\n            <div data-beat=\"groupa\" style=\"position: absolute; left: 0; top: 0; width: 470px; display: flex; flex-direction: column; gap: 18px; opacity: 0\">\n              <span data-beat=\"a1\" style=\"font-size: 20px; line-height: 1.55; color: #16202b; opacity: 0\">A pile of PDFs. Six subjects.</span>\n              <span data-beat=\"a2\" style=\"font-size: 19px; line-height: 1.6; color: #46566a; opacity: 0\">No idea where to start — so you put it off, and put it off,</span>\n              <span data-beat=\"a3\" style=\"font-size: 19px; line-height: 1.6; color: #46566a; opacity: 0\">until it's the night before and you're cramming all of it at once.</span>\n              <span data-beat=\"a4\" style=\"font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 21px; line-height: 1.5; color: #c9463a; opacity: 0\">Every semester, the same panic.</span>\n            </div>\n            <div data-beat=\"groupb\" style=\"position: absolute; left: 0; top: 0; width: 470px; display: flex; flex-direction: column; gap: 18px; opacity: 0\">\n              <span data-beat=\"b1\" style=\"font-size: 19px; line-height: 1.6; color: #46566a; opacity: 0\">Give Kube your slides, your notes, a PDF — whatever you've got.</span>\n              <span data-beat=\"b2\" style=\"font-size: 19px; line-height: 1.6; color: #46566a; opacity: 0\">It reads them and lays your whole course out as one clear path.</span>\n              <span data-beat=\"b3\" style=\"font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 21px; line-height: 1.5; color: #1f6f6b; opacity: 0\">No more staring at the mountain.</span>\n            </div>\n          </div>\n        </div>\n\n        <svg width=\"1440\" height=\"820\" viewBox=\"0 0 1440 820\" fill=\"none\" style=\"position: absolute; left: 0; top: 0\"><path data-line d=\"M622 442 L1322 442\" stroke=\"#b4d8d5\" stroke-width=\"3\" stroke-linecap=\"round\"></path></svg>\n\n        <div data-doc data-i=\"0\" data-sx=\"700\" data-sy=\"180\" data-rot=\"-10\" data-tx=\"600\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(700px, 180px) rotate(-10deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #c9463a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\"></path><path d=\"M13 3v5h5\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">unit1.pdf</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 72%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 88%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n        <div data-doc data-i=\"1\" data-sx=\"884\" data-sy=\"146\" data-rot=\"8\" data-tx=\"740\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(884px, 146px) rotate(8deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #d98a1f\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\"></path><path d=\"M13 3v5h5\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">lecture-3.pptx</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 64%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 80%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n        <div data-doc data-i=\"2\" data-sx=\"1046\" data-sy=\"236\" data-rot=\"-6\" data-tx=\"880\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(1046px, 236px) rotate(-6deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #1f6f6b\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M5 6h14M5 11h14M5 16h9\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">week2-notes</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 78%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 56%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n        <div data-doc data-i=\"3\" data-sx=\"764\" data-sy=\"322\" data-rot=\"11\" data-tx=\"1020\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(764px, 322px) rotate(11deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #c9463a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\"></path><path d=\"M13 3v5h5\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">past-paper.pdf</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 58%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 84%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n        <div data-doc data-i=\"4\" data-sx=\"952\" data-sy=\"392\" data-rot=\"-4\" data-tx=\"1160\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(952px, 392px) rotate(-4deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #c9463a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\"><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"4\" fill=\"currentColor\"></rect><path d=\"M10 9l5 3-5 3z\" fill=\"#fff\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">lecture-9</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 70%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 62%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n        <div data-doc data-i=\"5\" data-sx=\"1108\" data-sy=\"366\" data-rot=\"5\" data-tx=\"1300\" data-ty=\"420\" style=\"position: absolute; left: 0; top: 0; width: 150px; padding: 12px 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; box-shadow: 0 12px 28px -16px rgba(15,32,50,0.4); opacity: 0; transform: translate(1108px, 366px) rotate(5deg)\">\n          <span style=\"display: flex; align-items: center; gap: 8px; color: #1f6f6b\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M5 6h14M5 11h14M5 16h9\"></path></svg><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #46566a\">pasted notes</span></span>\n          <span style=\"display: block; margin-top: 10px; height: 3px; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 66%; border-radius: 999px; background: #e5e8ec\"></span>\n          <span style=\"display: block; margin-top: 5px; height: 3px; width: 90%; border-radius: 999px; background: #e5e8ec\"></span>\n        </div>\n\n        <div data-node data-i=\"0\" style=\"position: absolute; left: 600px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #1f6f6b; display: grid; place-items: center; box-shadow: 0 0 0 3px #eef1f4, 0 0 0 5px #b4d8d5; opacity: 0\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></div>\n        <div data-node data-i=\"1\" style=\"position: absolute; left: 740px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #1f6f6b; display: grid; place-items: center; box-shadow: 0 0 0 3px #eef1f4, 0 0 0 5px #b4d8d5; opacity: 0\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></div>\n        <div data-node data-i=\"2\" data-current=\"1\" style=\"position: absolute; left: 880px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 3px solid #d98a1f; display: grid; place-items: center; opacity: 0\"><span style=\"width: 10px; height: 10px; border-radius: 50%; background: #d98a1f\"></span></div>\n        <div data-node data-i=\"3\" style=\"position: absolute; left: 1020px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 2px solid #dce2e8; opacity: 0\"></div>\n        <div data-node data-i=\"4\" style=\"position: absolute; left: 1160px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 2px solid #dce2e8; opacity: 0\"></div>\n        <div data-node data-i=\"5\" style=\"position: absolute; left: 1300px; top: 420px; width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 2px solid #dce2e8; opacity: 0\"></div>\n\n        <div data-nodelabel data-i=\"0\" style=\"position: absolute; left: 560px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8593a3\">Unit 1</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 500; color: #16202b\">Foundations</span></div>\n        <div data-nodelabel data-i=\"1\" style=\"position: absolute; left: 700px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8593a3\">Unit 2</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 500; color: #16202b\">Addressing modes</span></div>\n        <div data-nodelabel data-i=\"2\" style=\"position: absolute; left: 840px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #d98a1f\">You're here</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 600; color: #16202b\">Data transfer</span></div>\n        <div data-nodelabel data-i=\"3\" style=\"position: absolute; left: 980px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8593a3\">Unit 4</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 500; color: #46566a\">Arithmetic</span></div>\n        <div data-nodelabel data-i=\"4\" style=\"position: absolute; left: 1120px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8593a3\">Unit 5</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 500; color: #46566a\">Memory</span></div>\n        <div data-nodelabel data-i=\"5\" style=\"position: absolute; left: 1260px; top: 484px; width: 124px; text-align: center; opacity: 0\"><span style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8593a3\">Unit 6</span><span style=\"display: block; margin-top: 3px; font-size: 13.5px; font-weight: 500; color: #46566a\">Input / output</span></div>\n      </div>\n    </div>\n  </div>\n\n  <div data-pin data-vh=\"400\" data-tutor style=\"position: relative; height: 400vh; background: #1f6f6b\">\n    <div style=\"position: sticky; top: 0; height: 100vh; min-height: 780px; overflow: hidden\">\n      <div style=\"position: absolute; left: 50%; top: 50%; width: 1180px; margin-top: -350px; margin-left: -590px; display: flex; align-items: flex-start; gap: 80px\">\n        <div style=\"flex: none; width: 480px; padding-top: 40px\">\n          <span data-beat=\"teyebrow\" style=\"display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #b4d8d5; opacity: 0\">Every single day</span>\n          <h2 data-beat=\"th2\" style=\"margin: 20px 0 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 54px; line-height: 1.04; letter-spacing: -0.025em; color: #fff; text-wrap: pretty; opacity: 0\">A tutor that's with you every step.</h2>\n          <p data-beat=\"tbody\" style=\"margin: 26px 0 0; font-size: 19px; line-height: 1.7; color: rgba(255,255,255,0.84); text-wrap: pretty; opacity: 0\">Kube doesn't just hand you the material and wish you luck. It teaches you one idea at a time, checks you actually get it — and every single day, it tells you exactly what to study. “Today, let's do this.” So the mountain never piles up, and you never fall behind.</p>\n          <p data-beat=\"tquote\" style=\"margin: 34px 0 0; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.22); font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 500; font-size: 24px; line-height: 1.45; color: #fff; text-wrap: pretty; opacity: 0\">“The part no cram app has: someone who makes sure you actually keep going.”</p>\n        </div>\n\n        <div style=\"flex: 1; position: relative\">\n          <div data-beat=\"tcard\" style=\"background: #fff; border-radius: 16px; padding: 22px; box-shadow: 0 34px 64px -30px rgba(0,0,0,0.5); opacity: 0\">\n            <span style=\"display: flex; align-items: center; gap: 9px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #8593a3\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M4 5h16v11H9l-4 3v-3H4z\"></path></svg>Your tutor</span>\n            <div style=\"display: flex; flex-direction: column; gap: 13px; margin-top: 18px; min-height: 214px\">\n              <span data-beat=\"bub1\" style=\"align-self: flex-start; max-width: 350px; padding: 13px 15px; background: #e2f0ef; border-radius: 14px 14px 14px 4px; font-size: 15px; line-height: 1.5; color: #16202b; opacity: 0\">Yesterday you got addressing modes on the second try. Let's lock it in before we move on — one question.</span>\n              <span data-beat=\"bub2\" style=\"align-self: flex-end; max-width: 240px; padding: 13px 15px; background: #eef1f4; border: 1px solid #dce2e8; border-radius: 14px 14px 4px 14px; font-size: 15px; line-height: 1.5; color: #46566a; opacity: 0\">ok go</span>\n              <span data-beat=\"bub3\" style=\"align-self: flex-start; max-width: 360px; padding: 13px 15px; background: #e2f0ef; border-radius: 14px 14px 14px 4px; font-size: 15px; line-height: 1.5; color: #16202b; opacity: 0\">Nice — that's it. That's Unit 2 done properly. Tomorrow: data transfer, and you're a third of the way up.</span>\n            </div>\n          </div>\n\n          <div data-beat=\"daily\" style=\"position: relative; margin: -12px 0 0 48px; background: #fff; border: 1px solid #eccb85; border-radius: 14px; padding: 18px 20px; box-shadow: 0 28px 50px -24px rgba(0,0,0,0.45); opacity: 0\">\n            <span style=\"display: flex; align-items: center; justify-content: space-between\">\n              <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #d98a1f\">Today · Thursday</span>\n              <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8593a3\">12 min</span>\n            </span>\n            <span style=\"display: block; margin-top: 11px; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 22px; letter-spacing: -0.02em; color: #16202b\">Today, let's do this.</span>\n            <span style=\"display: flex; align-items: center; gap: 13px; margin-top: 14px\">\n              <span style=\"flex: none; width: 34px; height: 34px; border-radius: 50%; background: #f8ecd7; border: 2px solid #d98a1f; display: grid; place-items: center; color: #d98a1f\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M13 2 4 14h6l-1 8 9-12h-6z\"></path></svg></span>\n              <span style=\"flex: 1\"><span style=\"display: block; font-size: 14.5px; font-weight: 600; color: #16202b\">Unit 3 · Data transfer methods</span><span style=\"display: block; font-size: 12.5px; color: #46566a\">One idea, then a quick check</span></span>\n              <button type=\"button\" data-cta style=\"flex: none; border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 999px; box-shadow: 0 3px 0 rgba(20,32,43,0.18)\">Start</button>\n            </span>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div data-toolkit style=\"padding: 128px 56px 120px\">\n    <div style=\"max-width: 1180px; margin: 0 auto\">\n      <div style=\"display: flex; align-items: baseline; justify-content: space-between; gap: 40px\">\n        <h3 data-reveal style=\"margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 30px; letter-spacing: -0.02em\">And all the study tools you'd want.</h3>\n        <p data-reveal data-delay=\"90\" style=\"margin: 0; font-size: 15px; color: #8593a3\">Everything you'd expect — plus the tutor you didn't know you needed.</p>\n      </div>\n      <div style=\"display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 30px\">\n        <span data-reveal data-delay=\"0\" style=\"display: flex; flex-direction: column; gap: 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 14px; padding: 20px\"><span style=\"color: #1f6f6b\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"7\" width=\"12\" height=\"14\" rx=\"2.5\"></rect><path d=\"M8 4.5h9A2.5 2.5 0 0 1 19.5 7v11\"></path></svg></span><span style=\"font-size: 14px; font-weight: 500\">Flashcards</span></span>\n        <span data-reveal data-delay=\"80\" style=\"display: flex; flex-direction: column; gap: 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 14px; padding: 20px\"><span style=\"color: #1f6f6b\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 8h12l-3-3M20 16H8l3 3\"></path></svg></span><span style=\"font-size: 14px; font-weight: 500\">Matching</span></span>\n        <span data-reveal data-delay=\"160\" style=\"display: flex; flex-direction: column; gap: 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 14px; padding: 20px\"><span style=\"color: #1f6f6b\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M4 4h7v16H5a1 1 0 0 1-1-1V4z\"></path><path d=\"M11 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V4z\"></path><path d=\"M7 9h1M14 9h3M14 13h3\" stroke-linecap=\"round\"></path></svg></span><span style=\"font-size: 14px; font-weight: 500\">Notes, rewritten clearly</span></span>\n        <span data-reveal data-delay=\"240\" style=\"display: flex; flex-direction: column; gap: 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 14px; padding: 20px\"><span style=\"color: #1f6f6b\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><path d=\"M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z\"></path><path d=\"M9 13.5l2 2 4-4\" stroke-linecap=\"round\"></path></svg></span><span style=\"font-size: 14px; font-weight: 500\">Mock exams</span></span>\n        <span data-reveal data-delay=\"320\" style=\"display: flex; flex-direction: column; gap: 13px; background: #fff; border: 1px solid #dce2e8; border-radius: 14px; padding: 20px\"><span style=\"color: #1f6f6b\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M13 2 4 14h6l-1 8 9-12h-6z\"></path></svg></span><span style=\"font-size: 14px; font-weight: 500\">Timed practice</span></span>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"plans\" data-plans style=\"padding: 40px 56px 140px\">\n    <div style=\"max-width: 1180px; margin: 0 auto\">\n      <div style=\"text-align: center\">\n        <h2 data-reveal style=\"margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 50px; line-height: 1.08; letter-spacing: -0.025em\">Start small. Grow when you're ready.</h2>\n        <p data-reveal data-delay=\"100\" style=\"margin: 20px 0 0; font-size: 18.5px; color: #46566a\">From $1 your first month. Cancel anytime.</p>\n      </div>\n\n      <div style=\"display: flex; gap: 22px; margin-top: 56px; align-items: stretch\">\n        <div data-reveal style=\"flex: none; width: 600px; display: flex; flex-direction: column; background: #fff; border: 1px solid #dce2e8; border-radius: 16px; padding: 36px; box-shadow: 0 0 0 2px #d98a1f, 0 26px 50px -28px rgba(15,32,50,0.34)\">\n          <span style=\"display: flex; align-items: center; gap: 11px\"><span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 32px; letter-spacing: -0.02em\">Kube Summit</span><span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #d98a1f; background: #f8ecd7; border-radius: 999px; padding: 4px 10px\">Most popular</span></span>\n          <p style=\"margin: 12px 0 0; font-size: 16.5px; color: #46566a\">Everything in Climb — plus your personal tutor.</p>\n          <span style=\"display: flex; align-items: baseline; gap: 4px; margin-top: 26px\"><span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 48px; letter-spacing: -0.02em\">$9.99</span><span style=\"font-size: 15px; color: #8593a3\">/mo</span></span>\n          <div style=\"display: flex; flex-direction: column; gap: 12px; margin-top: 26px; flex: 1\">\n            <span style=\"display: flex; align-items: flex-start; gap: 11px; font-size: 16px; font-weight: 600; color: #16202b\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#d98a1f\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 4px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>Your daily study plan — Kube tells you what to do today</span>\n            <span style=\"display: flex; align-items: flex-start; gap: 11px; font-size: 15px; color: #46566a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#d98a1f\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>The full guided climb, taught step by step</span>\n            <span style=\"display: flex; align-items: flex-start; gap: 11px; font-size: 15px; color: #46566a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#d98a1f\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>Ask your tutor anything, anytime</span>\n            <span style=\"display: flex; align-items: flex-start; gap: 11px; font-size: 15px; color: #46566a\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#d98a1f\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>Deeper breakdowns of every topic</span>\n          </div>\n          <button type=\"button\" data-cta data-plan=\"summit\" data-act=\"choosePlan\" style=\"margin-top: 30px; border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15.5px; padding: 16px 0; border-radius: 14px; box-shadow: 0 4px 0 rgba(20,32,43,0.18)\">Choose Summit</button>\n        </div>\n\n        <div style=\"flex: 1; display: flex; flex-direction: column; gap: 22px\">\n          <div data-reveal data-delay=\"120\" style=\"flex: 1; background: #fff; border: 1px solid #dce2e8; border-radius: 16px; padding: 28px 30px\">\n            <span style=\"display: flex; align-items: center; justify-content: space-between; gap: 12px\">\n              <span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 24px; letter-spacing: -0.02em\">Kube Climb</span>\n              <span style=\"display: flex; align-items: baseline; gap: 3px\"><span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 27px; letter-spacing: -0.02em\">$2.99</span><span style=\"font-size: 13px; color: #8593a3\">/mo</span></span>\n            </span>\n            <span style=\"display: inline-block; margin-top: 9px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #1f6f6b; background: #e2f0ef; border-radius: 999px; padding: 4px 10px\">$0.99 first month</span>\n            <p style=\"margin: 13px 0 0; font-size: 15px; color: #46566a\">All your study tools, all your subjects.</p>\n            <div style=\"display: flex; flex-direction: column; gap: 9px; margin-top: 15px\">\n              <span style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #46566a\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>Flashcards, matching, notes, mock exams, timed practice</span>\n              <span style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #46566a\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>See your whole course mapped out\n                <span data-clue class=\"kl-clue\" style=\"position: relative; display: inline-flex; align-items: center; justify-content: center; flex: none; box-sizing: border-box; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; border: 1.5px solid #b4d8d5; background: #fff; color: #1f6f6b; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; line-height: 18px; text-align: center; cursor: help; transition: background 0.15s ease, border-color 0.15s ease\">?\n                  <span data-tip style=\"position: absolute; bottom: 28px; left: 50%; width: 218px; margin-left: -109px; padding: 10px 12px; background: #16202b; color: #fff; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.45; text-align: center; opacity: 0; transform: translateY(4px); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; box-shadow: 0 12px 24px -12px rgba(15,32,50,0.5)\">The full guided climb is waiting for you in Summit &amp; Crew.\n                    <span style=\"position: absolute; left: 50%; bottom: -4px; width: 9px; height: 9px; margin-left: -4.5px; background: #16202b; transform: rotate(45deg); border-radius: 1px\"></span>\n                  </span>\n                </span>\n              </span>\n            </div>\n            <button type=\"button\" data-plan=\"climb\" data-act=\"choosePlan\" style=\"width: 100%; margin-top: 20px; border: none; cursor: pointer; background: #1f6f6b; color: #fff; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; padding: 13px 0; border-radius: 13px; box-shadow: 0 4px 0 rgba(20,32,43,0.18)\">Choose Climb</button>\n          </div>\n\n          <div data-reveal data-delay=\"220\" style=\"flex: 1; background: #fff; border: 1px solid #dce2e8; border-radius: 16px; padding: 28px 30px\">\n            <span style=\"display: flex; align-items: center; justify-content: space-between; gap: 12px\">\n              <span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 24px; letter-spacing: -0.02em\">Kube Crew</span>\n              <span style=\"display: flex; align-items: baseline; gap: 3px\"><span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 27px; letter-spacing: -0.02em\">$23.99</span><span style=\"font-size: 13px; color: #8593a3\">up to 4</span></span>\n            </span>\n            <span style=\"display: inline-block; margin-top: 9px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #1f6f6b; background: #e2f0ef; border-radius: 999px; padding: 4px 10px\">Best value per person · $29.99 up to 6</span>\n            <p style=\"margin: 13px 0 0; font-size: 15px; color: #46566a\">Everything in Summit — for you and your study group.</p>\n            <div style=\"display: flex; flex-direction: column; gap: 9px; margin-top: 15px\">\n              <span style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #46566a\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>One shared library your whole crew pools into</span>\n              <span style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #46566a\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>Everyone's progress stays their own</span>\n              <span style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 14px; color: #46566a\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1f6f6b\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; margin-top: 3px\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>You lead the crew — invite, manage, keep it yours</span>\n            </div>\n            <button type=\"button\" data-plan=\"crew\" data-act=\"choosePlan\" style=\"width: 100%; margin-top: 20px; border: none; cursor: pointer; background: #1f6f6b; color: #fff; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; padding: 13px 0; border-radius: 13px; box-shadow: 0 4px 0 rgba(20,32,43,0.18)\">Choose Crew</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div style=\"background: #fff; border-top: 1px solid #dce2e8; padding: 148px 56px 156px\">\n    <div style=\"max-width: 900px; margin: 0 auto; text-align: center\">\n      <h2 data-reveal style=\"margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 56px; line-height: 1.06; letter-spacing: -0.025em; text-wrap: pretty\">Your whole semester, one step at a time.</h2>\n      <p data-reveal data-delay=\"120\" style=\"margin: 24px 0 0; font-size: 19px; color: #46566a\">Start today for $1. Climb at your own pace.</p>\n      <div data-reveal data-delay=\"240\" style=\"display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 42px\">\n        <button type=\"button\" data-act=\"openSignup\" data-cta style=\"border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 17px; padding: 18px 38px; border-radius: 14px; box-shadow: 0 4px 0 rgba(20,32,43,0.18)\">Build my first subject</button>\n        <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: 0.08em; color: #8593a3\">Takes about 2 minutes.</span>\n      </div>\n    </div>\n  </div>\n\n  <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 30px 56px; background: #eef1f4; border-top: 1px solid #dce2e8\">\n    <span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 16px; letter-spacing: -0.02em\"><span style=\"color: #16202b\">Studying</span><span style=\"color: #1f6f6b\">Kube</span></span>\n    <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #8593a3\">From $1 a month · cancel anytime</span>\n  </div>\n\n  <div data-overlay=\"auth\" style=\"display: none; position: fixed; inset: 0; z-index: 90; background: #eef1f4; overflow: auto\">\n    <div style=\"position: relative; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 60px 24px; overflow: hidden\">\n      <div style=\"position: absolute; width: 560px; height: 560px; border-radius: 50%; border: 1px solid #b4d8d5; opacity: 0.5; left: 64%; top: -190px; animation: k-drift 18s ease-in-out infinite\"></div>\n      <div style=\"position: absolute; width: 420px; height: 420px; border-radius: 50%; background: #e2f0ef; opacity: 0.5; left: -150px; bottom: -140px; animation: k-drift2 22s ease-in-out infinite\"></div>\n\n      <div style=\"position: relative; z-index: 2; width: 428px; max-width: 100%; animation: kl-in 0.5s cubic-bezier(.22,1,.36,1) both\">\n        <div style=\"display: flex; flex-direction: column; align-items: center; text-align: center\">\n          <span style=\"display: flex; align-items: center; gap: 11px\">\n            <svg width=\"30\" height=\"30\" viewBox=\"0 0 120 120\" fill=\"none\"><path d=\"M60 16 L104 41 L60 66 L16 41 Z\" fill=\"#2b8480\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path><path d=\"M16 41 L60 66 L60 112 L16 87 Z\" fill=\"#1f6f6b\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path><path d=\"M104 41 L60 66 L60 112 L104 87 Z\" fill=\"#175a56\" stroke=\"#0f3f3c\" stroke-width=\"4\" stroke-linejoin=\"round\"></path></svg>\n            <span style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 22px; letter-spacing: -0.02em\"><span style=\"color: #16202b\">Studying</span><span style=\"color: #1f6f6b\">Kube</span></span>\n          </span>\n          <h1 style=\"margin: 26px 0 0; font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 38px; line-height: 1.06; letter-spacing: -0.025em; color: #16202b\">\n            <span data-label=\"signin\">Welcome back.</span>\n            <span data-label=\"signup\" style=\"display: none\">Let's make it small.</span>\n          </h1>\n          <p style=\"margin: 12px 0 0; font-size: 16.5px; line-height: 1.55; color: #46566a\">\n            <span data-label=\"signin\">Your ladder is right where you left it.</span>\n            <span data-label=\"signup\" style=\"display: none\">Two minutes, and today's step is ready for you.</span>\n          </p>\n        </div>\n\n        <div style=\"margin-top: 30px; background: #fff; border: 1px solid #dce2e8; border-radius: 20px; padding: 30px; box-shadow: 0 30px 60px -32px rgba(15,32,50,0.34)\">\n\n          <div data-auth-panel=\"form\">\n            <div data-auth-note style=\"display: none; align-items: flex-start; gap: 10px; background: #f8ecd7; border: 1px solid #eccb85; border-radius: 12px; padding: 11px 13px; margin-bottom: 20px; font-size: 12.5px; line-height: 1.5; color: #46566a\">Create your account first — then we'll set up <span data-auth-plan style=\"font-weight: 600; color: #16202b\">Kube Summit</span>.</div>\n\n            <div style=\"display: flex; background: #e5e8ec; border-radius: 12px; padding: 4px; margin-bottom: 22px\">\n              <button type=\"button\" data-tab=\"signin\" data-act=\"setTab\" style=\"flex: 1; padding: 9px; border-radius: 9px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; background: #fff; color: #1f6f6b; box-shadow: 0 1px 3px rgba(15,32,50,.12)\">Sign in</button>\n              <button type=\"button\" data-tab=\"signup\" data-act=\"setTab\" style=\"flex: 1; padding: 9px; border-radius: 9px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; background: transparent; color: #8593a3\">Create account</button>\n            </div>\n\n            <label style=\"display: block; font-size: 12.5px; font-weight: 600; color: #16202b; margin-bottom: 7px\">Email</label>\n            <input class=\"kl-input\" type=\"email\" placeholder=\"you@university.edu\" style=\"width: 100%; box-sizing: border-box; border-radius: 12px; border: 1px solid #dce2e8; background: #fff; padding: 13px 14px; font-family: 'Inter', sans-serif; font-size: 14.5px; color: #16202b; outline: none\">\n\n            <label style=\"display: block; font-size: 12.5px; font-weight: 600; color: #16202b; margin: 18px 0 7px\">Password</label>\n            <div style=\"position: relative\">\n              <input class=\"kl-input\" data-pw type=\"password\" placeholder=\"••••••••\" style=\"width: 100%; box-sizing: border-box; border-radius: 12px; border: 1px solid #dce2e8; background: #fff; padding: 13px 42px 13px 14px; font-family: 'Inter', sans-serif; font-size: 14.5px; color: #16202b; outline: none\">\n              <button type=\"button\" data-act=\"togglePw\" title=\"Show or hide password\" style=\"position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #8593a3; display: grid; place-items: center; width: 30px; height: 30px\">\n                <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n              </button>\n            </div>\n\n            <div style=\"display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 20px 0 22px\">\n              <span data-act=\"toggleRemember\" style=\"display: flex; align-items: center; gap: 9px; cursor: pointer\">\n                <span data-remember style=\"flex: none; box-sizing: border-box; width: 20px; height: 20px; border-radius: 6px; border: 2px solid #1f6f6b; background: #1f6f6b; display: grid; place-items: center\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n                <span style=\"font-size: 12.5px; color: #46566a; white-space: nowrap\">Keep me signed in</span>\n              </span>\n              <a href=\"#plans\" data-act=\"noop\" style=\"font-size: 12px; font-weight: 600; white-space: nowrap\">Forgot password?</a>\n            </div>\n\n            <button type=\"button\" data-act=\"submitAuth\" style=\"width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px; background: #1f6f6b; color: #fff; border: none; border-radius: 13px; padding: 14px; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 4px 0 rgba(20,32,43,.18)\">\n              <span data-busy style=\"display: none; width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,.5); border-top-color: #fff; animation: kl-spin .8s linear infinite\"></span>\n              <span data-label=\"signin\">Sign in</span>\n              <span data-label=\"signup\" style=\"display: none\">Create my account</span>\n            </button>\n\n            <div style=\"display: flex; align-items: center; gap: 12px; margin: 20px 0\">\n              <span style=\"flex: 1; height: 1px; background: #dce2e8\"></span>\n              <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #8593a3\">or</span>\n              <span style=\"flex: 1; height: 1px; background: #dce2e8\"></span>\n            </div>\n\n            <button type=\"button\" class=\"kl-google\" data-act=\"submitAuth\" style=\"width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #fff; border: 1px solid #dce2e8; border-radius: 13px; padding: 13px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13.5px; color: #16202b; cursor: pointer\">\n              <svg width=\"18\" height=\"18\" viewBox=\"0 0 48 48\"><path fill=\"#EA4335\" d=\"M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.3 17.7 9.5 24 9.5z\"></path><path fill=\"#4285F4\" d=\"M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.2-9.6 6.2-17z\"></path><path fill=\"#FBBC05\" d=\"M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.8-6.1z\"></path><path fill=\"#34A853\" d=\"M24 48c6.2 0 11.4-2 15.2-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.1 2.2-6.3 0-11.7-3.8-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z\"></path></svg>\n              Continue with Google\n            </button>\n\n            <p style=\"margin: 20px 0 0; font-size: 11px; line-height: 1.55; color: #8593a3; text-align: center\">By continuing you agree to StudyingKube's <a href=\"#plans\" data-act=\"noop\">Terms</a> and <a href=\"#plans\" data-act=\"noop\">Privacy Policy</a>.</p>\n          </div>\n\n          <div data-auth-panel=\"done\" style=\"display: none; text-align: center; padding: 20px 6px 14px\">\n            <div style=\"width: 58px; height: 58px; border-radius: 50%; background: #1f6f6b; display: grid; place-items: center; margin: 0 auto; animation: k-locate 1.2s ease-out .1s 2\"><svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></div>\n            <div style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 24px; letter-spacing: -0.02em; color: #16202b; margin-top: 18px\">You're in</div>\n            <div style=\"display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 10px; color: #46566a; font-size: 13.5px\">\n              <span style=\"width: 15px; height: 15px; border-radius: 50%; border: 2px solid #b4d8d5; border-top-color: #1f6f6b; animation: kl-spin .8s linear infinite; display: inline-block\"></span>\n              <span data-done-label>Taking you to your ladder…</span>\n            </div>\n          </div>\n        </div>\n\n        <div style=\"display: flex; justify-content: center; margin-top: 22px\">\n          <button type=\"button\" data-act=\"closeOverlay\" style=\"display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; color: #8593a3; padding: 6px 10px\">\n            <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 12H6M11 6l-5 6 5 6\"></path></svg>\n            Back to the page\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div data-overlay=\"checkout\" style=\"display: none; position: fixed; inset: 0; z-index: 95; background: rgba(22,32,43,.6); backdrop-filter: blur(6px); align-items: center; justify-content: center; padding: 40px; overflow: auto\">\n    <div style=\"width: 470px; background: #fff; border: 1px solid #dce2e8; border-radius: 20px; padding: 30px; box-shadow: 0 44px 90px -44px rgba(15,32,50,.6); animation: kl-in 0.42s cubic-bezier(.22,1,.36,1) both\">\n\n      <div data-pay-panel=\"review\">\n        <div style=\"display: flex; align-items: center; justify-content: space-between\">\n          <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: #8593a3\">Your plan</span>\n          <button type=\"button\" data-act=\"closeOverlay\" style=\"background: none; border: none; cursor: pointer; color: #8593a3; display: grid; place-items: center; width: 26px; height: 26px\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg></button>\n        </div>\n\n        <h3 data-pay-name style=\"margin: 14px 0 0; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 29px; letter-spacing: -0.02em\">Kube Summit</h3>\n        <p data-pay-tag style=\"margin: 7px 0 0; font-size: 15px; color: #46566a\">Everything in Climb — plus your personal tutor.</p>\n\n        <div style=\"display: inline-flex; border-radius: 999px; padding: 4px; background: #e5e8ec; margin-top: 20px\">\n          <button type=\"button\" data-interval=\"month\" data-act=\"setInterval\" style=\"border: none; cursor: pointer; border-radius: 999px; padding: 7px 15px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; background: #fff; color: #1f6f6b; box-shadow: 0 1px 3px rgba(15,32,50,.12)\">Monthly</button>\n          <button type=\"button\" data-interval=\"annual\" data-act=\"setInterval\" style=\"border: none; cursor: pointer; border-radius: 999px; padding: 7px 15px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; background: transparent; color: #8593a3\">Yearly · ~2 months free</button>\n        </div>\n\n        <div style=\"display: flex; align-items: baseline; gap: 5px; margin-top: 18px\">\n          <span data-pay-price style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 42px; letter-spacing: -0.02em\">$9.99</span>\n          <span data-pay-per style=\"font-size: 14px; color: #8593a3\">/mo</span>\n        </div>\n        <p data-pay-intro style=\"margin: 6px 0 0; font-size: 13px; font-weight: 600; color: #1f6f6b\">$5.99 your first month, then $9.99/mo</p>\n\n        <div data-pay-crew style=\"display: none; margin-top: 18px\">\n          <span style=\"display: block; font-size: 12.5px; font-weight: 600; color: #16202b; margin-bottom: 8px\">How big is your crew?</span>\n          <div style=\"display: inline-flex; border-radius: 999px; padding: 4px; background: #e5e8ec\">\n            <button type=\"button\" data-size=\"4\" data-act=\"setSize\" style=\"border: none; cursor: pointer; border-radius: 999px; padding: 7px 15px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; background: #fff; color: #1f6f6b; box-shadow: 0 1px 3px rgba(15,32,50,.12)\">Up to 4</button>\n            <button type=\"button\" data-size=\"6\" data-act=\"setSize\" style=\"border: none; cursor: pointer; border-radius: 999px; padding: 7px 15px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; background: transparent; color: #8593a3\">Up to 6</button>\n          </div>\n        </div>\n\n        <div style=\"display: flex; align-items: flex-start; gap: 11px; margin-top: 22px; padding: 14px 15px; background: #eef1f4; border: 1px solid #dce2e8; border-radius: 12px\">\n          <span style=\"flex: none; color: #1f6f6b; margin-top: 1px\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"9\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0\" stroke-linecap=\"round\"></path></svg></span>\n          <span style=\"font-size: 12.5px; line-height: 1.5; color: #46566a\">Payment happens on a secure checkout page — Kube never sees your card. Cancel any time from your subjects page.</span>\n        </div>\n\n        <button type=\"button\" data-act=\"startCheckout\" data-cta style=\"width: 100%; margin-top: 22px; border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px; padding: 15px 0; border-radius: 14px; box-shadow: 0 4px 0 rgba(20,32,43,.18)\">Continue to secure checkout</button>\n        <button type=\"button\" data-act=\"closeOverlay\" style=\"width: 100%; margin-top: 10px; background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12.5px; color: #8593a3; padding: 8px 0\">Maybe later</button>\n      </div>\n\n      <div data-pay-panel=\"busy\" style=\"display: none; text-align: center; padding: 30px 6px 22px\">\n        <span style=\"display: inline-block; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #b4d8d5; border-top-color: #1f6f6b; animation: kl-spin .8s linear infinite\"></span>\n        <div style=\"margin-top: 18px; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 21px; letter-spacing: -0.02em\">Opening secure checkout…</div>\n        <div style=\"margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .08em; color: #8593a3\">One moment</div>\n      </div>\n\n      <div data-pay-panel=\"done\" style=\"display: none; text-align: center; padding: 22px 6px 14px\">\n        <div style=\"width: 58px; height: 58px; border-radius: 50%; background: #1f6f6b; display: grid; place-items: center; margin: 0 auto\"><svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M5 12.5l4.5 4.5L19 7.5\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></div>\n        <div style=\"font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 25px; letter-spacing: -0.02em; margin-top: 16px\">You're on the climb</div>\n        <p data-pay-done-line style=\"margin: 10px auto 0; max-width: 320px; font-size: 14px; line-height: 1.55; color: #46566a\">Kube Summit is active. Add your first subject and your tutor will have tomorrow's step ready.</p>\n        <div style=\"display: flex; flex-direction: column; gap: 10px; margin-top: 24px\">\n          <button type=\"button\" data-act=\"closeOverlay\" data-cta style=\"width: 100%; border: none; cursor: pointer; background: #d98a1f; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 0; border-radius: 14px; box-shadow: 0 4px 0 rgba(20,32,43,.18)\">Build my first subject</button>\n          <span style=\"font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .08em; color: #8593a3\">Takes about 2 minutes.</span>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";

const CLAMP = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const R = (p: number, a: number, b: number) => EASE(CLAMP((p - a) / (b - a)));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Plan = {
  name: string;
  tag: string;
  month: string | Record<number, string>;
  annual: string | Record<number, string>;
  intro: string;
  crew?: boolean;
  done: string;
};
const PLANS: Record<string, Plan> = {
  climb: { name: "Kube Climb", tag: "All your study tools, all your subjects.", month: "$2.99", annual: "$29.99", intro: "$0.99 your first month, then $2.99/mo", done: "Kube Climb is active. Add your first subject and every study tool unlocks with it." },
  summit: { name: "Kube Summit", tag: "Everything in Climb — plus your personal tutor.", month: "$9.99", annual: "$99.99", intro: "$5.99 your first month, then $9.99/mo", done: "Kube Summit is active. Add your first subject and your tutor will have tomorrow's step ready." },
  crew: { name: "Kube Crew", tag: "Everything in Summit — for you and your study group.", month: { 4: "$23.99", 6: "$29.99" }, annual: { 4: "$239.99", 6: "$299.99" }, intro: "", crew: true, done: "Kube Crew is active. Invite your crew, then add the first subject to your shared library." },
};

function authError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email or password doesn't match.";
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in.";
    case "auth/weak-password":
      return "Use at least 6 characters for your password.";
    case "auth/invalid-email":
      return "That doesn't look like an email address.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    default:
      return "Something went wrong — please try again.";
  }
}

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (s: string) => root.querySelector(s) as HTMLElement | null;
    const qa = (s: string) => Array.from(root.querySelectorAll(s)) as HTMLElement[];
    const qsa = (r: ParentNode, s: string) => Array.from(r.querySelectorAll(s)) as HTMLElement[];
    const motionOn = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setEl = (el: HTMLElement | null, o: number, y: number, extra?: string) => {
      if (!el) return;
      el.style.opacity = String(o);
      el.style.transform = "translateY(" + y + "px)" + (extra || "");
    };
    const pinProgress = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      if (span <= 0) return r.top <= 0 ? 1 : 0;
      return CLAMP(-r.top / span);
    };

    const pulsed: Record<string, boolean> = {};

    const paintTurn = (stage: HTMLElement, p: number) => {
      const g = (n: string) => stage.querySelector('[data-beat="' + n + '"]') as HTMLElement | null;
      const outA = 1 - R(p, 0.46, 0.53);
      setEl(g("h2a"), R(p, 0.01, 0.08) * outA, (1 - R(p, 0.01, 0.08)) * 16);
      const ga = g("groupa");
      if (ga) ga.style.opacity = String(outA);
      setEl(g("a1"), R(p, 0.07, 0.13), (1 - R(p, 0.07, 0.13)) * 14);
      setEl(g("a2"), R(p, 0.17, 0.23) * 0.999, (1 - R(p, 0.17, 0.23)) * 14);
      setEl(g("a3"), R(p, 0.27, 0.33), (1 - R(p, 0.27, 0.33)) * 14);
      setEl(g("a4"), R(p, 0.37, 0.43), (1 - R(p, 0.37, 0.43)) * 14);
      const inB = R(p, 0.53, 0.6);
      setEl(g("h2b"), inB, (1 - inB) * 18);
      const gb = g("groupb");
      if (gb) gb.style.opacity = String(inB > 0 ? 1 : 0);
      setEl(g("b1"), R(p, 0.6, 0.66), (1 - R(p, 0.6, 0.66)) * 14);
      setEl(g("b2"), R(p, 0.7, 0.76), (1 - R(p, 0.7, 0.76)) * 14);
      setEl(g("b3"), R(p, 0.82, 0.88), (1 - R(p, 0.82, 0.88)) * 14);

      qsa(stage, "[data-doc]").forEach((el) => {
        const d = el.dataset;
        const i = +(d.i || 0);
        const born = R(p, 0.08 + i * 0.055, 0.14 + i * 0.055);
        const t = R(p, 0.6 + i * 0.05, 0.9 + i * 0.05);
        const jitter = Math.sin((p * 6 + i) * 1.6) * 3 * (1 - t);
        const x = +(d.sx || 0) + (+(d.tx || 0) - +(d.sx || 0)) * t;
        const y = +(d.sy || 0) + (+(d.ty || 0) - +(d.sy || 0)) * t - (1 - born) * 22 + jitter;
        el.style.opacity = String(born * (1 - CLAMP((t - 0.55) / 0.4)));
        el.style.transform =
          "translate(" + x + "px," + y + "px) rotate(" + +(d.rot || 0) * (1 - t) + "deg) scale(" + (0.94 + 0.06 * born - 0.68 * t) + ")";
      });

      const line = stage.querySelector("[data-line]") as SVGPathElement | null;
      if (line && line.getTotalLength) {
        const L = line.getTotalLength();
        line.style.strokeDasharray = String(L);
        line.style.strokeDashoffset = String(L * (1 - R(p, 0.62, 0.95)));
      }

      qsa(stage, "[data-node],[data-nodelabel]").forEach((el) => {
        const i = +(el.dataset.i || 0);
        const t = R(p, 0.66 + i * 0.045, 0.78 + i * 0.045);
        el.style.opacity = String(t);
        if (el.hasAttribute("data-node")) {
          el.style.transform = "scale(" + (0.5 + 0.5 * t) + ")";
          if (el.dataset.current && t > 0.99 && !pulsed.node) {
            pulsed.node = true;
            el.style.animation = "k-locate 1.2s ease-out 0.1s 2";
          }
        } else {
          el.style.transform = "translateY(" + (1 - t) * 10 + "px)";
        }
      });
    };

    const paintTutor = (sec: HTMLElement, p: number) => {
      const g = (n: string) => sec.querySelector('[data-beat="' + n + '"]') as HTMLElement | null;
      setEl(g("teyebrow"), R(p, 0.02, 0.08), (1 - R(p, 0.02, 0.08)) * 12);
      setEl(g("th2"), R(p, 0.05, 0.14), (1 - R(p, 0.05, 0.14)) * 20);
      setEl(g("tbody"), R(p, 0.14, 0.24), (1 - R(p, 0.14, 0.24)) * 16);
      setEl(g("tcard"), R(p, 0.2, 0.3), (1 - R(p, 0.2, 0.3)) * 24);
      setEl(g("bub1"), R(p, 0.3, 0.37), (1 - R(p, 0.3, 0.37)) * 12);
      setEl(g("bub2"), R(p, 0.42, 0.48), (1 - R(p, 0.42, 0.48)) * 12);
      setEl(g("bub3"), R(p, 0.54, 0.61), (1 - R(p, 0.54, 0.61)) * 12);
      const dt = R(p, 0.68, 0.78);
      const daily = g("daily");
      setEl(daily, dt, (1 - dt) * 34);
      if (daily && dt > 0.99 && !pulsed.daily) {
        pulsed.daily = true;
        daily.style.animation = "k-locate 1.2s ease-out 0.15s 2";
      }
      setEl(g("tquote"), R(p, 0.84, 0.92), (1 - R(p, 0.84, 0.92)) * 14);
    };

    const frame = () => {
      const doc = document.documentElement;
      const bar = q("[data-progress]");
      if (bar) bar.style.width = CLAMP(window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)) * 100 + "%";
      const cue = q("[data-cue]");
      if (cue) cue.style.opacity = String(1 - CLAMP(window.scrollY / 260));
      const stage = q("[data-stage]");
      if (stage) paintTurn(stage, motionOn() ? pinProgress(stage.closest("[data-pin]") as HTMLElement) : 1);
      const tutor = q("[data-tutor]");
      if (tutor) paintTutor(tutor, motionOn() ? pinProgress(tutor) : 1);
    };

    let io: IntersectionObserver | null = null;
    const reveals = () => {
      const els = qa("[data-reveal]").filter((e) => !e.dataset.rev);
      if (!els.length) return;
      if (!motionOn()) {
        els.forEach((e) => {
          e.dataset.rev = "1";
          e.style.opacity = "1";
          e.style.transform = "none";
        });
        return;
      }
      els.forEach((e) => {
        e.dataset.rev = "1";
        if (e.getBoundingClientRect().top > window.innerHeight - 60) {
          e.style.opacity = "0";
          e.style.transform = "translateY(22px)";
          e.style.transition =
            "opacity .75s cubic-bezier(.22,1,.36,1) " + (+(e.dataset.delay || 0)) + "ms, transform .75s cubic-bezier(.22,1,.36,1) " + (+(e.dataset.delay || 0)) + "ms";
        }
      });
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            (en.target as HTMLElement).style.opacity = "1";
            (en.target as HTMLElement).style.transform = "none";
            io && io.unobserve(en.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      els.forEach((e) => io && io.observe(e));
    };

    /* ---- Overlay flows: real Firebase auth + Stripe checkout ------------- */
    let authMode: "signin" | "signup" = "signin";
    let plan = "summit";
    let interval: "month" | "annual" = "month";
    let size = 4;
    let pending = false;
    let remember = true;
    const isSignedIn = () => !!auth().currentUser;

    const showOverlay = (which: "auth" | "checkout" | null) => {
      const a = q('[data-overlay="auth"]');
      const c = q('[data-overlay="checkout"]');
      if (a) a.style.display = which === "auth" ? "block" : "none";
      if (c) c.style.display = which === "checkout" ? "flex" : "none";
      document.body.style.overflow = which ? "hidden" : "";
    };
    const setTabState = (mode: "signin" | "signup") => {
      authMode = mode;
      qa("[data-tab]").forEach((b) => {
        const on = b.dataset.tab === mode;
        b.style.background = on ? "#fff" : "transparent";
        b.style.color = on ? "#1f6f6b" : "#8593a3";
        b.style.boxShadow = on ? "0 1px 3px rgba(15,32,50,.12)" : "none";
      });
      qa("[data-label]").forEach((s) => {
        s.style.display = s.dataset.label === mode ? "" : "none";
      });
    };
    const authPanel = (which: "form" | "done") => {
      qa("[data-auth-panel]").forEach((p) => {
        p.style.display = p.dataset.authPanel === which ? "block" : "none";
      });
    };
    const payPanel = (which: "review" | "busy" | "done") => {
      qa("[data-pay-panel]").forEach((p) => {
        p.style.display = p.dataset.payPanel === which ? "block" : "none";
      });
    };
    const setAuthNote = (msg: string | null, isError: boolean) => {
      const n = q("[data-auth-note]");
      if (!n) return;
      if (msg) {
        n.style.display = "flex";
        n.textContent = msg;
        n.style.background = isError ? "#f7e2df" : "#f8ecd7";
        n.style.borderColor = isError ? "#e8b3ab" : "#eccb85";
        n.style.color = isError ? "#a3392f" : "#46566a";
      } else {
        n.style.display = "none";
      }
    };
    const paintPlan = () => {
      const p = PLANS[plan];
      const priceMap = p.crew ? (p[interval] as Record<number, string>) : null;
      const price = priceMap ? priceMap[size] : (p[interval] as string);
      const set = (sel: string, txt: string) => {
        const el = q(sel);
        if (el) el.textContent = txt;
      };
      set("[data-pay-name]", p.name);
      set("[data-pay-tag]", p.tag);
      set("[data-pay-price]", price);
      set("[data-pay-per]", interval === "month" ? "/mo" : "/yr");
      set("[data-pay-done-line]", p.done);
      const intro = q("[data-pay-intro]");
      if (intro) {
        const show = interval === "month" && !!p.intro;
        intro.textContent = show ? p.intro : p.crew ? "About $" + (size === 4 ? "6" : "5") + " a head." : "Billed yearly · about two months free.";
        intro.style.color = show ? "#1f6f6b" : "#8593a3";
      }
      const crew = q("[data-pay-crew]");
      if (crew) crew.style.display = p.crew ? "block" : "none";
      qa("[data-interval]").forEach((b) => {
        const on = b.dataset.interval === interval;
        b.style.background = on ? "#fff" : "transparent";
        b.style.color = on ? "#1f6f6b" : "#8593a3";
        b.style.boxShadow = on ? "0 1px 3px rgba(15,32,50,.12)" : "none";
      });
      qa("[data-size]").forEach((b) => {
        const on = +(b.dataset.size || 0) === size;
        b.style.background = on ? "#fff" : "transparent";
        b.style.color = on ? "#1f6f6b" : "#8593a3";
        b.style.boxShadow = on ? "0 1px 3px rgba(15,32,50,.12)" : "none";
      });
    };
    const openAuth = (mode: "signin" | "signup", planKey?: string) => {
      if (planKey) plan = planKey;
      pending = !!planKey;
      setAuthNote(planKey ? "Create your account first — then we'll set up " + PLANS[plan].name + "." : null, false);
      authPanel("form");
      setTabState(mode);
      showOverlay("auth");
    };
    const openCheckout = (planKey?: string) => {
      if (planKey) plan = planKey;
      payPanel("review");
      paintPlan();
      showOverlay("checkout");
    };

    const doAuth = async (google: boolean) => {
      const busy = q("[data-busy]");
      const emailEl = q('[data-overlay="auth"] input[type="email"]') as HTMLInputElement | null;
      const pwEl = q("[data-pw]") as HTMLInputElement | null;
      try {
        if (busy) busy.style.display = "inline-block";
        await setPersistence(auth(), remember ? browserLocalPersistence : browserSessionPersistence);
        if (google) {
          await signInWithPopup(auth(), new GoogleAuthProvider());
        } else {
          const email = (emailEl?.value || "").trim();
          const pw = pwEl?.value || "";
          if (!EMAIL_RE.test(email)) return setAuthNote("That doesn't look like an email address.", true);
          if (pw.length < 6) return setAuthNote("Use at least 6 characters for your password.", true);
          if (authMode === "signup") await createUserWithEmailAndPassword(auth(), email, pw);
          else await signInWithEmailAndPassword(auth(), email, pw);
        }
        const lbl = q("[data-done-label]");
        if (lbl) lbl.textContent = pending ? "Setting up " + PLANS[plan].name + "…" : "Taking you to your ladder…";
        authPanel("done");
        window.setTimeout(() => {
          if (pending) {
            pending = false;
            openCheckout(plan);
          } else {
            router.push("/learn");
          }
        }, 900);
      } catch (err) {
        const msg = authError((err as { code?: string })?.code);
        if (msg) setAuthNote(msg, true);
      } finally {
        if (busy) busy.style.display = "none";
      }
    };

    const doCheckout = async () => {
      payPanel("busy");
      try {
        const res = await authedFetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: plan, interval, size }),
        });
        const d = await res.json();
        if (!res.ok || !d.url) throw new Error(d.error || "Checkout failed.");
        window.location.href = d.url as string;
      } catch (err) {
        payPanel("review");
        const rev = q('[data-pay-panel="review"]');
        if (rev) {
          let e = rev.querySelector("[data-pay-error]") as HTMLElement | null;
          if (!e) {
            e = document.createElement("p");
            e.setAttribute("data-pay-error", "");
            e.style.cssText = "margin:12px 0 0;font-size:13px;color:#c9463a;font-weight:600";
            rev.appendChild(e);
          }
          e.textContent = err instanceof Error ? err.message : "Checkout failed.";
        }
      }
    };

    const goPlans = () => {
      const t = q("[data-plans]");
      if (t) {
        const r = t.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + r.top - 90, behavior: "smooth" });
      }
    };

    const acts: Record<string, (e: Event, el: HTMLElement) => void> = {
      noop: (e) => e.preventDefault(),
      openSignin: (e) => {
        e.preventDefault();
        openAuth("signin");
      },
      openSignup: () => openAuth("signup"),
      goPlans: () => goPlans(),
      closeOverlay: () => showOverlay(null),
      choosePlan: (_e, el) => {
        const key = el.dataset.plan || "summit";
        if (isSignedIn()) openCheckout(key);
        else openAuth("signup", key);
      },
      setTab: (_e, el) => setTabState((el.dataset.tab as "signin" | "signup") || "signin"),
      togglePw: () => {
        const i = q("[data-pw]") as HTMLInputElement | null;
        if (i) i.type = i.type === "password" ? "text" : "password";
      },
      toggleRemember: () => {
        remember = !remember;
        const b = q("[data-remember]");
        if (!b) return;
        b.style.background = remember ? "#1f6f6b" : "#fff";
        b.style.borderColor = remember ? "#1f6f6b" : "#dce2e8";
        if (b.firstElementChild) (b.firstElementChild as HTMLElement).style.opacity = remember ? "1" : "0";
      },
      submitAuth: (_e, el) => {
        void doAuth(el.classList.contains("kl-google"));
      },
      setInterval: (_e, el) => {
        interval = (el.dataset.interval as "month" | "annual") || "month";
        paintPlan();
      },
      setSize: (_e, el) => {
        size = +(el.dataset.size || 4);
        paintPlan();
      },
      startCheckout: () => void doCheckout(),
    };
    qa("[data-act]").forEach((el) => {
      if (el.dataset.act === "openSignin" || el.tagName === "BUTTON") el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        const fn = acts[el.dataset.act || ""];
        if (fn) fn(e, el);
      });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") showOverlay(null);
    };
    window.addEventListener("keydown", onKey);

    /* ---- Scroll wiring --------------------------------------------------- */
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        frame();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    reveals();
    frame();
    const t1 = setTimeout(() => {
      reveals();
      frame();
    }, 250);
    const t2 = setTimeout(() => {
      reveals();
      frame();
    }, 1200);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
      if (io) io.disconnect();
    };
  }, [router]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={rootRef}
        className="kube-landing"
        style={{
          minWidth: 1440,
          background: "#eef1f4",
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          color: "#16202b",
          WebkitFontSmoothing: "antialiased",
        }}
        dangerouslySetInnerHTML={{ __html: BODY }}
      />
    </>
  );
}
