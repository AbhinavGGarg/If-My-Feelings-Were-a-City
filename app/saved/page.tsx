"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteSavedCity, loadLocalSession, loadSavedCities, saveCityModel } from "@/lib/storage";
import type { LocalSession, SavedCityRecord } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

export default function SavedCitiesPage() {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [records, setRecords] = useState<SavedCityRecord[]>([]);
  const router = useRouter();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activeSession = loadLocalSession();
      setSession(activeSession);
      setRecords(activeSession ? loadSavedCities(activeSession.email) : []);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const refresh = () => {
    const activeSession = loadLocalSession();
    setSession(activeSession);
    setRecords(activeSession ? loadSavedCities(activeSession.email) : []);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_12%_12%,rgba(132,194,255,0.1),transparent_38%),#060d15] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved Cities</p>
          <h1 className="mt-2 font-serif text-5xl text-slate-50">Your city library</h1>
          <p className="mt-2 text-slate-300">Save meaningful cities, reopen them, and track your emotional chapters.</p>
        </div>

        {!session ? (
          <Card>
            <CardHeader>
              <CardTitle>Login required</CardTitle>
              <CardDescription>Create an account or log in to save cities.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No saved cities yet</CardTitle>
              <CardDescription>Generate a city and use “Save city” on the result page.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/start">Build a city</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle className="text-2xl">{record.name}</CardTitle>
                  <CardDescription>
                    {new Date(record.createdAt).toLocaleString()} • Dominant: {toTitleCase(record.city.dominantForces[0]?.emotion ?? "mixed")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">{record.city.summaryText}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        saveCityModel(record.city);
                        router.push("/city");
                      }}
                    >
                      Open city
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        deleteSavedCity(record.id, session.email);
                        refresh();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
