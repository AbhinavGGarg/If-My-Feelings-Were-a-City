"use client";

import { useMemo, useState } from "react";

import { districtPlainMeaning } from "@/lib/emotion-copy";
import type { CityModel, District, EmotionKey } from "@/lib/types";

interface CityMapProps {
  city: CityModel;
  selectedDistrictId: string;
  dominantDistrictId: string;
  onSelectDistrict: (district: District) => void;
}

const emotionStyles: Record<EmotionKey, { fill: string; stroke: string }> = {
  anxiety: { fill: "#2f6e8c", stroke: "#86d3ff" },
  hope: { fill: "#2f7a61", stroke: "#85e7be" },
  loneliness: { fill: "#35546f", stroke: "#9bc7eb" },
  grief: { fill: "#4c5b67", stroke: "#bac7d0" },
  love: { fill: "#7d5a47", stroke: "#ffc8a8" },
  ambition: { fill: "#5b4f83", stroke: "#cfbfff" },
  burnout: { fill: "#655f54", stroke: "#e3d4ae" },
  nostalgia: { fill: "#6d5b44", stroke: "#f5d7a3" },
  confusion: { fill: "#3d5469", stroke: "#a6cfee" },
  peace: { fill: "#3a6469", stroke: "#9de3db" },
  anger: { fill: "#734743", stroke: "#ffbeb4" },
  curiosity: { fill: "#456a66", stroke: "#9ce6cc" },
  joy: { fill: "#75613f", stroke: "#ffdca0" },
  fear: { fill: "#45586b", stroke: "#b8d3eb" },
  restlessness: { fill: "#605279", stroke: "#d5c3ec" },
  shame: { fill: "#5d566b", stroke: "#d8d0ea" },
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

export function CityMap({ city, selectedDistrictId, dominantDistrictId, onSelectDistrict }: CityMapProps) {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  const activeDistrict = useMemo(() => {
    const activeId = hoveredDistrictId ?? selectedDistrictId;
    return city.districts.find((district) => district.id === activeId) ?? city.districts[0];
  }, [city.districts, hoveredDistrictId, selectedDistrictId]);

  const dominantDistrict = city.districts.find((district) => district.id === dominantDistrictId) ?? city.districts[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0a121a]">
      <svg viewBox="0 0 1040 620" className="h-full w-full">
        <rect x="0" y="0" width="1040" height="620" fill="#0c1621" />

        {city.roads.slice(0, 7).map((road) => {
          const from = city.districts.find((district) => district.id === road.fromDistrictId);
          const to = city.districts.find((district) => district.id === road.toDistrictId);
          if (!from || !to) {
            return null;
          }

          return (
            <path
              key={road.id}
              d={roadPath(from, to, road.curvedOffset)}
              stroke="#7598b0"
              strokeWidth={2.5}
              strokeOpacity={0.32}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        {city.districts.map((district) => {
          const style = emotionStyles[district.anchorEmotion];
          const selected = district.id === selectedDistrictId;
          const dominant = district.id === dominantDistrictId;
          const score = Math.round(city.emotionalProfile.vector[district.anchorEmotion] * 100);

          const expansion = dominant ? 12 : 0;
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
                x={x}
                y={y}
                width={width}
                height={height}
                rx={20}
                fill={style.fill}
                fillOpacity={dominant ? 0.9 : selected ? 0.78 : 0.52}
                stroke={style.stroke}
                strokeWidth={dominant ? 3 : selected ? 2.4 : 1.2}
                strokeOpacity={dominant ? 1 : selected ? 0.9 : 0.6}
              />

              <text x={x + 16} y={y + 34} className="fill-slate-100 text-[23px] font-semibold tracking-wide">
                {district.name}
              </text>

              <text x={x + 16} y={y + 66} className="fill-slate-200 text-[17px] font-medium">
                {score}%
              </text>

              {dominant && (
                <text x={x + 16} y={y + 90} className="fill-amber-100 text-[12px] uppercase tracking-[0.16em]" opacity={0.95}>
                  Main Emotion
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
        <div className="max-w-[72%] rounded-md border border-slate-700/80 bg-slate-950/75 px-3 py-2 text-sm text-slate-100">
          {districtPlainMeaning(activeDistrict.name, activeDistrict.anchorEmotion)}
        </div>
        <div className="rounded-md border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-amber-100">
          Main: {dominantDistrict.name}
        </div>
      </div>
    </div>
  );
}
