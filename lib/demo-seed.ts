import { generateCityModel } from "@/lib/city-generator";
import { inferEmotionalProfile } from "@/lib/emotion-engine";
import { defaultAnswers } from "@/lib/prompts";

export function buildDemoCity() {
  const profile = inferEmotionalProfile(defaultAnswers);
  return generateCityModel(profile, defaultAnswers);
}
