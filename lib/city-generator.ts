import { describeEmotionInfluence } from "@/lib/emotion-engine";
import { clamp, round, toTitleCase } from "@/lib/utils";
import {
  type ActionSuggestion,
  type Building,
  type CityModel,
  type District,
  type EmotionKey,
  type EmotionalProfile,
  type Landmark,
  type PromptAnswers,
  type Road,
  type WeatherState,
  type LightingState,
} from "@/lib/types";

const districtLayout = [
  { id: "district-1", x: 70, y: 110, width: 260, height: 170 },
  { id: "district-2", x: 365, y: 80, width: 250, height: 180 },
  { id: "district-3", x: 660, y: 115, width: 250, height: 170 },
  { id: "district-4", x: 120, y: 330, width: 260, height: 190 },
  { id: "district-5", x: 435, y: 345, width: 260, height: 190 },
  { id: "district-6", x: 740, y: 335, width: 220, height: 180 },
];

const districtNaming: Record<EmotionKey, string> = {
  anxiety: "Signal Knot",
  hope: "Sunrise Quarter",
  loneliness: "Farline District",
  grief: "Rain Memorial Ward",
  love: "Bridge Commons",
  ambition: "Skyworks Core",
  burnout: "Dim Grid",
  nostalgia: "Old Town Lights",
  confusion: "Crosswind Junction",
  peace: "Stillwater Garden",
  anger: "Pressure Yard",
  curiosity: "Open Loop",
  joy: "Bright Market",
  fear: "Watchtower Block",
  restlessness: "Pulse Transit",
  shame: "Hidden Courtyard",
};

const fallbackEmotionOrder: EmotionKey[] = [
  "hope",
  "love",
  "ambition",
  "peace",
  "nostalgia",
  "curiosity",
];

function chooseWeather(profile: EmotionalProfile): WeatherState {
  const { burnout, grief, anxiety, peace, hope } = profile.vector;
  if (burnout > 0.62) {
    return "fog";
  }
  if (grief > 0.56) {
    return "rain";
  }
  if (anxiety > 0.55) {
    return "drizzle";
  }
  if (peace + hope > 1) {
    return "clear";
  }
  return "mist";
}

function chooseLighting(profile: EmotionalProfile): LightingState {
  const { hope, burnout, nostalgia, grief, love } = profile.vector;
  if (hope > 0.62) {
    return "sunrise";
  }
  if (burnout > 0.58) {
    return "dim";
  }
  if (nostalgia + love > 1) {
    return "golden";
  }
  if (grief > 0.5) {
    return "twilight";
  }
  return "night";
}

function districtDescription(anchor: EmotionKey, answers: PromptAnswers): string {
  switch (anchor) {
    case "anxiety":
      return "Narrow blocks and crowded roads show a mind carrying too many simultaneous routes.";
    case "hope":
      return "Boulevards open toward bright horizons, with new cranes marking possible futures.";
    case "loneliness":
      return `Long roads stretch past quiet stations. ${answers.feelsEmpty.slice(0, 62)}...`;
    case "love":
      return "Warm homes and bridges keep this neighborhood stitched to the rest of the city.";
    case "grief":
      return "Rain-softened streets and memorial spaces protect what still matters.";
    case "ambition":
      return "Towers rise quickly with active transit and visible construction pressure.";
    case "burnout":
      return "Flickering power and unfinished structures signal that output has outpaced restoration.";
    case "nostalgia":
      return "Preserved buildings and lamp-lit corners hold continuity with earlier chapters.";
    case "peace":
      return "Low-noise routes and breathing room give this district a restorative tempo.";
    case "curiosity":
      return "Side streets invite exploration and experimentation without fixed outcomes.";
    default:
      return "This district reflects a supporting emotional force in your inner landscape.";
  }
}

function districtSymbolism(anchor: EmotionKey, score: number): string {
  if (anchor === "burnout" && score > 0.5) {
    return "Your city may be asking for recovery before more expansion.";
  }
  if (anchor === "hope") {
    return "Your city may be asking for one concrete step toward what feels possible.";
  }
  if (anchor === "love") {
    return "Your city may be asking for relationship-rich time, not just task time.";
  }
  if (anchor === "grief") {
    return "Your city may be asking for gentle acknowledgment, not avoidance.";
  }
  if (anchor === "anxiety") {
    return "Your city may be asking for fewer lanes and one calmer route.";
  }
  return "Your city may be asking for aligned attention in this zone.";
}

