import type { CityModel, PromptDraftState } from "@/lib/types";

const cityStorageKey = "if-my-feelings-city-model-v1";
const draftStorageKey = "if-my-feelings-prompt-draft-v1";

export function saveCityModel(city: CityModel) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(cityStorageKey, JSON.stringify(city));
}

export function loadCityModel(): CityModel | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(cityStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CityModel;
  } catch {
    return null;
  }
}

export function clearCityModel() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(cityStorageKey);
}

export function savePromptDraft(draft: PromptDraftState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
}

export function loadPromptDraft(): PromptDraftState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(draftStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PromptDraftState;
  } catch {
    return null;
  }
}

export function clearPromptDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(draftStorageKey);
}
