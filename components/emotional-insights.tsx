import { ArrowUpRight, Compass, Heart, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CityModel } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

interface EmotionalInsightsProps {
  city: CityModel;
}

export function EmotionalInsights({ city }: EmotionalInsightsProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Heart className="h-5 w-5 text-rose-300" /> Emotional Summary
          </CardTitle>
          <CardDescription>Plain-language readout of what your city is reflecting right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/65 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">What your map is showing</p>
            <p>{city.summaryText}</p>
          </div>

          <div className="rounded-lg border border-slate-800/70 bg-slate-900/65 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">What this suggests</p>
            <p>{city.emotionalProfile.interpretation}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Compass className="h-5 w-5 text-cyan-300" /> Dominant Forces in Your City
          </CardTitle>
          <CardDescription>The strongest emotional patterns shaping your map.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {city.dominantForces.map((force) => (
            <div key={force.emotion} className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="sky">{toTitleCase(force.emotion)}</Badge>
                <span className="text-xs text-slate-400">{Math.round(force.score * 100)}%</span>
              </div>
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Why this appeared in your city</p>
              <p className="text-sm text-slate-300">{force.influence}</p>
            </div>
          ))}
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
              <p className="mb-2 mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">What this suggests</p>
              <p className="text-sm text-slate-300">{action.why}</p>
              <p className="mt-3 flex gap-2 text-sm text-amber-100">
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" />
                <span>A helpful next step could be: {action.step}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
