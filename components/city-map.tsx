"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { districtPlainMeaning } from "@/lib/emotion-copy";
import type { CityModel, District, EmotionKey, Landmark } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CityMapProps {
  city: CityModel;
  selectedDistrictId: string;
  dominantDistrictId: string;
  onSelectDistrict: (district: District) => void;
}

const emotionStyles: Record<
  EmotionKey,
  {
    fill: string;
    stroke: string;
    glow: string;
  }
> = {
  anxiety: { fill: "#1f5f7a", stroke: "#77d2ff", glow: "rgba(119, 210, 255, 0.26)" },
  hope: { fill: "#2d6f57", stroke: "#6ce1b8", glow: "rgba(108, 225, 184, 0.28)" },
  loneliness: { fill: "#2c395f", stroke: "#9cc0ff", glow: "rgba(156, 192, 255, 0.26)" },
  grief: { fill: "#33424f", stroke: "#9eb0be", glow: "rgba(158, 176, 190, 0.26)" },
  love: { fill: "#804b40", stroke: "#ffbe9d", glow: "rgba(255, 190, 157, 0.28)" },
  ambition: { fill: "#4b3f7d", stroke: "#c7b6ff", glow: "rgba(199, 182, 255, 0.28)" },
  burnout: { fill: "#514c41", stroke: "#d7c9a2", glow: "rgba(215, 201, 162, 0.24)" },
  nostalgia: { fill: "#6a5339", stroke: "#f1cf95", glow: "rgba(241, 207, 149, 0.26)" },
  confusion: { fill: "#33495f", stroke: "#8bc1f4", glow: "rgba(139, 193, 244, 0.26)" },
  peace: { fill: "#355f67", stroke: "#8ce0d9", glow: "rgba(140, 224, 217, 0.28)" },
  anger: { fill: "#6e3f3d", stroke: "#ffac9f", glow: "rgba(255, 172, 159, 0.26)" },
  curiosity: { fill: "#3f5c5a", stroke: "#93dbc1", glow: "rgba(147, 219, 193, 0.27)" },
  joy: { fill: "#6e5533", stroke: "#ffd38a", glow: "rgba(255, 211, 138, 0.28)" },
  fear: { fill: "#405163", stroke: "#a6c8eb", glow: "rgba(166, 200, 235, 0.26)" },
  restlessness: { fill: "#4f435e", stroke: "#c7b2df", glow: "rgba(199, 178, 223, 0.26)" },
  shame: { fill: "#554f63", stroke: "#cdc6df", glow: "rgba(205, 198, 223, 0.24)" },
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

function renderLandmark(landmark: Landmark) {
  if (landmark.kind === "park") {
    return <circle cx={landmark.x} cy={landmark.y} r={7} fill="#9ce1ba" opacity={0.62} />;
  }

  if (landmark.kind === "bridge") {
    return (
      <g opacity={0.7}>
        <path d={`M ${landmark.x - 10} ${landmark.y + 3} Q ${landmark.x} ${landmark.y - 8} ${landmark.x + 10} ${landmark.y + 3}`} stroke="#f6c9a5" strokeWidth={2} fill="none" />
        <path d={`M ${landmark.x - 10} ${landmark.y + 7} Q ${landmark.x} ${landmark.y - 4} ${landmark.x + 10} ${landmark.y + 7}`} stroke="#f6c9a5" strokeWidth={2} fill="none" opacity={0.7} />
      </g>
    );
  }

  if (landmark.kind === "crane") {
    return (
      <g opacity={0.68}>
        <line x1={landmark.x - 6} y1={landmark.y + 8} x2={landmark.x - 6} y2={landmark.y - 10} stroke="#b5ffd9" strokeWidth={2} />
        <line x1={landmark.x - 6} y1={landmark.y - 10} x2={landmark.x + 10} y2={landmark.y - 10} stroke="#b5ffd9" strokeWidth={2} />
      </g>
    );
  }

  if (landmark.kind === "station") {
    return <rect x={landmark.x - 7} y={landmark.y - 7} width={14} height={14} rx={3} fill="#c7d9e8" opacity={0.62} />;
  }

  if (landmark.kind === "plaza") {
    return <circle cx={landmark.x} cy={landmark.y} r={6} fill="#ffe0bd" opacity={0.66} />;
  }

  return (
    <polygon
      points={`${landmark.x},${landmark.y - 8} ${landmark.x + 6},${landmark.y + 6} ${landmark.x - 6},${landmark.y + 6}`}
      fill="#d7e2ea"
      opacity={0.64}
    />
  );
}

export function CityMap({ city, selectedDistrictId, dominantDistrictId, onSelectDistrict }: CityMapProps) {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  const activeDistrict = useMemo(() => {
    const activeId = hoveredDistrictId ?? selectedDistrictId;
    return city.districts.find((district) => district.id === activeId) ?? city.districts[0];
  }, [city.districts, hoveredDistrictId, selectedDistrictId]);

  const dominantDistrict = city.districts.find((district) => district.id === dominantDistrictId) ?? city.districts[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0a1118]">
      <svg viewBox="0 0 1040 620" className="h-full w-full">
        <defs>
          <radialGradient id="cityGlow" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#15293e" />
            <stop offset="65%" stopColor="#0b141f" />
            <stop offset="100%" stopColor="#070d14" />
          </radialGradient>
          <linearGradient id="sunrise" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f2b87a" stopOpacity={city.lighting === "sunrise" ? 0.28 : 0.06} />
            <stop offset="35%" stopColor="#f7d8a2" stopOpacity={city.lighting === "golden" ? 0.26 : 0.07} />
            <stop offset="100%" stopColor="#7ec4ff" stopOpacity={0.12} />
          </linearGradient>
          <filter id="districtGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="1040" height="620" fill="url(#cityGlow)" />
        <rect x="0" y="0" width="1040" height="620" fill="url(#sunrise)" />
        <g opacity={0.15}>
          <ellipse cx="180" cy="520" rx="220" ry="120" fill="#68a5d8" />
          <ellipse cx="880" cy="100" rx="180" ry="80" fill="#79b6d4" />
        </g>
        <path
          d="M -20 500 C 140 450 240 540 420 500 C 600 460 700 550 1060 470 L 1060 620 L -20 620 Z"
          fill="#2c4f6a"
          opacity={0.18}
        />

        {city.roads.map((road) => {
          const from = city.districts.find((district) => district.id === road.fromDistrictId);
          const to = city.districts.find((district) => district.id === road.toDistrictId);
          if (!from || !to) {
            return null;
          }

          return (
            <g key={road.id}>
              <path
                d={roadPath(from, to, road.curvedOffset)}
                stroke="#0d1e2f"
                strokeWidth={road.width + 2}
                fill="none"
                strokeLinecap="round"
                opacity={0.6}
              />
              <motion.path
                d={roadPath(from, to, road.curvedOffset)}
                stroke={road.isStalled ? "#7f808a" : "#9dc8ef"}
                strokeWidth={road.width - 0.6}
                strokeOpacity={0.14 + road.congestion * 0.35}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={road.isStalled ? "0" : "8 10"}
                animate={road.isStalled ? undefined : { strokeDashoffset: [0, -30] }}
                transition={road.isStalled ? undefined : { repeat: Number.POSITIVE_INFINITY, duration: 3.2, ease: "linear" }}
              />
            </g>
          );
        })}

        {city.districts.map((district) => {
          const style = emotionStyles[district.anchorEmotion];
          const selected = district.id === selectedDistrictId;
          const dominant = district.id === dominantDistrictId;

          return (
            <g
              key={district.id}
              onClick={() => onSelectDistrict(district)}
              onMouseEnter={() => setHoveredDistrictId(district.id)}
              onMouseLeave={() => setHoveredDistrictId(null)}
              className="cursor-pointer"
            >
              {dominant && (
                <rect
                  x={district.x - 6}
                  y={district.y - 6}
                  width={district.width + 12}
                  height={district.height + 12}
                  rx={30}
                  fill="none"
                  stroke={style.stroke}
                  strokeOpacity={0.42}
                  strokeWidth={1.5}
                />
              )}

              <rect
                x={district.x}
                y={district.y}
                width={district.width}
                height={district.height}
                rx={26}
                fill={style.fill}
                fillOpacity={dominant ? 0.72 : 0.34 + district.density * 0.28}
                stroke={style.stroke}
                strokeOpacity={selected ? 1 : dominant ? 0.8 : 0.46}
                strokeWidth={selected ? 3 : dominant ? 2.2 : 1.2}
                filter={selected || dominant ? "url(#districtGlow)" : undefined}
              />

              <rect
                x={district.x + 8}
                y={district.y + 8}
                width={district.width - 16}
                height={district.height - 16}
                rx={20}
                fill={style.glow}
                opacity={selected ? 0.24 : dominant ? 0.18 : 0.1}
              />

              <rect
                x={district.x + 12}
                y={district.y + 11}
                width={dominant ? 148 : 132}
                height={dominant ? 42 : 28}
                rx={8}
                fill="#08111b"
                opacity={0.5}
              />

              <text
                x={district.x + 16}
                y={district.y + 30}
                fill="#f4f7fb"
                className={cn(
                  "fill-slate-100 font-semibold tracking-wide",
                  dominant ? "text-[16px]" : "text-[14px]",
                )}
              >
                {district.name}
              </text>

              {dominant && (
                <text x={district.x + 16} y={district.y + 48} className="fill-amber-100 text-[11px] uppercase tracking-[0.18em]" opacity={0.85}>
                  Dominant Force
                </text>
              )}
            </g>
          );
        })}

        {city.buildings.map((building) => {
          const district = city.districts.find((item) => item.id === building.districtId);
          if (!district) {
            return null;
          }

          const style = emotionStyles[district.anchorEmotion];
          const selected = district.id === selectedDistrictId;
          const dominant = district.id === dominantDistrictId;
          const baseOpacity = building.type === "abandoned" ? 0.2 : 0.18 + building.intensity * 0.28;
          const opacity = selected || dominant ? baseOpacity : baseOpacity * 0.5;

          return (
            <motion.rect
              key={building.id}
              x={building.x}
              y={building.y - building.height}
              width={building.width}
              height={building.height}
              rx={2}
              fill={style.stroke}
              opacity={opacity}
              animate={building.flicker && (selected || dominant) ? { opacity: [opacity, opacity * 0.45, opacity] } : undefined}
              transition={building.flicker && (selected || dominant) ? { repeat: Number.POSITIVE_INFINITY, duration: 1.5 } : undefined}
            />
          );
        })}

        {city.landmarks.map((landmark) => {
          const district = city.districts.find((item) => item.id === landmark.districtId);
          const emphasis = district?.id === selectedDistrictId || district?.id === dominantDistrictId;

          return (
            <g key={landmark.id} opacity={emphasis ? 0.95 : 0.48}>
              {renderLandmark(landmark)}
            </g>
          );
        })}

        {(city.weather === "rain" || city.weather === "drizzle") && (
          <g opacity={city.weather === "rain" ? 0.2 : 0.12}>
            {Array.from({ length: 72 }).map((_, index) => {
              const x = (index * 113) % 1040;
              const y = (index * 41) % 620;
              return <line key={`rain-${index}`} x1={x} y1={y} x2={x - 5} y2={y + 14} stroke="#9bc4de" strokeWidth={1.2} />;
            })}
          </g>
        )}

        {(city.weather === "fog" || city.weather === "mist") && (
          <g opacity={city.weather === "fog" ? 0.22 : 0.12}>
            <ellipse cx="290" cy="140" rx="260" ry="110" fill="#cfd9e6" />
            <ellipse cx="730" cy="420" rx="320" ry="130" fill="#d8dde8" />
            <ellipse cx="470" cy="540" rx="280" ry="90" fill="#b8c5d4" />
          </g>
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "h-full w-full",
            city.lighting === "sunrise" && "bg-[radial-gradient(circle_at_20%_8%,rgba(250,203,133,0.12),transparent_52%)]",
            city.lighting === "golden" && "bg-[radial-gradient(circle_at_70%_2%,rgba(250,210,142,0.12),transparent_56%)]",
            city.lighting === "dim" && "bg-[radial-gradient(circle_at_50%_10%,rgba(130,140,155,0.1),transparent_56%)]",
          )}
        />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
        <div className="max-w-[75%] rounded-md border border-slate-700/70 bg-slate-950/75 px-3 py-2 text-xs text-slate-100">
          {districtPlainMeaning(activeDistrict.name, activeDistrict.anchorEmotion)}
        </div>
        <div className="rounded-md border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-100">
          Focus: {dominantDistrict.name}
        </div>
      </div>
    </div>
  );
}
