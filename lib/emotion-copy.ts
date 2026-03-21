import type { EmotionKey } from "@/lib/types";

export const canonicalDistrictLabels: Record<EmotionKey, string> = {
  anxiety: "Anxiety",
  hope: "Growth",
  loneliness: "Social",
  grief: "Heavy",
  love: "Social",
  ambition: "Focus",
  burnout: "Overload",
  nostalgia: "Memory",
  confusion: "Unclear",
  peace: "Calm",
  anger: "Tension",
  curiosity: "Curiosity",
  joy: "Joy",
  fear: "Fear",
  restlessness: "Restless",
  shame: "Self-Doubt",
};

export const plainEmotionMeaning: Record<EmotionKey, string> = {
  anxiety: "feeling mentally crowded and overwhelmed",
  hope: "seeing possibility and wanting forward motion",
  loneliness: "feeling emotionally distant or cut off",
  grief: "carrying loss, heaviness, or tenderness",
  love: "feeling connection, care, and belonging",
  ambition: "wanting growth, progress, and momentum",
  burnout: "running low on energy and emotional power",
  nostalgia: "holding onto meaningful memories from before",
  confusion: "feeling uncertain and split across directions",
  peace: "needing calm, stability, and quiet space",
  anger: "holding pressure, frustration, or resentment",
  curiosity: "wanting to explore and understand something new",
  joy: "feeling light, energized, or genuinely alive",
  fear: "feeling cautious, guarded, or unsafe",
  restlessness: "feeling unsettled and unable to fully land",
  shame: "withdrawing because things feel exposed or heavy",
};

export function districtDisplayName(emotion: EmotionKey) {
  return canonicalDistrictLabels[emotion];
}

export function districtPlainMeaning(name: string, emotion: EmotionKey) {
  return `${name} = ${plainEmotionMeaning[emotion]}.`;
}
