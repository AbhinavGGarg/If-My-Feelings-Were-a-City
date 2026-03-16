import { clamp, round, toTitleCase } from "@/lib/utils";
import {
  emotionKeys,
  type EmotionalProfile,
  type EmotionKey,
  type EmotionVector,
  type PromptAnswers,
} from "@/lib/types";

const tokenLexicon: Record<EmotionKey, string[]> = {
  anxiety: [
    "anxious",
    "worried",
    "panic",
    "tense",
    "overthink",
    "pressure",
    "nervous",
    "spiral",
    "racing",
    "uncertain",
  ],
  hope: [
    "hope",
    "optimistic",
    "possibility",
    "future",
    "light",
    "healing",
    "better",
    "rise",
    "tomorrow",
    "rebuild",
  ],
  loneliness: [
    "alone",
    "isolated",
    "distant",
    "disconnected",
    "empty",
    "unseen",
    "quiet",
    "apart",
    "withdrawn",
    "missing",
  ],
  grief: [
    "grief",
    "loss",
    "mourning",
    "heavy",
    "sad",
    "hurt",
    "ache",
    "goodbye",
    "absence",
    "broken",
  ],
  love: [
    "love",
    "care",
    "connection",
    "together",
    "support",
    "family",
    "friend",
    "belong",
    "kind",
    "warm",
  ],
  ambition: [
    "ambitious",
    "driven",
    "goal",
    "build",
    "grow",
    "achieve",
    "focus",
    "progress",
    "level",
    "discipline",
  ],
  burnout: [
    "burnout",
    "drained",
    "exhausted",
    "numb",
    "depleted",
    "overwhelmed",
    "fatigue",
    "empty",
    "fried",
    "shutdown",
  ],
  nostalgia: [
    "nostalgia",
    "remember",
    "old",
    "past",
    "childhood",
    "used",
    "before",
    "memory",
    "familiar",
    "once",
  ],
  confusion: [
    "confused",
    "unclear",
    "foggy",
    "mixed",
    "stuck",
    "lost",
    "unsure",
    "messy",
    "chaotic",
    "conflict",
  ],
  peace: [
    "peace",
    "calm",
    "still",
    "grounded",
    "steady",
    "soft",
    "quietly",
    "settled",
    "restful",
    "ease",
  ],
  anger: ["angry", "frustrated", "mad", "irritated", "resent", "rage", "fury", "annoyed"],
  curiosity: [
    "curious",
    "explore",
    "wonder",
    "question",
    "learn",
    "discover",
    "experiment",
    "new",
    "interest",
    "open",
  ],
  joy: ["joy", "happy", "delight", "smile", "grateful", "alive", "bright", "celebrate"],
  fear: ["fear", "afraid", "scared", "threat", "unsafe", "worry", "avoid", "hesitant"],
  restlessness: [
    "restless",
    "agitated",
    "uneasy",
    "fidget",
    "impatient",
    "can\'t sit",
    "urgent",
    "wired",
  ],
  shame: ["shame", "guilt", "embarrassed", "regret", "not enough", "small", "blame", "ashamed"],
};

