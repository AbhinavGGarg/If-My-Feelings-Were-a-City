"use client";

import { useMemo, useState } from "react";

import { districtDisplayName, districtPlainMeaning } from "@/lib/emotion-copy";
import type { CityModel, District, EmotionKey, Landmark, LightingState, WeatherState } from "@/lib/types";

interface CityMapProps {
  city: CityModel;
  selectedDistrictId: string;
  dominantDistrictId: string;
  onSelectDistrict: (district: District) => void;
}

const emotionStyles: Record<EmotionKey, { fill: string; stroke: string; tint: string }> = {
  anxiety: { fill: "#2f6e8c", stroke: "#86d3ff", tint: "#6ec7ff" },
  hope: { fill: "#2f7a61", stroke: "#85e7be", tint: "#9aefca" },
  loneliness: { fill: "#35546f", stroke: "#9bc7eb", tint: "#aacdec" },
  grief: { fill: "#4c5b67", stroke: "#bac7d0", tint: "#cfd7de" },
  love: { fill: "#7d5a47", stroke: "#ffc8a8", tint: "#ffd7bd" },
  ambition: { fill: "#5b4f83", stroke: "#cfbfff", tint: "#dbcfff" },
  burnout: { fill: "#655f54", stroke: "#e3d4ae", tint: "#eadfc1" },
  nostalgia: { fill: "#6d5b44", stroke: "#f5d7a3", tint: "#f6e0b7" },
  confusion: { fill: "#3d5469", stroke: "#a6cfee", tint: "#b8d9f0" },
  peace: { fill: "#3a6469", stroke: "#9de3db", tint: "#b5eae4" },
  anger: { fill: "#734743", stroke: "#ffbeb4", tint: "#ffd0c9" },
  curiosity: { fill: "#456a66", stroke: "#9ce6cc", tint: "#b8edd9" },
  joy: { fill: "#75613f", stroke: "#ffdca0", tint: "#ffe7bf" },
  fear: { fill: "#45586b", stroke: "#b8d3eb", tint: "#c9def0" },
  restlessness: { fill: "#605279", stroke: "#d5c3ec", tint: "#e1d5f1" },
  shame: { fill: "#5d566b", stroke: "#d8d0ea", tint: "#e3ddf0" },
};

function districtCenter(district: District) {
  return {
    x: district.x + district.width / 2,
    y: district.y + district.height / 2,
  };
}

