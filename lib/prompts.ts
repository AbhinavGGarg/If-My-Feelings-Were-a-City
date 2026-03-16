import type { EmotionKey, PromptAnswers } from "@/lib/types";

export interface PromptStep {
  id: keyof PromptAnswers;
  title: string;
  subtitle: string;
  placeholder?: string;
  type: "textarea" | "text" | "emotion" | "pace";
}

export const emotionOptions: Array<{ value: EmotionKey; label: string; tone: string }> = [
  { value: "anxiety", label: "Anxiety", tone: "high-alert, looping, tense" },
  { value: "hope", label: "Hope", tone: "forward-looking, open, rising" },
  { value: "loneliness", label: "Loneliness", tone: "distant, disconnected, quiet" },
  { value: "grief", label: "Grief", tone: "heavy, tender, rain-soaked" },
  { value: "love", label: "Love / Connection", tone: "warm, connected, holding" },
  { value: "ambition", label: "Ambition", tone: "driven, focused, climbing" },
  { value: "burnout", label: "Burnout", tone: "depleted, overloaded, dim" },
  { value: "nostalgia", label: "Nostalgia", tone: "reflective, preserved, wistful" },
];

export const paceOptions: Array<{ value: PromptAnswers["cityPace"]; label: string; hint: string }> = [
  { value: "slow", label: "Slow + steady", hint: "Space to breathe and process." },
  { value: "steady", label: "Balanced flow", hint: "Movement with enough room to recover." },
  { value: "fast", label: "Fast-moving", hint: "Momentum feels necessary right now." },
];

export const promptSteps: PromptStep[] = [
  {
    id: "reflection",
    title: "What has your inner weather sounded like lately?",
    subtitle:
      "Write a short paragraph. We will infer mixed emotional signals from your words.",
    placeholder:
      "Example: I keep pushing hard, but I feel scattered. I miss the ease I had before. Some days I still feel a spark of possibility.",
    type: "textarea",
  },
  {
    id: "dominantEmotion",
    title: "What emotion has been most present lately?",
    subtitle: "Pick the closest anchor emotion.",
    type: "emotion",
  },
  {
    id: "underConstruction",
    title: "What part of your life feels under construction?",
    subtitle: "Career, identity, routine, relationships, creativity, or something else.",
    placeholder: "I am rebuilding my confidence at work...",
    type: "text",
  },
  {
    id: "feelsEmpty",
    title: "What feels empty in your city right now?",
    subtitle: "Name what feels underused, disconnected, or missing.",
    placeholder: "My social energy and evenings after work...",
    type: "text",
  },
  {
    id: "feelsAlive",
    title: "What still feels alive?",
    subtitle: "What lights up, even briefly?",
    placeholder: "Morning walks and making music...",
    type: "text",
  },
  {
    id: "avoidRevisiting",
    title: "What do you avoid revisiting?",
    subtitle: "A memory, decision, place, or conversation.",
    placeholder: "I avoid opening old messages from...",
    type: "text",
  },
  {
    id: "keepsYouGoing",
    title: "What keeps you going?",
    subtitle: "A value, person, ritual, or future image.",
    placeholder: "I keep going because...",
    type: "text",
  },
  {
    id: "cityPace",
    title: "What pace does your city run at right now?",
    subtitle: "This affects transit flow and city intensity.",
    type: "pace",
  },
];

export const defaultAnswers: PromptAnswers = {
  reflection:
    "I feel stretched thin and scattered, but there is still a part of me that believes things can become clearer if I slow down and reconnect.",
  dominantEmotion: "anxiety",
  underConstruction: "My relationship with my work rhythm",
  feelsEmpty: "Unstructured time with people I care about",
  feelsAlive: "Creative ideas that arrive late at night",
  avoidRevisiting: "A conversation I keep postponing",
  keepsYouGoing: "The belief that this chapter can still become meaningful",
  cityPace: "fast",
};
