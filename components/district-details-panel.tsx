import { Gauge, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { districtDisplayName, districtPlainMeaning } from "@/lib/emotion-copy";
import type { CityModel, District } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

interface DistrictDetailsPanelProps {
  city: CityModel;
  district: District;
  isDominant: boolean;
}

export function DistrictDetailsPanel({ city, district, isDominant }: DistrictDetailsPanelProps) {
  const strength = Math.round(city.emotionalProfile.vector[district.anchorEmotion] * 100);
  const districtLabel = districtDisplayName(district.anchorEmotion);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{districtLabel}</CardTitle>
          {isDominant ? <Badge variant="amber">Most dominant district</Badge> : <Badge>Selected district</Badge>}
        </div>
        <CardDescription>{districtPlainMeaning(districtLabel, district.anchorEmotion)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">Why this appeared in your city</p>
          <p className="text-sm leading-relaxed text-slate-300">{district.description}</p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">What this suggests</p>
          <p className="text-sm leading-relaxed text-slate-300">{district.symbolism}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {district.emotionalTags.map((tag) => (
            <Badge key={tag}>{toTitleCase(tag)}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
            <p className="flex items-center gap-2 text-slate-200">
              <Gauge className="h-4 w-4 text-sky-300" />
              Emotion Strength
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {strength}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
            <p className="flex items-center gap-2 text-slate-200">
              <Layers className="h-4 w-4 text-amber-200" />
              District Role
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{isDominant ? "Main" : "Support"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