const phraseLexicon: Record<EmotionKey, Array<{ phrase: string; weight: number }>> = {
  anxiety: [
    { phrase: "can\'t stop thinking", weight: 1.1 },
    { phrase: "on edge", weight: 0.9 },
    { phrase: "tight chest", weight: 1 },
  ],
  hope: [
    { phrase: "turning point", weight: 1 },
    { phrase: "starting to believe", weight: 1.1 },
    { phrase: "small win", weight: 0.85 },
  ],
  loneliness: [
    { phrase: "feel invisible", weight: 1 },
    { phrase: "far from everyone", weight: 1.1 },
  ],
  grief: [
    { phrase: "miss them", weight: 1.2 },
    { phrase: "still hurts", weight: 1 },
    { phrase: "not over it", weight: 0.95 },
  ],
  love: [
    { phrase: "held by", weight: 0.9 },
    { phrase: "feel supported", weight: 1 },
    { phrase: "care deeply", weight: 0.95 },
  ],
  ambition: [
    { phrase: "want to build", weight: 1.1 },
    { phrase: "push forward", weight: 0.9 },
  ],
  burnout: [
    { phrase: "running on empty", weight: 1.25 },
    { phrase: "too tired", weight: 1.1 },
    { phrase: "nothing left", weight: 1.1 },
  ],
  nostalgia: [
    { phrase: "used to", weight: 0.95 },
    { phrase: "back then", weight: 1 },
    { phrase: "old version of me", weight: 1.1 },
  ],
  confusion: [
    { phrase: "don\'t know", weight: 0.8 },
    { phrase: "all over the place", weight: 1.1 },
  ],
  peace: [
    { phrase: "at ease", weight: 1.1 },
    { phrase: "finally calm", weight: 1.2 },
  ],
  anger: [{ phrase: "fed up", weight: 1.1 }, { phrase: "so unfair", weight: 1 }],
  curiosity: [{ phrase: "want to understand", weight: 1.1 }, { phrase: "what if", weight: 0.9 }],
  joy: [{ phrase: "felt alive", weight: 1.1 }, { phrase: "grateful for", weight: 0.9 }],
  fear: [{ phrase: "afraid of", weight: 1.1 }, { phrase: "too risky", weight: 1 }],
  restlessness: [{ phrase: "can\'t settle", weight: 1.2 }, { phrase: "need movement", weight: 0.85 }],
  shame: [{ phrase: "not enough", weight: 1.1 }, { phrase: "hard to admit", weight: 0.9 }],
};

const forceNarratives: Record<EmotionKey, string> = {
  anxiety: "Traffic systems are overloaded, with narrow routes and signal flicker.",
  hope: "Morning light breaks through with parks, cranes, and widening boulevards.",
  loneliness: "Districts feel sparse and separated by long, quiet transit lines.",
  grief: "Rain settles in around memorial spaces and quieter streets.",
  love: "Bridges and plazas keep neighborhoods emotionally connected.",
  ambition: "Vertical growth appears through towers, stations, and active build zones.",
  burnout: "Power drops, stalled movement, and unfinished structures indicate depletion.",
  nostalgia: "An old town core preserves familiar architecture and warm lamp light.",
  confusion: "Wayfinding is hazy and route logic feels inconsistent.",
  peace: "Open breathing space and slower streets restore a grounded rhythm.",
  anger: "Pressure spikes at intersections and infrastructure feels reactive.",
  curiosity: "Exploration corridors and civic labs invite experimentation.",
  joy: "Color and movement gather where energy still feels alive.",
  fear: "Defensive routes and avoidance zones shape movement patterns.",
  restlessness: "Transit pulses quickly with frequent directional shifts.",
  shame: "Underlit blocks and hidden courtyards suggest protective retreat.",
};

function zeroVector(): EmotionVector {
  return emotionKeys.reduce((acc, emotion) => {
    acc[emotion] = 0;
    return acc;
  }, {} as EmotionVector);
}

