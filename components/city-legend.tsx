import { CloudRain, Lamp, Map, Spline } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CityModel } from "@/lib/types";

interface CityLegendProps {
  city: CityModel;
}

const weatherLabels: Record<CityModel["weather"], string> = {
  clear: "Clear",
  drizzle: "Drizzle",
  rain: "Rain",
  fog: "Fog",
  mist: "Mist",
};

const lightingLabels: Record<CityModel["lighting"], string> = {
  sunrise: "Sunrise",
  golden: "Golden Hour",
  twilight: "Twilight",
  dim: "Dim",
  night: "Night",
};

export function CityLegend({ city }: CityLegendProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/65 p-4">
      <p className="font-serif text-xl text-slate-50">Legend</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <CloudRain className="h-3.5 w-3.5 text-cyan-200" /> Weather
          </p>
          <p>{weatherLabels[city.weather]}</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Lamp className="h-3.5 w-3.5 text-amber-200" /> Lighting
          </p>
          <p>{lightingLabels[city.lighting]}</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Spline className="h-3.5 w-3.5 text-sky-300" /> Roads
          </p>
          <p>Flow + pressure</p>
        </div>

        <div className="rounded-md border border-slate-800/70 bg-slate-900/70 p-2.5 text-slate-200">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-100">
            <Map className="h-3.5 w-3.5 text-violet-200" /> District Color
          </p>
          <p>Emotion strength</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="sky">Tap districts to inspect</Badge>
        <Badge variant="amber">Hover for quick meaning</Badge>
      </div>
    </div>
  );
}