function buildDistricts(profile: EmotionalProfile, answers: PromptAnswers): District[] {
  const used = new Set<EmotionKey>();
  const dominant = [...profile.dominantEmotions.map((item) => item.emotion)];

  fallbackEmotionOrder.forEach((emotion) => {
    if (!dominant.includes(emotion)) {
      dominant.push(emotion);
    }
  });

  return districtLayout.map((layout, index) => {
    const anchorEmotion = dominant[index] ?? "hope";
    used.add(anchorEmotion);

    const score = profile.vector[anchorEmotion];
    const lowDensityPenalty = anchorEmotion === "loneliness" ? 0.25 : 0;
    const denseBoost = anchorEmotion === "anxiety" ? 0.2 : 0;

    const density = clamp(score + denseBoost - lowDensityPenalty, 0.2, 0.95);

    const secondaryTag = profile.dominantEmotions[(index + 1) % profile.dominantEmotions.length]?.emotion;

    return {
      ...layout,
      name: districtNaming[anchorEmotion],
      anchorEmotion,
      emotionalTags: [anchorEmotion, secondaryTag ?? anchorEmotion],
      density: round(density),
      description: districtDescription(anchorEmotion, answers),
      symbolism: districtSymbolism(anchorEmotion, score),
    };
  });
}

function chooseBuildingType(anchorEmotion: EmotionKey): Building["type"] {
  if (anchorEmotion === "ambition") {
    return "tower";
  }
  if (anchorEmotion === "grief") {
    return "memorial";
  }
  if (anchorEmotion === "burnout") {
    return "construction";
  }
  if (anchorEmotion === "hope") {
    return "park";
  }
  if (anchorEmotion === "loneliness") {
    return "station";
  }
  if (anchorEmotion === "nostalgia") {
    return "cultural";
  }
  return "home";
}

function buildBuildings(districts: District[], profile: EmotionalProfile): Building[] {
  return districts.flatMap((district) => {
    const score = profile.vector[district.anchorEmotion];
    const baseCount = Math.round(6 + district.density * 12);

    return Array.from({ length: baseCount }).map((_, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const width = district.anchorEmotion === "ambition" ? 14 : 12;
      const heightScale =
        district.anchorEmotion === "ambition" ? 1.6 : district.anchorEmotion === "burnout" ? 0.8 : 1.1;
      const height = Math.round((16 + ((index * 7 + 11) % 22)) * heightScale);

      const x = district.x + 14 + col * 44;
      const y = district.y + district.height - 12 - row * 26;

      const stalled = district.anchorEmotion === "burnout" && index % 3 === 0;
      const abandoned = district.anchorEmotion === "grief" && index % 4 === 0;

      return {
        id: `${district.id}-building-${index + 1}`,
        districtId: district.id,
        type: abandoned ? "abandoned" : chooseBuildingType(district.anchorEmotion),
        x,
        y,
        width,
        height,
        intensity: round(clamp(score + (index % 4) * 0.07, 0.2, 1)),
        flicker: district.anchorEmotion === "anxiety" || stalled,
      };
    });
  });
}

function buildRoads(districts: District[], profile: EmotionalProfile): Road[] {
  const baseConnections: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5],
    [0, 4],
  ];

  const roads = baseConnections.map(([fromIndex, toIndex], index) => {
    const from = districts[fromIndex];
    const to = districts[toIndex];

    const anxiety = profile.vector.anxiety;
    const hope = profile.vector.hope;
    const burnout = profile.vector.burnout;
    const loneliness = profile.vector.loneliness;

    const narrowness = clamp(anxiety * 2.5 - hope, 0, 1);
    const width = round(clamp(9 - narrowness * 4 + hope * 3, 4, 12));

    return {
      id: `road-${index + 1}`,
      fromDistrictId: from.id,
      toDistrictId: to.id,
      width,
      congestion: round(clamp(0.35 + anxiety * 0.55 + burnout * 0.2 - hope * 0.25, 0.15, 1)),
      curvedOffset: Math.round((index % 2 === 0 ? 1 : -1) * (38 + loneliness * 60)),
      isStalled: burnout > 0.55 && index % 3 === 0,
    };
  });

  if (profile.vector.anxiety > 0.55) {
    roads.push({
      id: "road-overflow-a",
      fromDistrictId: districts[0].id,
      toDistrictId: districts[2].id,
      width: 4.8,
      congestion: clamp(0.78 + profile.vector.anxiety * 0.2, 0, 1),
      curvedOffset: -140,
      isStalled: false,
    });
  }

  if (profile.vector.loneliness > 0.56) {
    roads.push({
      id: "road-longline",
      fromDistrictId: districts[3].id,
      toDistrictId: districts[2].id,
      width: 5.2,
      congestion: 0.2,
      curvedOffset: 170,
      isStalled: false,
    });
  }

  return roads;
}

