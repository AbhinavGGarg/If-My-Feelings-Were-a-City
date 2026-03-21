"use client";

import { Compass, HandHeart, Sparkles, TimerReset, Wind } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { MoodSoundtrack } from "@/components/mood-soundtrack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { districtDisplayName } from "@/lib/emotion-copy";
import type { CityModel, EmotionKey } from "@/lib/types";

interface EmotionalInsightsProps {
  city: CityModel;
}

type MeditationTechnique = {
  id: string;
  title: string;
  length: string;
  bestFor: EmotionKey[];
  context: string;
  steps: string[];
};

const meditationTechniques: MeditationTechnique[] = [
  {
    id: "exhale-reset",
    title: "Exhale Reset",
    length: "2 minutes",
    bestFor: ["anxiety", "restlessness", "fear", "confusion"],
    context: "When your mind feels crowded and fast.",
    steps: [
      "Breathe in through your nose for 4 counts.",
      "Exhale slowly for 6 counts.",
      "Repeat for 6 rounds, dropping your shoulders each exhale.",
      "End by naming one thing that feels slightly easier.",
    ],
  },
  {
    id: "body-unwind",
    title: "Body Unwind Scan",
    length: "4 minutes",
    bestFor: ["burnout", "anger", "grief", "shame"],
    context: "When your body feels tense, heavy, or drained.",
    steps: [
      "Start at your jaw and forehead. Soften both.",
      "Drop attention to your neck and chest. Release any tight holding.",
      "Let your hands unclench and your belly move naturally.",
      "Finish by relaxing your legs and feet into the floor.",
    ],
  },
  {
    id: "senses-grounding",
    title: "5-4-3-2-1 Grounding",
    length: "3 minutes",
    bestFor: ["anxiety", "loneliness", "fear", "grief"],
    context: "When thoughts keep looping and you need to land in the moment.",
    steps: [
      "Name 5 things you can see.",
      "Name 4 things you can feel physically.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell, then 1 thing you can taste.",
    ],
  },
  {
    id: "focus-restore",
    title: "Single-Task Reset",
    length: "10 minutes",
    bestFor: ["ambition", "confusion", "burnout", "restlessness"],
    context: "When there is pressure to do everything at once.",
    steps: [
      "Pick one meaningful task only.",
      "Set a 10-minute timer and remove all other tabs and alerts.",
      "Work steadily without switching context.",
      "At the end, write one line: What progress happened?",
    ],
  },
];

function buildNowSuggestions(city: CityModel) {
  const dominant = city.dominantForces[0]?.emotion;
  const personalizedFirst = (() => {
    switch (dominant) {
      case "anxiety":
      case "restlessness":
        return {
          title: "Slow your pace for the next 5 minutes",
          why: "Your map is carrying high mental traffic, so slowing input can reduce overload.",
          step: "Put your phone down, breathe out longer than you breathe in, and stay with one physical anchor.",
        };
      case "burnout":
        return {
          title: "Energy floor reset",
          why: "Your city is signaling low power and stalled systems.",
          step: "Drink water, stretch for one minute, and take a short no-task break before doing anything else.",
        };
      case "loneliness":
        return {
          title: "Micro-connection now",
          why: "Sparse zones suggest you may need social warmth, not more isolation.",
          step: "Send one honest text to someone safe: 'Can we do a quick check-in today?'",
        };
      case "ambition":
        return {
          title: "Channel pressure into one lane",
          why: "Strong drive appears in your map and works best with a single clear target.",
          step: "Choose one 10-minute task that matters and complete just that.",
        };
      default:
        return {
          title: "Protect your calm signal",
          why: "Your city includes restorative zones worth reinforcing.",
          step: "Take one quiet minute, then choose one action that keeps this steadier state alive.",
        };
    }
  })();

  const fromCity = city.actionSuggestions.map((action) => ({
    title: action.title,
    why: action.why,
    step: action.step,
  }));

  return [personalizedFirst, ...fromCity].slice(0, 3);
}

function recommendedTechniqueId(city: CityModel) {
  const topEmotion = city.dominantForces[0]?.emotion;
  if (!topEmotion) {
    return meditationTechniques[0].id;
  }

  return (
    meditationTechniques.find((technique) => technique.bestFor.includes(topEmotion))?.id ??
    meditationTechniques[0].id
  );
}

export function EmotionalInsights({ city }: EmotionalInsightsProps) {
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const activeTechniqueId = selectedTechniqueId ?? recommendedTechniqueId(city);
  const selectedTechnique = meditationTechniques.find((technique) => technique.id === activeTechniqueId) ?? meditationTechniques[0];
  const nowSuggestions = useMemo(() => buildNowSuggestions(city), [city]);

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Sparkles className="h-5 w-5 text-amber-200" /> What Your City Needs Right Now
          </CardTitle>
          <CardDescription>{city.needsText}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {nowSuggestions.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-4">
              <p className="font-medium text-slate-100">{item.title}</p>
              <p className="mb-2 mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Why this appeared in your city</p>
              <p className="text-sm text-slate-300">{item.why}</p>
              <p className="mt-3 text-sm text-amber-100">A helpful next step could be: {item.step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Wind className="h-5 w-5 text-cyan-300" /> Meditation Techniques
          </CardTitle>
          <CardDescription>Simple guided techniques matched to your current city state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {meditationTechniques.map((technique) => (
              <button
                key={technique.id}
                type="button"
                onClick={() => setSelectedTechniqueId(technique.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  activeTechniqueId === technique.id
                    ? "border-cyan-300/70 bg-cyan-300/15 text-cyan-100"
                    : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-slate-100"
                }`}
              >
                {technique.title}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-100">{selectedTechnique.title}</p>
              <Badge variant="sky">{selectedTechnique.length}</Badge>
            </div>
            <p className="mb-3 text-sm text-slate-300">{selectedTechnique.context}</p>
            <div className="space-y-2">
              {selectedTechnique.steps.map((step, index) => (
                <p key={`${selectedTechnique.id}-step-${index}`} className="text-sm text-slate-200">
                  {index + 1}. {step}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Compass className="h-5 w-5 text-sky-300" /> Dominant Emotional Signals
          </CardTitle>
          <CardDescription>The strongest forces shaping your city right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {city.dominantForces.slice(0, 4).map((force) => (
            <div key={force.emotion} className="rounded-lg border border-slate-800/80 bg-slate-900/65 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{districtDisplayName(force.emotion)}</p>
                <p className="text-sm text-slate-300">{Math.round(force.score * 100)}%</p>
              </div>
              <p className="text-xs text-slate-300">{force.influence}</p>
            </div>
          ))}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/65 p-3 text-sm text-slate-200">
            <p className="mb-2 flex items-center gap-2 text-slate-100">
              <HandHeart className="h-4 w-4 text-rose-300" />
              What this suggests
            </p>
            <p>{city.summaryText}</p>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <MoodSoundtrack city={city} />
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <TimerReset className="h-5 w-5 text-emerald-300" /> Two More Gentle Activities
          </CardTitle>
          <CardDescription>Keep it light. One small action is enough.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-4">
            <p className="text-sm font-medium text-slate-100">Nature Minute</p>
            <p className="mt-2 text-sm text-slate-300">
              Step outside or look at the sky for 60 seconds. Let your eyes rest on distance and soften your breathing.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-4">
            <p className="text-sm font-medium text-slate-100">One-Line Reflection</p>
            <p className="mt-2 text-sm text-slate-300">
              Finish this sentence: &quot;Right now, what I need most is...&quot; Keep it honest and short.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
