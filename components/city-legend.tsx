import { Layers, Percent, Spline, SunMoon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CityModel } from "@/lib/types";

interface CityLegendProps {
  city: CityModel;
}

export function CityLegend({ city }: CityLegendProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/65 p-4">
      <p className="font-serif text-xl text-slate-50">Legend</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Layers className="h-3.5 w-3.5 text-cyan-200" /> District Label
          </p>
          <p>Emotion category</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Percent className="h-3.5 w-3.5 text-emerald-200" /> Percent
          </p>
          <p>Emotion strength</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <SunMoon className="h-3.5 w-3.5 text-amber-200" /> Brighter Card
          </p>
          <p>Main emotion</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Spline className="h-3.5 w-3.5 text-sky-300" /> Connections
          </p>
          <p>Emotion links</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="sky">Click cards for details</Badge>
        <Badge variant="amber">Hover for quick meaning</Badge>
        <Badge>Weather: {city.weather}</Badge>
      </div>
    </div>
  );
}
