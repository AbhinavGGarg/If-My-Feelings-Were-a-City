"use client";

import { motion } from "framer-motion";
import { Building2, CloudSun, Compass, FolderHeart, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: Compass,
    title: "Emotion Reading",
    body: "Your reflection is translated into clear emotional signals and mapped into the city.",
  },
  {
    icon: Building2,
    title: "City Builder",
    body: "Districts, roads, weather, and lighting are generated with consistent symbolic logic.",
  },
  {
    icon: FolderHeart,
    title: "Save Cities",
    body: "Create an account, save meaningful cities, and revisit them from your library.",
  },
  {
    icon: LogIn,
    title: "Login + Signup",
    body: "Simple account flow so your saved cities stay organized.",
  },
];

const frontTabs = [
  {
    name: "Build",
    description: "Answer prompts and generate your emotional city map.",
    href: "/start",
  },
  {
    name: "Saved",
    description: "Open past cities and track emotional shifts over time.",
    href: "/saved",
  },
  {
    name: "Account",
    description: "Use login and signup to keep your city library connected.",
    href: "/login",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,208,122,0.22),transparent_44%),radial-gradient(circle_at_88%_10%,rgba(96,187,255,0.16),transparent_42%),radial-gradient(circle_at_52%_84%,rgba(65,206,179,0.12),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-100">
            <Sparkles className="h-3.5 w-3.5" /> If My Feelings Were a City
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] text-slate-50 md:text-7xl">
            Turn your emotional landscape into a city you can explore.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Not therapy. Not diagnosis. A reflective experience that turns mixed feelings into map symbols and practical next steps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/start">Start your city</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/city">View latest city</Link>
            </Button>
          </div>
        </motion.div>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">Tabs</p>
          <div className="grid gap-3 md:grid-cols-3">
            {frontTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 transition-colors hover:border-slate-600"
              >
                <p className="text-lg font-medium text-slate-100">{tab.name}</p>
                <p className="mt-2 text-sm text-slate-300">{tab.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="h-full p-5">
                  <item.icon className="mb-3 h-5 w-5 text-sky-300" />
                  <p className="mb-2 font-medium text-slate-100">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
          <p className="mb-2 flex items-center gap-2 text-slate-100">
            <CloudSun className="h-5 w-5 text-amber-200" />
            City quality upgrade
          </p>
          <p className="text-sm text-slate-300">
            The city map now has stronger district focus, clearer labels, cleaner layering, and saved city support so the experience feels more demo-ready.
          </p>
        </section>
      </main>
    </div>
  );
}
