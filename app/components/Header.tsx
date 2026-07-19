"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function Header({ email }: { email?: string | null }) {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Studying <span className="text-indigo-600">Kube</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {email && (
            <span className="hidden text-slate-500 sm:inline dark:text-slate-400">
              {email}
            </span>
          )}
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
