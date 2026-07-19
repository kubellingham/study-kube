"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";

export default function Header() {
  const { user } = useUser();

  async function handleSignOut() {
    await signOut(auth());
    window.location.assign("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Studying <span className="text-indigo-600">Kube</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user?.email && (
            <span className="hidden text-slate-500 sm:inline dark:text-slate-400">
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
