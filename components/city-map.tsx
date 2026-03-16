"use client";

import { motion } from "framer-motion";

import type { CityModel, District, EmotionKey, Landmark } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CityMapProps {
  city: CityModel;
  selectedDistrictId: string;
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
  anxiety: { fill: "#1f5f7a", stroke: "#77d2ff", glow: "rgba(119, 210, 255, 0.32)" },
  hope: { fill: "#2d6f57", stroke: "#6ce1b8", glow: "rgba(108, 225, 184, 0.36)" },
  loneliness: { fill: "#2c395f", stroke: "#9cc0ff", glow: "rgba(156, 192, 255, 0.32)" },
  grief: { fill: "#33424f", stroke: "#9eb0be", glow: "rgba(158, 176, 190, 0.34)" },
  love: { fill: "#804b40", stroke: "#ffbe9d", glow: "rgba(255, 190, 157, 0.35)" },
  ambition: { fill: "#4b3f7d", stroke: "#c7b6ff", glow: "rgba(199, 182, 255, 0.35)" },
  burnout: { fill: "#514c41", stroke: "#d7c9a2", glow: "rgba(215, 201, 162, 0.31)" },
  nostalgia: { fill: "#6a5339", stroke: "#f1cf95", glow: "rgba(241, 207, 149, 0.34)" },
  confusion: { fill: "#33495f", stroke: "#8bc1f4", glow: "rgba(139, 193, 244, 0.32)" },
  peace: { fill: "#355f67", stroke: "#8ce0d9", glow: "rgba(140, 224, 217, 0.36)" },
  anger: { fill: "#6e3f3d", stroke: "#ffac9f", glow: "rgba(255, 172, 159, 0.34)" },
  curiosity: { fill: "#3f5c5a", stroke: "#93dbc1", glow: "rgba(147, 219, 193, 0.34)" },
  joy: { fill: "#6e5533", stroke: "#ffd38a", glow: "rgba(255, 211, 138, 0.35)" },
  fear: { fill: "#405163", stroke: "#a6c8eb", glow: "rgba(166, 200, 235, 0.32)" },
  restlessness: { fill: "#4f435e", stroke: "#c7b2df", glow: "rgba(199, 178, 223, 0.33)" },
  shame: { fill: "#554f63", stroke: "#cdc6df", glow: "rgba(205, 198, 223, 0.31)" },
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
    return <circle cx={landmark.x} cy={landmark.y} r={8} fill="#9ce1ba" opacity={0.8} />;
  }

  if (landmark.kind === "bridge") {
    return (
      <g>
        <path d={`M ${landmark.x - 10} ${landmark.y + 3} Q ${landmark.x} ${landmark.y - 8} ${landmark.x + 10} ${landmark.y + 3}`} stroke="#f6c9a5" strokeWidth={2} fill="none" />
        <path d={`M ${landmark.x - 10} ${landmark.y + 7} Q ${landmark.x} ${landmark.y - 4} ${landmark.x + 10} ${landmark.y + 7}`} stroke="#f6c9a5" strokeWidth={2} fill="none" opacity={0.7} />
      </g>
    );
  }

  if (landmark.kind === "crane") {
    return (
      <g>
        <line x1={landmark.x - 6} y1={landmark.y + 8} x2={landmark.x - 6} y2={landmark.y - 10} stroke="#b5ffd9" strokeWidth={2} />
        <line x1={landmark.x - 6} y1={landmark.y - 10} x2={landmark.x + 10} y2={landmark.y - 10} stroke="#b5ffd9" strokeWidth={2} />
      </g>
    );
  }

  if (landmark.kind === "station") {
    return <rect x={landmark.x - 8} y={landmark.y - 8} width={16} height={16} rx={3} fill="#c7d9e8" opacity={0.82} />;
  }

  if (landmark.kind === "plaza") {
    return <circle cx={landmark.x} cy={landmark.y} r={7} fill="#ffe0bd" opacity={0.88} />;
  }

  return (
    <polygon
      points={`${landmark.x},${landmark.y - 9} ${landmark.x + 7},${landmark.y + 7} ${landmark.x - 7},${landmark.y + 7}`}
      fill="#d7e2ea"
      opacity={0.85}
    />
  );
}