function buildLandmarks(districts: District[], profile: EmotionalProfile): Landmark[] {
  const byEmotion = new Map<EmotionKey, District>();
  districts.forEach((district) => byEmotion.set(district.anchorEmotion, district));

  const landmarks: Landmark[] = [];

  const add = (
    emotion: EmotionKey,
    name: string,
    meaning: string,
    kind: Landmark["kind"],
    dx = 0,
    dy = 0,
  ) => {
    const district = byEmotion.get(emotion) ?? districts[0];
    landmarks.push({
      id: `${emotion}-${kind}`,
      districtId: district.id,
      name,
      meaning,
      kind,
      x: district.x + district.width / 2 + dx,
      y: district.y + district.height / 2 + dy,
    });
  };

  if (profile.vector.hope > 0.4) {
    add("hope", "Sunrise Conservatory", "Growth remains possible here.", "park", -34, 18);
    add("hope", "Skyline Crane", "Future-facing construction in progress.", "crane", 38, -14);
  }

  if (profile.vector.love > 0.35) {
    add("love", "Bridge of Open Doors", "Connection routes are still available.", "bridge", 22, 6);
    add("love", "Common Heart Plaza", "Belonging is a stabilizing force.", "plaza", -30, -12);
  }

  if (profile.vector.grief > 0.35) {
    add("grief", "Memorial Rain Garden", "A space to honor what hurts and matters.", "monument", 0, 0);
  }

  if (profile.vector.loneliness > 0.4) {
    add("loneliness", "Empty Central Station", "Movement exists, but arrivals feel sparse.", "station", 35, 20);
  }

  if (profile.vector.nostalgia > 0.35) {
    add("nostalgia", "Old Clock Exchange", "Preserved memory still guides identity.", "monument", -16, -20);
  }

  if (profile.vector.burnout > 0.45) {
    add("burnout", "Dark Grid Substation", "Energy systems need restoration.", "station", 12, 22);
  }

  if (profile.vector.ambition > 0.45) {
    add("ambition", "Vertical Transit Hub", "Ambition channels movement upward.", "station", -20, -18);
  }

  return landmarks.slice(0, 8);
}

function buildSummary(profile: EmotionalProfile): string {
  const [a, b] = profile.dominantEmotions;
  const first = a ? toTitleCase(a.emotion) : "Mixed Signals";
  const second = b ? toTitleCase(b.emotion) : "Steady Change";

  return `This is the city your feelings built: ${first} forms the skyline while ${second} shapes the streets. The map suggests a need for alignment between pressure, care, and recovery.`;
}

function buildActionSuggestions(profile: EmotionalProfile, answers: PromptAnswers): ActionSuggestion[] {
  const vector = profile.vector;

  const candidates: Array<ActionSuggestion & { score: number }> = [
    {
      id: "action-restore",
      title: "Create a 30-minute quiet reset",
      why: "Congestion and power strain suggest your system needs recovery before more output.",
      step: "Go outside or sit by a window without tasks for 30 minutes, then write one sentence about what eased.",
      score: vector.anxiety + vector.burnout + vector.restlessness,
    },
    {
      id: "action-connection",
      title: "Make one gentle reconnection",
      why: "Sparse districts indicate a need for emotional contact, not just productivity.",
      step: "Send one honest message to someone safe: share where you are and ask for a short check-in this week.",
      score: vector.loneliness + vector.grief + vector.shame,
    },
    {
      id: "action-process",
      title: "Revisit one avoided corner",
      why: "Avoidance zones often keep the city tense and under-lit.",
      step: `Spend 15 minutes with "${answers.avoidRevisiting}". Journal what you feel, then choose one compassionate next move.`,
      score: vector.fear + vector.shame + vector.anxiety,
    },
    {
      id: "action-expressive",
      title: "Make something expressive today",
      why: "Alive districts grow when emotion gets a visible outlet.",
      step: "Create a small output in 20 minutes: a voice note, sketch, playlist, or paragraph that captures today.",
      score: vector.curiosity + vector.joy + vector.hope,
    },
    {
      id: "action-meaningful-task",
      title: "Choose one meaningful task",
      why: "High ambition with strain benefits from a single aligned target.",
      step: "Pick one task that actually matters, define a 25-minute sprint, and stop when complete.",
      score: vector.ambition + vector.burnout + vector.confusion,
    },
    {
      id: "action-brave-step",
      title: "Take a brave personal step",
      why: "Your city shows potential energy that needs one real-world movement.",
      step: "Do one thing you have postponed for self-protection: ask, apply, initiate, or apologize.",
      score: vector.hope + vector.fear + vector.ambition,
    },
  ];

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      why: candidate.why,
      step: candidate.step,
    }));
}

export function generateCityModel(profile: EmotionalProfile, answers: PromptAnswers): CityModel {
  const districts = buildDistricts(profile, answers);
  const buildings = buildBuildings(districts, profile);
  const roads = buildRoads(districts, profile);
  const landmarks = buildLandmarks(districts, profile);

  const dominantForces = profile.dominantEmotions.slice(0, 4).map((item) => ({
    emotion: item.emotion,
    score: item.score,
    influence: describeEmotionInfluence(item.emotion),
  }));

  const weather = chooseWeather(profile);
  const lighting = chooseLighting(profile);

  return {
    id: `city-${Date.now()}`,
    title: "If My Feelings Were a City",
    generatedAt: new Date().toISOString(),
    answers,
    emotionalProfile: profile,
    districts,
    buildings,
    roads,
    landmarks,
    weather,
    lighting,
    summaryText: buildSummary(profile),
    dominantForces,
    needsText: `What this city seems to be asking for is: ${profile.emotionalNeeds.join(" ")}`,
    actionSuggestions: buildActionSuggestions(profile, answers),
  };
}
