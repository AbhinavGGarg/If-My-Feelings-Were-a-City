import { CloudRain, Lamp, Map, Spline, Trees } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CityModel } from "@/lib/types";

interface CityLegendProps {
  city: CityModel;
}

export function CityLegend({ city }: CityLegendProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-950/65 p-4">
      <p className="font-serif text-xl text-slate-50">Map Legend</p>

      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Spline className="h-4 w-4 text-sky-300" />
          <span>Road flow indicates mental load and movement pace</span>
        </div>
        <div className="flex items-center gap-2">
          <Trees className="h-4 w-4 text-emerald-300" />
          <span>Parks and plazas show restoration and connection zones</span>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-cyan-200" />
          <span>Weather reflects emotional atmosphere</span>
        </div>
        <div className="flex items-center gap-2">
          <Lamp className="h-4 w-4 text-amber-200" />
          <span>Lighting tracks hope, nostalgia, and energy levels</span>
        </div>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-violet-200" />
          <span>District color reveals dominant emotional force</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Badge variant="sky">Weather: {city.weather}</Badge>
        <Badge variant="amber">Lighting: {city.lighting}</Badge>
      </div>
    </div>
  );
}
