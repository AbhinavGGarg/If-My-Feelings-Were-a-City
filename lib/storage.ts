import type { CityModel, LocalSession, LocalUser, PromptDraftState, SavedCityRecord } from "@/lib/types";

const cityStorageKey = "if-my-feelings-city-model-v1";
const draftStorageKey = "if-my-feelings-prompt-draft-v1";
const usersStorageKey = "if-my-feelings-users-v1";
const sessionStorageKey = "if-my-feelings-session-v1";
const savedCitiesStorageKey = "if-my-feelings-saved-cities-v1";

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

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadLocalUsers() {
  return safeRead<LocalUser[]>(usersStorageKey, []);
}

export function signUpLocalUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadLocalUsers();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const user: LocalUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [...users, user];
  safeWrite(usersStorageKey, nextUsers);

  const session: LocalSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };
  safeWrite(sessionStorageKey, session);

  return { ok: true, user: session };
}

export function loginLocalUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = loadLocalUsers();
  const found = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
  );

  if (!found) {
    return { ok: false, message: "Incorrect email or password." };
  }

  const session: LocalSession = {
    userId: found.id,
    name: found.name,
    email: found.email,
  };
  safeWrite(sessionStorageKey, session);

  return { ok: true, user: session };
}

export function loadLocalSession() {
  return safeRead<LocalSession | null>(sessionStorageKey, null);
}

export function logoutLocalSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(sessionStorageKey);
}

export function loadSavedCities(ownerEmail?: string) {
  const records = safeRead<SavedCityRecord[]>(savedCitiesStorageKey, []);
  if (!ownerEmail) {
    return records;
  }
  return records.filter((record) => record.ownerEmail.toLowerCase() === ownerEmail.toLowerCase());
}

export function saveCityToLibrary(city: CityModel, options?: { name?: string; ownerEmail?: string }) {
  const records = loadSavedCities();
  const record: SavedCityRecord = {
    id: `saved-city-${Date.now()}`,
    name: options?.name?.trim() || `City • ${new Date().toLocaleDateString()}`,
    ownerEmail: options?.ownerEmail?.toLowerCase() || "guest",
    createdAt: new Date().toISOString(),
    city,
  };

  safeWrite(savedCitiesStorageKey, [record, ...records]);
  return record;
}

export function deleteSavedCity(recordId: string, ownerEmail?: string) {
  const records = loadSavedCities();
  const next = records.filter((record) => {
    if (record.id !== recordId) {
      return true;
    }
    if (!ownerEmail) {
      return false;
    }
    return record.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase();
  });

  safeWrite(savedCitiesStorageKey, next);
}
