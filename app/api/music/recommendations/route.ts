import { NextResponse } from "next/server";

import type { EmotionKey } from "@/lib/types";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  artwork: string;
  sourceUrl: string;
};

const emotionSearchTerms: Record<EmotionKey, string> = {
  anxiety: "calm ambient instrumental",
  hope: "uplifting ambient piano",
  loneliness: "soft acoustic comfort",
  grief: "gentle healing piano",
  love: "warm acoustic chill",
  ambition: "focus deep work instrumental",
  burnout: "restorative ambient sleep",
  nostalgia: "nostalgic lo-fi instrumental",
  confusion: "slow meditative instrumental",
  peace: "meditation ambient nature",
  anger: "cool down ambient",
  curiosity: "light exploratory instrumental",
  joy: "bright calm chill",
  fear: "safe grounding ambient",
  restlessness: "steady rhythm calm focus",
  shame: "self-compassion soft ambient",
};

function parseEmotions(raw: string | null) {
  if (!raw) {
    return [] as EmotionKey[];
  }
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) as EmotionKey[];
}

function buildSearchTerm(emotions: EmotionKey[], weather: string | null) {
  const dominant = emotions[0];
  const secondary = emotions[1];

  const primaryTerm = dominant ? emotionSearchTerms[dominant] : "calm ambient";
  const secondaryTerm = secondary ? emotionSearchTerms[secondary] : "meditation instrumental";
  const weatherTerm = weather === "rain" || weather === "drizzle" ? "rain sounds" : weather === "fog" ? "grounding" : "soothing";

  const phrase = `${primaryTerm} ${secondaryTerm} ${weatherTerm}`.trim();
  const jamendoTags = Array.from(
    new Set(
      phrase
        .split(/\s+/)
        .map((token) => token.toLowerCase().replace(/[^a-z]/g, ""))
        .filter((token) => token.length > 2),
    ),
  )
    .slice(0, 6)
    .join(",");

  return {
    phrase,
    jamendoTags: jamendoTags || "ambient,calm,meditation",
  };
}

async function fetchJamendoTracks(query: string): Promise<MusicTrack[]> {
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) {
    return [];
  }

  const url = new URL("https://api.jamendo.com/v3.0/tracks/");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "12");
  url.searchParams.set("fuzzytags", query);
  url.searchParams.set("order", "popularity_total");
  url.searchParams.set("audioformat", "mp31");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id?: string | number;
      name?: string;
      artist_name?: string;
      audio?: string;
      image?: string;
      shareurl?: string;
    }>;
  };

  return (payload.results ?? [])
    .filter((track) => track.audio && track.name && track.artist_name)
    .slice(0, 8)
    .map((track) => ({
      id: String(track.id ?? crypto.randomUUID()),
      title: track.name ?? "Untitled",
      artist: track.artist_name ?? "Unknown",
      previewUrl: track.audio ?? "",
      artwork: track.image ?? "",
      sourceUrl: track.shareurl ?? "",
    }));
}

async function fetchItunesTracks(query: string): Promise<MusicTrack[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", query);
  url.searchParams.set("entity", "song");
  url.searchParams.set("media", "music");
  url.searchParams.set("limit", "12");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    results?: Array<{
      trackId?: number;
      trackName?: string;
      artistName?: string;
      previewUrl?: string;
      artworkUrl100?: string;
      trackViewUrl?: string;
    }>;
  };

  return (payload.results ?? [])
    .filter((track) => track.previewUrl && track.trackName && track.artistName)
    .slice(0, 8)
    .map((track) => ({
      id: String(track.trackId ?? crypto.randomUUID()),
      title: track.trackName ?? "Untitled",
      artist: track.artistName ?? "Unknown",
      previewUrl: track.previewUrl ?? "",
      artwork: track.artworkUrl100 ?? "",
      sourceUrl: track.trackViewUrl ?? "",
    }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const emotions = parseEmotions(url.searchParams.get("emotions"));
  const weather = url.searchParams.get("weather");
  const query = buildSearchTerm(emotions, weather);

  const jamendoTracks = await fetchJamendoTracks(query.jamendoTags);
  if (jamendoTracks.length > 0) {
    return NextResponse.json({
      provider: "jamendo",
      query: query.phrase,
      tracks: jamendoTracks,
    });
  }

  const fallbackTracks = await fetchItunesTracks(query.phrase);
  return NextResponse.json({
    provider: "itunes",
    query: query.phrase,
    tracks: fallbackTracks,
  });
}
