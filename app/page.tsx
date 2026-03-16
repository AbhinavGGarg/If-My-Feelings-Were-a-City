"use client";

import { motion } from "framer-motion";
import { Building2, CloudSun, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: Compass,
    title: "Emotional Interpretation",
    body: "A lightweight AI layer infers mixed emotional forces from your reflection paragraph.",
  },
  {
    icon: Building2,
    title: "Deterministic City Engine",
    body: "Your emotional vector maps to districts, roads, weather, lighting, and landmarks with explainable logic.",
  },
  {
    icon: CloudSun,
    title: "Action Guidance",
    body: "You get grounded, personalized next steps your city seems to be asking for right now.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,208,122,0.26),transparent_44%),radial-gradient(circle_at_88%_10%,rgba(96,187,255,0.18),transparent_42%),radial-gradient(circle_at_52%_84%,rgba(65,206,179,0.14),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-100">
            <Sparkles className="h-3.5 w-3.5" /> If My Feelings Were a City
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] text-slate-50 md:text-7xl">
            Turn your emotional landscape into a city you can explore.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Not therapy. Not diagnosis. A poetic reflection experience that translates mixed feelings into districts,
            weather, streets, and practical next actions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/start">Start your city</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/city">View demo city</Link>
            </Button>
          </div>
        </motion.div>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
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
      </main>
    </div>
  );
}