function scoreText(text: string): EmotionVector {
  const vector = zeroVector();
  const normalized = text.toLowerCase();
  const words = normalized.match(/[a-z']+/g) ?? [];

  for (const emotion of emotionKeys) {
    const tokenSet = tokenLexicon[emotion];
    const phraseSet = phraseLexicon[emotion];

    words.forEach((word) => {
      if (tokenSet.some((token) => token === word || (token.includes(" ") && word.includes(token)))) {
        vector[emotion] += 0.14;
      }
    });

    phraseSet.forEach(({ phrase, weight }) => {
      if (normalized.includes(phrase)) {
        vector[emotion] += weight;
      }
    });
  }

  if (normalized.includes("!")) {
    vector.restlessness += 0.2;
    vector.hope += 0.1;
  }

  if (normalized.includes("?")) {
    vector.confusion += 0.25;
    vector.curiosity += 0.15;
  }

  return vector;
}

function normalizeVector(vector: EmotionVector): EmotionVector {
  const sum = emotionKeys.reduce((acc, key) => acc + vector[key], 0);
  if (sum <= 0) {
    return emotionKeys.reduce((acc, emotion) => {
      acc[emotion] = 0.05;
      return acc;
    }, {} as EmotionVector);
  }

  const max = Math.max(...emotionKeys.map((key) => vector[key]));

  return emotionKeys.reduce((acc, key) => {
    const normalized = max > 0 ? vector[key] / max : 0;
    const dampened = 0.7 * normalized + 0.3 * (vector[key] / sum);
    acc[key] = round(clamp(dampened, 0, 1));
    return acc;
  }, {} as EmotionVector);
}

function mergeVectors(
  primary: EmotionVector,
  secondary: EmotionVector,
  primaryWeight: number,
  secondaryWeight: number,
): EmotionVector {
  return emotionKeys.reduce((acc, key) => {
    acc[key] = primary[key] * primaryWeight + secondary[key] * secondaryWeight;
    return acc;
  }, {} as EmotionVector);
}

function derivePromptSignals(answers: PromptAnswers): EmotionVector {
  const signal = zeroVector();

  signal[answers.dominantEmotion] += 1.3;

  if (answers.cityPace === "fast") {
    signal.anxiety += 0.4;
    signal.restlessness += 0.45;
    signal.ambition += 0.35;
  }

  if (answers.cityPace === "slow") {
    signal.peace += 0.5;
    signal.hope += 0.2;
    signal.burnout += 0.2;
  }

  if (answers.cityPace === "steady") {
    signal.peace += 0.25;
    signal.ambition += 0.2;
  }

  const constructionSignal = scoreText(answers.underConstruction);
  const emptySignal = scoreText(answers.feelsEmpty);
  const aliveSignal = scoreText(answers.feelsAlive);
  const avoidSignal = scoreText(answers.avoidRevisiting);
  const keepsSignal = scoreText(answers.keepsYouGoing);

  emotionKeys.forEach((key) => {
    signal[key] += constructionSignal[key] * 0.4;
    signal[key] += emptySignal[key] * 0.55;
    signal[key] += aliveSignal[key] * 0.55;
    signal[key] += avoidSignal[key] * 0.45;
    signal[key] += keepsSignal[key] * 0.5;
  });

  signal.loneliness += answers.feelsEmpty.length > 40 ? 0.15 : 0;
  signal.hope += answers.keepsYouGoing.length > 40 ? 0.15 : 0;

  return signal;
}

function buildInterpretation(dominant: Array<{ emotion: EmotionKey; score: number }>): string {
  const [first, second, third] = dominant;

  if (!first || !second) {
    return "Your city holds a gentle mix of signals with no single force dominating the skyline.";
  }

  const thirdLine = third
    ? `A third pull from ${toTitleCase(third.emotion)} adds texture to how your inner city moves.`
    : "";

  return `The strongest force in your city is ${toTitleCase(first.emotion)} (${Math.round(
    first.score * 100,
  )}%), shaped closely by ${toTitleCase(second.emotion)}. ${thirdLine}`;
}

function buildNeeds(vector: EmotionVector): string[] {
  const needs: string[] = [];

  if (vector.burnout + vector.anxiety > 1) {
    needs.push("A slower nervous-system pace and fewer simultaneous demands.");
  }

  if (vector.loneliness + vector.grief > 0.8) {
    needs.push("Steady emotional connection and spaces where you feel witnessed.");
  }

  if (vector.hope + vector.curiosity > 0.9) {
    needs.push("Room to explore a new direction without overcommitting too quickly.");
  }

  if (vector.ambition > 0.6 && vector.burnout > 0.45) {
    needs.push("One meaningful priority instead of constant performance pressure.");
  }

  if (vector.nostalgia > 0.55) {
    needs.push("A ritual that honors what mattered before while supporting the present.");
  }

  if (vector.peace > 0.6 && needs.length === 0) {
    needs.push("Protection for the calm you are building so it can stabilize.");
  }

  if (needs.length < 2) {
    needs.push("A clear next step that matches your emotional energy, not just your to-do list.");
  }

  return needs.slice(0, 3);
}

export function inferEmotionalProfile(answers: PromptAnswers): EmotionalProfile {
  const reflectionVector = scoreText(answers.reflection);
  const promptVector = derivePromptSignals(answers);

  const merged = mergeVectors(reflectionVector, promptVector, 0.62, 0.38);
  const normalized = normalizeVector(merged);

  const dominantEmotions = emotionKeys
    .map((emotion) => ({ emotion, score: normalized[emotion] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const emotionalNeeds = buildNeeds(normalized);

  return {
    vector: normalized,
    dominantEmotions,
    interpretation: buildInterpretation(dominantEmotions),
    emotionalNeeds,
  };
}

export function describeEmotionInfluence(emotion: EmotionKey): string {
  return forceNarratives[emotion];
}