export function CityMap({ city, selectedDistrictId, onSelectDistrict }: CityMapProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0a1118]">
      <svg viewBox="0 0 1040 620" className="h-full w-full">
        <defs>
          <radialGradient id="cityGlow" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#19304a" />
            <stop offset="65%" stopColor="#0b141f" />
            <stop offset="100%" stopColor="#070d14" />
          </radialGradient>
          <linearGradient id="sunrise" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f2b87a" stopOpacity={city.lighting === "sunrise" ? 0.46 : 0.12} />
            <stop offset="35%" stopColor="#f7d8a2" stopOpacity={city.lighting === "golden" ? 0.44 : 0.12} />
            <stop offset="100%" stopColor="#7ec4ff" stopOpacity={0.18} />
          </linearGradient>
          <filter id="districtGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="1040" height="620" fill="url(#cityGlow)" />
        <rect x="0" y="0" width="1040" height="620" fill="url(#sunrise)" />

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
                stroke="#102233"
                strokeWidth={road.width + 3}
                fill="none"
                strokeLinecap="round"
              />
              <motion.path
                d={roadPath(from, to, road.curvedOffset)}
                stroke={road.isStalled ? "#7f808a" : "#9dc8ef"}
                strokeWidth={road.width}
                strokeOpacity={0.2 + road.congestion * 0.5}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={road.isStalled ? "0" : "8 9"}
                animate={road.isStalled ? undefined : { strokeDashoffset: [0, -34] }}
                transition={road.isStalled ? undefined : { repeat: Number.POSITIVE_INFINITY, duration: 2.6, ease: "linear" }}
              />
            </g>
          );
        })}

        {city.districts.map((district) => {
          const style = emotionStyles[district.anchorEmotion];
          const selected = district.id === selectedDistrictId;

          return (
            <g key={district.id} onClick={() => onSelectDistrict(district)} className="cursor-pointer">
              <rect
                x={district.x}
                y={district.y}
                width={district.width}
                height={district.height}
                rx={26}
                fill={style.fill}
                fillOpacity={0.4 + district.density * 0.35}
                stroke={style.stroke}
                strokeOpacity={selected ? 1 : 0.55}
                strokeWidth={selected ? 2.5 : 1.4}
                filter={selected ? "url(#districtGlow)" : undefined}
              />
              <rect
                x={district.x + 8}
                y={district.y + 8}
                width={district.width - 16}
                height={district.height - 16}
                rx={20}
                fill={style.glow}
                opacity={selected ? 0.35 : 0.16}
              />
              <text x={district.x + 16} y={district.y + 30} fill="#f4f7fb" className="fill-slate-100 text-[15px] font-semibold tracking-wide">
                {district.name}
              </text>
            </g>
          );
        })}

        {city.buildings.map((building) => {
          const district = city.districts.find((item) => item.id === building.districtId);
          if (!district) {
            return null;
          }

          const style = emotionStyles[district.anchorEmotion];
          const opacity = building.type === "abandoned" ? 0.33 : 0.45 + building.intensity * 0.45;

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
              animate={building.flicker ? { opacity: [opacity, opacity * 0.4, opacity] } : undefined}
              transition={building.flicker ? { repeat: Number.POSITIVE_INFINITY, duration: 1.3 } : undefined}
            />
          );
        })}

        {city.landmarks.map((landmark) => (
          <g key={landmark.id}>{renderLandmark(landmark)}</g>
        ))}

        {(city.weather === "rain" || city.weather === "drizzle") && (
          <g opacity={city.weather === "rain" ? 0.34 : 0.2}>
            {Array.from({ length: 120 }).map((_, index) => {
              const x = (index * 91) % 1040;
              const y = (index * 37) % 620;
              return <line key={`rain-${index}`} x1={x} y1={y} x2={x - 5} y2={y + 14} stroke="#9bc4de" strokeWidth={1.4} />;
            })}
          </g>
        )}

        {(city.weather === "fog" || city.weather === "mist") && (
          <g opacity={city.weather === "fog" ? 0.38 : 0.22}>
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
            city.lighting === "sunrise" && "bg-[radial-gradient(circle_at_20%_8%,rgba(250,203,133,0.18),transparent_48%)]",
            city.lighting === "golden" && "bg-[radial-gradient(circle_at_70%_2%,rgba(250,210,142,0.2),transparent_52%)]",
            city.lighting === "dim" && "bg-[radial-gradient(circle_at_50%_10%,rgba(130,140,155,0.14),transparent_50%)]",
          )}
        />
      </div>
    </div>
  );
}
