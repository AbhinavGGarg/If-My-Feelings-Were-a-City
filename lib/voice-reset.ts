export interface VoiceResetMode {
  id: string;
  title: string;
  subtitle: string;
  scene: string;
}

export const voiceResetModes: VoiceResetMode[] = [
  {
    id: "calm-beach",
    title: "Calm Beach",
    subtitle: "Soft sunset light and gentle waves",
    scene: "a quiet beach near sunset",
  },
  {
    id: "quiet-rain",
    title: "Quiet Rain",
    subtitle: "Light rain on a safe indoor evening",
    scene: "a quiet room while soft rain falls outside",
  },
  {
    id: "evening-walk",
    title: "Evening Walk",
    subtitle: "Slow steps through calm streets",
    scene: "an evening walk on a quiet, familiar street",
  },
  {
    id: "mountain-air",
    title: "Mountain Air",
    subtitle: "Cool air and open sky",
    scene: "a peaceful mountain overlook with cool air",
  },
  {
    id: "open-mind",
    title: "Open Mind",
    subtitle: "Free reflection without a fixed scene",
    scene: "a calm open space where your mind can settle",
  },
];

export function buildVoiceResetScript(mode: VoiceResetMode, customTopic?: string) {
  const topicLine = customTopic?.trim()
    ? `If it feels right, let this reflection touch on: ${customTopic.trim()}.`
    : "If a thought comes forward, let it come on its own.";

  return [
    "Welcome.",
    "Take a slow breath in.",
    "And let it go.",
    "Let your shoulders drop a little.",
    "There is nothing to fix right now.",
    `Picture ${mode.scene}.`,
    "Notice one sound in that space.",
    "Notice the air around you.",
    "Notice how your body feels in this moment.",
    topicLine,
    "Stay with one thought gently, without judging it.",
    "You do not need to solve it.",
    "Just notice it.",
    "Take another slow breath.",
    "Let your breathing settle into a calm pace.",
    "When you are ready, return to the room slowly.",
    "Take one calm breath before moving on.",
  ];
}

export function pickCalmVoice(voices: SpeechSynthesisVoice[]) {
  if (!voices.length) {
    return null;
  }

  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    let score = 0;
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();

    if (lang.startsWith("en")) {
      score += 6;
    }

    if (voice.localService) {
      score += 2;
    }

    if (/samantha|ava|serena|karen|moira|allison|emma|olivia|female|zira|susan/.test(name)) {
      score += 4;
    }

    if (/google uk english female|microsoft aria|microsoft libby|microsoft ana/.test(name)) {
      score += 3;
    }

    if (/whisper|robot|novelty|trinoids/.test(name)) {
      score -= 5;
    }

    return score;
  };

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}
