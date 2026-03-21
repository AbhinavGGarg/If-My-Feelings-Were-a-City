"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadLocalSession, logoutLocalSession } from "@/lib/storage";
import type { LocalSession } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/start", label: "Build" },
  { href: "/city", label: "City" },
  { href: "/voice-reset", label: "Voice Reset" },
  { href: "/saved", label: "Saved" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSession(loadLocalSession());
    });

    const onStorage = () => {
      setSession(loadLocalSession());
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#050b12]/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="font-serif text-xl text-slate-100">
          If My Feelings Were a City
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 p-1.5">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sky-400/20 text-sky-100"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <p className="hidden text-sm text-slate-300 md:block">Hi, {session.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  logoutLocalSession();
                  setSession(null);
                  router.push("/");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
