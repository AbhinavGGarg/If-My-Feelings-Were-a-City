import { Activity, Building2, MapPin, Route, SunMoon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CityModel } from "@/lib/types";

interface CityLegendProps {
  city: CityModel;
}

export function CityLegend({ city }: CityLegendProps) {
  const dominantEmotion = city.dominantForces[0]?.emotion ?? "mixed";

  return (
    <div className="space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/65 p-4">
      <p className="font-serif text-xl text-slate-50">Legend</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Activity className="h-3.5 w-3.5 text-cyan-200" /> District card
          </p>
          <p>Emotion zone + strength %</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Route className="h-3.5 w-3.5 text-sky-300" /> Road lines
          </p>
          <p>Emotional flow between zones</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Building2 className="h-3.5 w-3.5 text-amber-200" /> Building density
          </p>
          <p>Internal intensity in each zone</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <MapPin className="h-3.5 w-3.5 text-violet-200" /> Landmark markers
          </p>
          <p>Symbolic anchors and needs</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="amber">Dominant: {dominantEmotion}</Badge>
        <Badge>Weather: {city.weather}</Badge>
        <Badge>
          <SunMoon className="mr-1 h-3.5 w-3.5" /> Lighting: {city.lighting}
        </Badge>
      </div>

      <p className="text-xs text-slate-400">
        Tip: click any district to read why it appeared and what it suggests right now.
      </p>
    </div>
  );
}
