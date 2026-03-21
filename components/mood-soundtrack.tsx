"use client";

import { Loader2, Music2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { districtDisplayName } from "@/lib/emotion-copy";
import type { CityModel } from "@/lib/types";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  artwork: string;
  sourceUrl: string;
};

type MusicApiResponse = {
  provider: "jamendo" | "itunes";
  query: string;
  tracks: MusicTrack[];
};

interface MoodSoundtrackProps {
  city: CityModel;
}

export function MoodSoundtrack({ city }: MoodSoundtrackProps) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");

  const emotionQuery = useMemo(
    () => city.dominantForces.slice(0, 4).map((force) => force.emotion).join(","),
    [city.dominantForces],
  );

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId, tracks],
  );

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        emotions: emotionQuery,
        weather: city.weather,
      });

      const response = await fetch(`/api/music/recommendations?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load music");
      }

      const payload = (await response.json()) as MusicApiResponse;
      setProvider(payload.provider);
      setQuery(payload.query);
      setTracks(payload.tracks);
      setSelectedTrackId(payload.tracks[0]?.id ?? "");
    } catch {
      setError("Could not load soundtrack right now. Please try refresh.");
      setTracks([]);
      setSelectedTrackId("");
    } finally {
      setLoading(false);
    }
  }, [city.weather, emotionQuery]);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Music2 className="h-5 w-5 text-emerald-300" />
            Mood Soundtrack
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => void loadTracks()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh tracks
          </Button>
        </div>
        <CardDescription>
          Soothing music matched to your top emotional zones:{" "}
          {city.dominantForces
            .slice(0, 3)
            .map((force) => districtDisplayName(force.emotion))
            .join(" • ")}
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {provider && <Badge variant="sky">Source: {provider}</Badge>}
          {query && <Badge>Mood query: {query}</Badge>}
        </div>

        {error && <p className="text-sm text-rose-200">{error}</p>}
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading calm tracks...
          </p>
        )}

        {!loading && !error && tracks.length === 0 && (
          <p className="text-sm text-slate-300">No tracks found for this mood yet. Try refresh in a moment.</p>
        )}

        {tracks.length > 0 && (
          <>
            <div className="grid gap-2 md:grid-cols-2">
              {tracks.slice(0, 6).map((track) => {
                const active = selectedTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-emerald-300/60 bg-emerald-400/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="line-clamp-1 text-sm font-medium text-slate-100">{track.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-300">{track.artist}</p>
                  </button>
                );
              })}
            </div>

            {selectedTrack && (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3">
                <p className="mb-2 text-sm text-slate-200">
                  Now playing: <span className="font-medium text-slate-50">{selectedTrack.title}</span> •{" "}
                  {selectedTrack.artist}
                </p>
                <audio key={selectedTrack.id} controls className="w-full">
                  <source src={selectedTrack.previewUrl} />
                </audio>
                {selectedTrack.sourceUrl && (
                  <a
                    className="mt-2 inline-flex text-xs text-sky-200 underline-offset-2 hover:underline"
                    href={selectedTrack.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open full track source
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
