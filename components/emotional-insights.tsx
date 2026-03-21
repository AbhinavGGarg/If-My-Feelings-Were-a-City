"use client";

import { ArrowUpRight, CheckCircle2, HeartHandshake, Sparkles, Wind } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CityModel } from "@/lib/types";

interface EmotionalInsightsProps {
  city: CityModel;
}

const groundingSteps = [
  "Take one slow breath in for 4, out for 6.",
  "Name 5 things you can see around you.",
  "Relax your shoulders and unclench your jaw.",
  "Name 3 things you can feel physically.",
  "Say: I am safe enough for this moment.",
];

function buildReframe(thought: string, evidence: string, nextStep: string) {
  const cleanThought = thought.trim();
  const cleanEvidence = evidence.trim();
  const cleanStep = nextStep.trim();

  if (!cleanThought && !cleanEvidence && !cleanStep) {
    return "Your balanced response will show here once you fill a few prompts.";
  }

  const first = cleanThought
    ? `Even if "${cleanThought}" feels loud right now,`
    : "Even if things feel intense right now,";
  const second = cleanEvidence
    ? `the evidence I can hold onto is: ${cleanEvidence}.`
    : "there is still some evidence that this moment can shift.";
  const third = cleanStep
    ? `A kind next step is: ${cleanStep}.`
    : "A kind next step is one small calming action.";

  return `${first} ${second} ${third}`;
}

export function EmotionalInsights({ city }: EmotionalInsightsProps) {
  const [groundingIndex, setGroundingIndex] = useState(0);
  const [thought, setThought] = useState("");
  const [evidence, setEvidence] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [supportPerson, setSupportPerson] = useState("");
  const [boundary, setBoundary] = useState("");
  const [careAction, setCareAction] = useState("");

  const reframe = useMemo(() => buildReframe(thought, evidence, nextStep), [thought, evidence, nextStep]);
  const activeGroundingStep = groundingSteps[groundingIndex] ?? groundingSteps[0];
  const groundingComplete = groundingIndex >= groundingSteps.length - 1;

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Wind className="h-5 w-5 text-cyan-300" /> Grounding Reset
          </CardTitle>
          <CardDescription>A brief nervous-system reset you can do right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/65 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">
              Step {Math.min(groundingIndex + 1, groundingSteps.length)} of {groundingSteps.length}
            </p>
            <p className="text-sm text-slate-200">{activeGroundingStep}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setGroundingIndex((current) => Math.min(current + 1, groundingSteps.length - 1))}
              disabled={groundingComplete}
            >
              {groundingComplete ? "Completed" : "Next step"}
            </Button>
            <Button variant="outline" onClick={() => setGroundingIndex(0)}>
              Reset
            </Button>
          </div>

          {groundingComplete && (
            <p className="flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Nice work. You can return to this anytime your city feels overloaded.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <HeartHandshake className="h-5 w-5 text-rose-300" /> Thought Reframe
          </CardTitle>
          <CardDescription>A simple CBT-style check to reduce mental spirals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={thought}
            onChange={(event) => setThought(event.target.value)}
            placeholder="What thought is looping right now?"
            className="min-h-20"
          />
          <Textarea
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
            placeholder="What evidence supports a more balanced view?"
            className="min-h-20"
          />
          <Input value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="One kind next step (10-20 min)." />

          <div className="rounded-lg border border-slate-800/70 bg-slate-900/65 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Balanced response</p>
            <p className="text-sm leading-relaxed text-slate-200">{reframe}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Sparkles className="h-5 w-5 text-amber-200" /> What Your City Needs
          </CardTitle>
          <CardDescription>{city.needsText}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {city.actionSuggestions.map((action) => (
            <div key={action.id} className="rounded-xl border border-slate-800/70 bg-slate-900/65 p-4">
              <p className="font-medium text-slate-100">{action.title}</p>
              <p className="mb-2 mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Why this helps</p>
              <p className="text-sm text-slate-300">{action.why}</p>
              <p className="mt-3 flex gap-2 text-sm text-amber-100">
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" />
                <span>A helpful next step could be: {action.step}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-slate-50">Personal Support Plan</CardTitle>
          <CardDescription>Build a quick plan for the next few hours.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Who can support you</p>
            <Input value={supportPerson} onChange={(event) => setSupportPerson(event.target.value)} placeholder="Name one person" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">One boundary for today</p>
            <Input value={boundary} onChange={(event) => setBoundary(event.target.value)} placeholder="What you will protect" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">One self-care action</p>
            <Input value={careAction} onChange={(event) => setCareAction(event.target.value)} placeholder="A small calming action" />
          </div>

          <div className="md:col-span-3 flex flex-wrap gap-2 pt-1">
            {supportPerson && <Badge variant="sky">Support: {supportPerson}</Badge>}
            {boundary && <Badge>Boundary: {boundary}</Badge>}
            {careAction && <Badge variant="amber">Care action: {careAction}</Badge>}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
