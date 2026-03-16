import { Building2, Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Building, CityModel, District } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

interface DistrictDetailsPanelProps {
  city: CityModel;
  district: District;
}

function landmarkCount(city: CityModel, districtId: string) {
  return city.landmarks.filter((landmark) => landmark.districtId === districtId).length;
}

function buildingCount(buildings: Building[], districtId: string) {
  return buildings.filter((building) => building.districtId === districtId).length;
}

export function DistrictDetailsPanel({ city, district }: DistrictDetailsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{district.name}</CardTitle>
        <CardDescription>{district.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {district.emotionalTags.map((tag) => (
            <Badge key={tag}>{toTitleCase(tag)}</Badge>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-slate-300">{district.symbolism}</p>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
            <p className="flex items-center gap-2 text-slate-200">
              <Building2 className="h-4 w-4 text-sky-300" />
              Structures
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {buildingCount(city.buildings, district.id)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
            <p className="flex items-center gap-2 text-slate-200">
              <Landmark className="h-4 w-4 text-amber-200" />
              Landmarks
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{landmarkCount(city, district.id)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
