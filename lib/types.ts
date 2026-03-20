export const emotionKeys = [
  "anxiety",
  "hope",
  "loneliness",
  "grief",
  "love",
  "ambition",
  "burnout",
  "nostalgia",
  "confusion",
  "peace",
  "anger",
  "curiosity",
  "joy",
  "fear",
  "restlessness",
  "shame",
] as const;

export type EmotionKey = (typeof emotionKeys)[number];

export type EmotionVector = Record<EmotionKey, number>;

export interface PromptAnswers {
  reflection: string;
  dominantEmotion: EmotionKey;
  underConstruction: string;
  feelsEmpty: string;
  feelsAlive: string;
  avoidRevisiting: string;
  keepsYouGoing: string;
  cityPace: "slow" | "steady" | "fast";
}

export type PromptDraftAnswers = Omit<PromptAnswers, "dominantEmotion" | "cityPace"> & {
  dominantEmotion: PromptAnswers["dominantEmotion"] | "";
  cityPace: PromptAnswers["cityPace"] | "";
};

export interface PromptDraftState {
  step: number;
  answers: PromptDraftAnswers;
  updatedAt: string;
}

export interface EmotionalProfile {
  vector: EmotionVector;
  dominantEmotions: Array<{
    emotion: EmotionKey;
    score: number;
  }>;
  interpretation: string;
  emotionalNeeds: string[];
}

export type WeatherState = "clear" | "drizzle" | "rain" | "fog" | "mist";

export type LightingState = "sunrise" | "golden" | "twilight" | "dim" | "night";

export interface District {
  id: string;
  name: string;
  anchorEmotion: EmotionKey;
  emotionalTags: EmotionKey[];
  x: number;
  y: number;
  width: number;
  height: number;
  density: number;
  description: string;
  symbolism: string;
}

export interface Building {
  id: string;
  districtId: string;
  type:
    | "home"
    | "tower"
    | "station"
    | "factory"
    | "cultural"
    | "abandoned"
    | "park"
    | "memorial"
    | "construction";
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  flicker: boolean;
}

export interface Road {
  id: string;
  fromDistrictId: string;
  toDistrictId: string;
  width: number;
  congestion: number;
  curvedOffset: number;
  isStalled: boolean;
}

export interface Landmark {
  id: string;
  districtId: string;
  name: string;
  meaning: string;
  x: number;
  y: number;
  kind: "bridge" | "park" | "station" | "monument" | "plaza" | "crane";
}

export interface ActionSuggestion {
  id: string;
  title: string;
  why: string;
  step: string;
}

export interface CityModel {
  id: string;
  title: string;
  generatedAt: string;
  answers: PromptAnswers;
  emotionalProfile: EmotionalProfile;
  districts: District[];
  buildings: Building[];
  roads: Road[];
  landmarks: Landmark[];
  weather: WeatherState;
  lighting: LightingState;
  summaryText: string;
  dominantForces: Array<{
    emotion: EmotionKey;
    score: number;
    influence: string;
  }>;
  needsText: string;
  actionSuggestions: ActionSuggestion[];
}
