"use client";

import { motion } from "framer-motion";
import { BookOpen, BookmarkPlus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CityLegend } from "@/components/city-legend";
import { CityMap } from "@/components/city-map";
import { DistrictDetailsPanel } from "@/components/district-details-panel";
import { EmotionalInsights } from "@/components/emotional-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildDemoCity } from "@/lib/demo-seed";
import { clearCityModel, loadCityModel, loadLocalSession, saveCityToLibrary } from "@/lib/storage";
import type { CityModel, District } from "@/lib/types";

export function CityExperience() {
  const [city, setCity] = useState<CityModel | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = loadCityModel();
    const cityModel = stored ?? buildDemoCity();
    const dominantEmotion = cityModel.dominantForces[0]?.emotion;
    const dominantDistrict = cityModel.districts.find((district) => district.anchorEmotion === dominantEmotion) ?? cityModel.districts[0];

    const frame = window.requestAnimationFrame(() => {
      setCity(cityModel);
      setSelectedDistrict(dominantDistrict);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const generatedDate = useMemo(() => {
    if (!city) {
      return "";
    }

    return new Date(city.generatedAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [city]);

  const dominantDistrictId = useMemo(() => {
    if (!city) {
      return "";
    }

    const dominantEmotion = city.dominantForces[0]?.emotion;
    return city.districts.find((district) => district.anchorEmotion === dominantEmotion)?.id ?? city.districts[0].id;
  }, [city]);

  if (!city || !selectedDistrict) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-slate-300">
            Generating your city map...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1220px] space-y-6 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">This is the city your feelings built</p>
            <h1 className="font-serif text-5xl leading-tight text-slate-50">If My Feelings Were a City</h1>
            <p className="mt-2 text-sm text-slate-300">Generated {generatedDate} • Reflective guidance, not therapy or diagnosis.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const session = loadLocalSession();
                const dominant = city.dominantForces[0]?.emotion ?? "City";
                saveCityToLibrary(city, {
                  ownerEmail: session?.email,
                  name: `${dominant.toUpperCase()} • ${new Date().toLocaleDateString()}`,
                });
                setSaveMessage(session ? "Saved to your city library." : "Saved locally. Log in to organize saved cities.");
              }}
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save city
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearCityModel();
                router.push("/start");
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Generate again
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/start">Edit prompts</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/saved">Saved cities</Link>
            </Button>
          </div>
        </div>
        {saveMessage && <p className="text-sm text-emerald-200">{saveMessage}</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <Card className="border-slate-700/80 bg-slate-950/60">
          <CardContent className="space-y-2 p-4 text-sm text-slate-200">
            <p className="flex items-center gap-2 text-slate-100">
              <BookOpen className="h-4 w-4 text-sky-300" />
              <span className="font-medium">How to read your city</span>
            </p>
            <p>Each card is one emotional area, labeled clearly.</p>
            <p>The percentage shows how strong that emotion is right now, while roads show emotional flow.</p>
            <p>Buildings and landmarks add context for intensity, memory, connection, and recovery needs.</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CityMap
            city={city}
            selectedDistrictId={selectedDistrict.id}
            dominantDistrictId={dominantDistrictId}
            onSelectDistrict={(district) => setSelectedDistrict(district)}
          />
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <DistrictDetailsPanel
            city={city}
            district={selectedDistrict}
            isDominant={selectedDistrict.id === dominantDistrictId}
          />
          <CityLegend city={city} />
        </motion.div>
      </div>

      <EmotionalInsights city={city} />
    </div>
  );
}
