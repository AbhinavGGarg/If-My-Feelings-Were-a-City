"use client";

import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { buildVoiceResetScript, pickCalmVoice, voiceResetModes } from "@/lib/voice-reset";
import { cn } from "@/lib/utils";

type VoiceStatus = "idle" | "playing" | "paused";
type VoiceProvider = "checking" | "elevenlabs" | "browser";

const lineGapMs = 1800;

function CalmWave({ active }: { active: boolean }) {
  return (
    <div className="flex h-12 items-end gap-1.5">
      {Array.from({ length: 24 }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full bg-sky-300/75"
          animate={active ? { height: [8, 22, 10, 28, 12] } : { height: 8 }}
          transition={
            active
              ? {
                  duration: 1.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: index * 0.04,
                }
              : { duration: 0.25 }
          }
        />
      ))}
    </div>
  );
}

export function VoiceResetPage() {
  const [selectedModeId, setSelectedModeId] = useState(voiceResetModes[0].id);
  const [customTopic, setCustomTopic] = useState("");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [provider, setProvider] = useState<VoiceProvider>("checking");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentLineText, setCurrentLineText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const linesRef = useRef<string[]>([]);
  const sessionIdRef = useRef(0);
  const nextIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const gapTimerRef = useRef<number | null>(null);

  const selectedMode = useMemo(
    () => voiceResetModes.find((mode) => mode.id === selectedModeId) ?? voiceResetModes[0],
    [selectedModeId],
  );

  const clearGapTimer = () => {
    if (gapTimerRef.current) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  };

  const clearAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const hardCancelPlayback = () => {
    clearGapTimer();
    clearAudio();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const stopSession = () => {
    sessionIdRef.current += 1;
    hardCancelPlayback();
    setStatus("idle");
    setCurrentLineText("");
  };

  const fetchElevenLabsLineAudio = async (text: string) => {
    const response = await fetch("/api/voice-reset/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed with status ${response.status}`);
    }

    return await response.blob();
  };

  const scheduleNextLine = (sessionId: number) => {
    clearGapTimer();
    gapTimerRef.current = window.setTimeout(() => {
      if (sessionIdRef.current !== sessionId) {
        return;
      }
      void playLine(sessionId, nextIndexRef.current);
    }, lineGapMs);
  };

  const playLineWithBrowserVoice = (sessionId: number, line: string, index: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(line);
    const calmVoice = pickCalmVoice(voices);

    if (calmVoice) {
      utterance.voice = calmVoice;
    }

    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.volume = 0.92;

    utterance.onend = () => {
      if (sessionIdRef.current !== sessionId || status !== "playing") {
        return;
      }
      nextIndexRef.current = index + 1;
      scheduleNextLine(sessionId);
    };

    utterance.onerror = () => {
      setErrorMessage("Voice playback was interrupted. Try starting again.");
      stopSession();
    };

    window.speechSynthesis.speak(utterance);
  };

  const playLine = async (sessionId: number, index: number) => {
    if (sessionIdRef.current !== sessionId) {
      return;
    }

    const lines = linesRef.current;

    if (index >= lines.length) {
      setStatus("idle");
      setCurrentLineText("Session complete. You can replay or choose another scene.");
      return;
    }

    const line = lines[index];
    setCurrentLineText(line);

    if (provider === "elevenlabs") {
      try {
        const blob = await fetchElevenLabsLineAudio(line);
        if (sessionIdRef.current !== sessionId) {
          return;
        }

        clearAudio();
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          if (sessionIdRef.current !== sessionId || status !== "playing") {
            return;
          }
          nextIndexRef.current = index + 1;
          scheduleNextLine(sessionId);
        };

        audio.onerror = () => {
          setErrorMessage("High-quality voice failed to play. Please try again.");
          stopSession();
        };

        await audio.play();
        return;
      } catch {
        setErrorMessage("High-quality voice failed. Please try again in a moment.");
        stopSession();
        return;
      }
    }

    playLineWithBrowserVoice(sessionId, line, index);
  };

  const startSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setErrorMessage("Voice is not supported in this browser.");
      return;
    }

    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;

    hardCancelPlayback();
    setErrorMessage("");
    setStatus("playing");

    const scriptLines = buildVoiceResetScript(selectedMode, customTopic);
    linesRef.current = scriptLines;
    nextIndexRef.current = 0;

    void playLine(sessionId, 0);
  };

  const pauseSession = () => {
    if (status !== "playing") {
      return;
    }

    clearGapTimer();

    if (provider === "elevenlabs") {
      audioRef.current?.pause();
    } else if (typeof window !== "undefined") {
      window.speechSynthesis.pause();
    }

    setStatus("paused");
  };

  const resumeSession = () => {
    if (status !== "paused") {
      return;
    }

    setStatus("playing");

    if (provider === "elevenlabs") {
      if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
        void audioRef.current.play();
      } else {
        void playLine(sessionIdRef.current, nextIndexRef.current);
      }
      return;
    }

    if (typeof window !== "undefined") {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        void playLine(sessionIdRef.current, nextIndexRef.current);
      }
    }
  };

  const replaySession = () => {
    stopSession();
    window.setTimeout(() => {
      startSession();
    }, 150);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    const frame = window.requestAnimationFrame(updateVoices);
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.cancelAnimationFrame(frame);
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      hardCancelPlayback();
    };
    // hardCancelPlayback is intentionally stable enough for cleanup in this mount-only effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const response = await fetch("/api/voice-reset/tts", { cache: "no-store" });
        if (!response.ok) {
          setProvider("browser");
          return;
        }

        const data = (await response.json()) as { available?: boolean };
        setProvider(data.available ? "elevenlabs" : "browser");
      } catch {
        setProvider("browser");
      }
    };

    void checkProvider();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_16%_12%,rgba(125,190,255,0.1),transparent_36%),radial-gradient(circle_at_82%_15%,rgba(255,207,132,0.09),transparent_35%),#060d15] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Voice Reset</p>
          <h1 className="mt-2 font-serif text-5xl text-slate-50">A quiet guided reflection</h1>
          <p className="mt-3 text-slate-300">
            Slow down, imagine a calm setting, and notice what is present without pressure. This is reflective guidance, not therapy.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Choose a scene</CardTitle>
              <CardDescription>Pick the setting that feels easiest to settle into right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {voiceResetModes.map((mode) => {
                  const selected = mode.id === selectedModeId;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedModeId(mode.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        selected
                          ? "border-sky-300 bg-sky-300/10"
                          : "border-slate-700 bg-slate-900/60 hover:border-slate-500",
                      )}
                    >
                      <p className="font-medium text-slate-100">{mode.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{mode.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-200">Custom reflection topic (optional)</p>
                <Textarea
                  placeholder="Example: uncertainty about my next step"
                  value={customTopic}
                  onChange={(event) => setCustomTopic(event.target.value)}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-sky-300" /> Session controls
              </CardTitle>
              <CardDescription>
                Calm pace with 1.8-second pauses between lines. Provider: {provider === "checking" ? "Checking..." : provider}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 p-3">
                <CalmWave active={status === "playing"} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={startSession}>
                  <Play className="mr-2 h-4 w-4" /> Start
                </Button>

                {status === "playing" ? (
                  <Button variant="outline" onClick={pauseSession}>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resumeSession} disabled={status !== "paused"}>
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                )}

                <Button variant="outline" onClick={stopSession}>
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>

                <Button variant="ghost" onClick={replaySession}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Replay
                </Button>
              </div>

              <div className="rounded-lg border border-slate-800/70 bg-slate-900/65 p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Now speaking</p>
                <p className="text-sm text-slate-200">{currentLineText || "Press Start to begin your guided reset."}</p>
              </div>

              {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}

              <p className="text-xs text-slate-400">Tip: Headphones and a quiet room make this feel smoother.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