function roadPath(from: District, to: District, curvedOffset: number) {
  const start = districtCenter(from);
  const end = districtCenter(to);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} Q ${midX} ${midY + curvedOffset} ${end.x} ${end.y}`;
}

function renderWeatherOverlay(weather: WeatherState) {
  if (weather === "clear") {
    return null;
  }

  if (weather === "fog" || weather === "mist" || weather === "drizzle") {
    return (
      <g pointerEvents="none">
        <rect x="0" y="0" width="1040" height="620" fill="#bfd4e5" fillOpacity={weather === "fog" ? 0.07 : weather === "mist" ? 0.05 : 0.03} />
        <ellipse cx="220" cy="120" rx="210" ry="90" fill="#c7d8e4" fillOpacity={weather === "fog" ? 0.06 : 0.035} />
        <ellipse cx="810" cy="160" rx="240" ry="120" fill="#d2dfe8" fillOpacity={weather === "fog" ? 0.05 : 0.03} />
        <ellipse cx="520" cy="540" rx="320" ry="110" fill="#d2dce7" fillOpacity={weather === "fog" ? 0.045 : 0.025} />
      </g>
    );
  }

  const streakCount = 18;
  const strokeOpacity = 0.12;
  return (
    <g pointerEvents="none">
      {Array.from({ length: streakCount }).map((_, index) => {
        const x = ((index * 97) % 1040) + 8;
        const y = (index * 37) % 620;
        const len = 14 + (index % 3) * 3;
        return (
          <line
            key={`weather-${index}`}
            x1={x}
            y1={y}
            x2={x - 6}
            y2={y + len}
            stroke="#b8d6eb"
            strokeOpacity={strokeOpacity}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function lightingTint(lighting: LightingState) {
  switch (lighting) {
    case "sunrise":
      return "radial-gradient(circle at 16% 8%, rgba(255,210,148,0.17), transparent 40%)";
    case "golden":
      return "radial-gradient(circle at 76% 12%, rgba(255,204,136,0.13), transparent 42%)";
    case "twilight":
      return "radial-gradient(circle at 18% 10%, rgba(190,170,240,0.12), transparent 40%)";
    case "dim":
      return "radial-gradient(circle at 80% 16%, rgba(120,135,152,0.12), transparent 42%)";
    case "night":
      return "radial-gradient(circle at 80% 16%, rgba(128,148,192,0.08), transparent 42%)";
    default:
      return "radial-gradient(circle at 50% 0%, rgba(140,160,184,0.08), transparent 40%)";
  }
}

function landmarkGlyph(kind: Landmark["kind"]) {
  switch (kind) {
    case "bridge":
      return "B";
    case "park":
      return "P";
    case "station":
      return "S";
    case "monument":
      return "M";
    case "plaza":
      return "C";
    case "crane":
      return "R";
    default:
      return "L";
  }
}

export function CityMap({ city, selectedDistrictId, dominantDistrictId, onSelectDistrict }: CityMapProps) {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  const activeDistrict = useMemo(() => {
    const activeId = hoveredDistrictId ?? selectedDistrictId;
    return city.districts.find((district) => district.id === activeId) ?? city.districts[0];
  }, [city.districts, hoveredDistrictId, selectedDistrictId]);

  const dominantDistrict = city.districts.find((district) => district.id === dominantDistrictId) ?? city.districts[0];
  const dominantDistrictLabel = districtDisplayName(dominantDistrict.anchorEmotion);

  const buildingDensityByDistrict = useMemo(() => {
    const byDistrict = new Map<string, number>();
    for (const district of city.districts) {
      byDistrict.set(district.id, 0);
    }
    for (const building of city.buildings) {
      byDistrict.set(building.districtId, (byDistrict.get(building.districtId) ?? 0) + 1);
    }
    return byDistrict;
  }, [city.buildings, city.districts]);

  const maxBuildingCount = useMemo(
    () =>
      Math.max(
        1,
        ...city.districts.map((district) => buildingDensityByDistrict.get(district.id) ?? 0),
      ),
    [buildingDensityByDistrict, city.districts],
  );

  const districtsOrdered = useMemo(() => {
    return [...city.districts].sort((a, b) => {
      if (a.id === selectedDistrictId) {
        return 1;
      }
      if (b.id === selectedDistrictId) {
        return -1;
      }
      if (a.id === dominantDistrictId) {
        return 1;
      }
      if (b.id === dominantDistrictId) {
        return -1;
      }
      return a.id.localeCompare(b.id);
    });
  }, [city.districts, dominantDistrictId, selectedDistrictId]);

  const visibleRoads = useMemo(
    () =>
      [...city.roads]
        .sort((a, b) => b.congestion + b.width * 0.05 - (a.congestion + a.width * 0.05))
        .slice(0, 6),
    [city.roads],
  );

  const lightingLayer = lightingTint(city.lighting);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#09121b] shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 opacity-85" style={{ backgroundImage: lightingLayer }} />
      <svg viewBox="0 0 1040 620" className="h-full w-full">
        <defs>
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#35506a" strokeOpacity="0.1" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1040" height="620" fill="#0a1623" />
        <rect x="0" y="0" width="1040" height="620" fill="url(#city-grid)" />

        {renderWeatherOverlay(city.weather)}

        {visibleRoads.map((road) => {
          const from = city.districts.find((district) => district.id === road.fromDistrictId);
          const to = city.districts.find((district) => district.id === road.toDistrictId);
          if (!from || !to) {
            return null;
          }

          const d = roadPath(from, to, road.curvedOffset);
          const activeLink = road.fromDistrictId === activeDistrict.id || road.toDistrictId === activeDistrict.id;
          const glowWidth = Math.max(road.width * (activeLink ? 0.68 : 0.52), 3.2);
          const mainWidth = Math.max(road.width * (activeLink ? 0.46 : 0.34), 2.1);
          const stalled = road.isStalled;
          const tint = stalled ? "#c6d1dc" : "#8cc4ea";
          const tintOpacity = activeLink ? 0.3 + road.congestion * 0.33 : 0.14 + road.congestion * 0.2;

          return (
            <g key={road.id}>
              <path d={d} stroke="#1f3749" strokeWidth={glowWidth} strokeOpacity={activeLink ? 0.5 : 0.34} fill="none" strokeLinecap="round" />
              <path
                d={d}
                stroke={tint}
                strokeWidth={mainWidth}
                strokeOpacity={tintOpacity}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={stalled ? "6 7" : undefined}
              />
            </g>
          );
        })}

        {districtsOrdered.map((district) => {
          const style = emotionStyles[district.anchorEmotion];
          const selected = district.id === selectedDistrictId;
          const dominant = district.id === dominantDistrictId;
          const hovered = district.id === hoveredDistrictId;
          const score = Math.round(city.emotionalProfile.vector[district.anchorEmotion] * 100);
          const buildingCount = buildingDensityByDistrict.get(district.id) ?? 0;
          const densityPercent = Math.round((buildingCount / maxBuildingCount) * 100);
          const districtLabel = districtDisplayName(district.anchorEmotion);

          const expansion = dominant ? 18 : selected ? 10 : hovered ? 6 : 0;
          const x = district.x - expansion / 2;
          const y = district.y - expansion / 2;
          const width = district.width + expansion;
          const height = district.height + expansion;

          return (
            <g
              key={district.id}
              onClick={() => onSelectDistrict(district)}
              onMouseEnter={() => setHoveredDistrictId(district.id)}
              onMouseLeave={() => setHoveredDistrictId(null)}
              className="cursor-pointer"
            >
              <rect
                x={x - 4}
                y={y - 4}
                width={width + 8}
                height={height + 8}
                rx={24}
                fill={style.tint}
                fillOpacity={dominant ? 0.28 : selected || hovered ? 0.14 : 0}
              />

              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={22}
                fill={style.fill}
                fillOpacity={dominant ? 0.88 : selected || hovered ? 0.76 : 0.48}
                stroke={style.stroke}
                strokeWidth={dominant ? 3.2 : selected || hovered ? 2.3 : 1.3}
                strokeOpacity={dominant ? 1 : selected || hovered ? 0.88 : 0.54}
              />

              <rect x={x + 10} y={y + 10} width={width - 20} height={34} rx={9} fill="#111c28" fillOpacity={0.66} />

              <text x={x + 20} y={y + 33} className="fill-slate-50 text-[22px] font-semibold tracking-wide">
                {districtLabel}
              </text>

              <text x={x + 20} y={y + 63} className="fill-slate-200 text-[16px] font-medium">
                {score}%
              </text>

              {dominant && (
                <text x={x + 20} y={y + 84} className="fill-amber-100 text-[12px] uppercase tracking-[0.15em]" opacity={0.95}>
                  Dominant
                </text>
              )}

              <text x={x + 20} y={y + height - 28} className="fill-slate-200 text-[12px] uppercase tracking-[0.12em]" opacity={0.9}>
                Urban density
              </text>

              <rect x={x + 20} y={y + height - 18} width={width - 40} height={6} rx={3} fill="#10202f" fillOpacity={0.72} />
              <rect
                x={x + 20}
                y={y + height - 18}
                width={(width - 40) * (densityPercent / 100)}
                height={6}
                rx={3}
                fill={style.stroke}
                fillOpacity={0.9}
              />
            </g>
          );
        })}

        {city.landmarks.map((landmark) => {
          const district = city.districts.find((item) => item.id === landmark.districtId);
          const color = district ? emotionStyles[district.anchorEmotion].stroke : "#a9c8de";
          const isActive = landmark.districtId === activeDistrict.id;
          return (
            <g key={landmark.id} pointerEvents="none">
              <circle cx={landmark.x} cy={landmark.y} r={isActive ? 10 : 8.5} fill="#0a1521" stroke={color} strokeWidth={2} strokeOpacity={0.92} />
              <text x={landmark.x} y={landmark.y + 4} textAnchor="middle" className="fill-slate-100 text-[10px] font-semibold">
                {landmarkGlyph(landmark.kind)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <div className="max-w-[74%] space-y-1 rounded-md border border-slate-700/80 bg-slate-950/78 px-3 py-2.5 text-sm text-slate-100">
          <p>{districtPlainMeaning(districtDisplayName(activeDistrict.anchorEmotion), activeDistrict.anchorEmotion)}</p>
          <p className="text-xs text-slate-300">{activeDistrict.description}</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Hover or click a district to inspect it.</p>
        </div>
        <div className="space-y-1">
          <div className="rounded-md border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-amber-100">
            Main: {dominantDistrictLabel}
          </div>
          <div className="rounded-md border border-slate-700/70 bg-slate-950/70 px-2.5 py-1 text-xs text-slate-200">
            {city.weather} • {city.lighting}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-4 rounded-md border border-slate-700/70 bg-slate-950/76 px-3 py-1.5 text-xs text-slate-300">
        {city.districts.length} districts • {visibleRoads.length} active links • {city.landmarks.length} landmarks
      </div>
    </div>
  );
}
