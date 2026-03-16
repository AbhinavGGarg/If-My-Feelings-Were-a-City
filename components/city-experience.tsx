"use client";

import { motion } from "framer-motion";
import { RefreshCcw, Sparkles } from "lucide-react";
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
import { clearCityModel, loadCityModel } from "@/lib/storage";
import type { CityModel, District } from "@/lib/types";

export function CityExperience() {
  const [city, setCity] = useState<CityModel | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = loadCityModel();
    const cityModel = stored ?? buildDemoCity();
    const frame = window.requestAnimationFrame(() => {
      setCity(cityModel);
      setSelectedDistrict(cityModel.districts[0]);
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
    <div className="mx-auto max-w-[1220px] space-y-8 px-6 py-10">
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
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CityMap
            city={city}
            selectedDistrictId={selectedDistrict.id}
            onSelectDistrict={(district) => setSelectedDistrict(district)}
          />
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <DistrictDetailsPanel city={city} district={selectedDistrict} />
          <CityLegend city={city} />

          <Card className="border-amber-500/30 bg-amber-400/5">
            <CardContent className="p-4 text-sm text-amber-100">
              <p className="mb-2 flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4" />
                Emotional Interpretation Layer
              </p>
              <p>
                Your free-text reflection was translated into a normalized multi-emotion vector, then mapped to visual systems
                (district form, weather, roads, lighting) and real-world action guidance.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <EmotionalInsights city={city} />
    </div>
  );
}
