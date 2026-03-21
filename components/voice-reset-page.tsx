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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [scriptLines, setScriptLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState("");

  const linesRef = useRef<string[]>([]);
  const canceledRef = useRef(false);

  const selectedMode = useMemo(
    () => voiceResetModes.find((mode) => mode.id === selectedModeId) ?? voiceResetModes[0],
    [selectedModeId],
  );

  const currentLine = currentLineIndex >= 0 ? scriptLines[currentLineIndex] : "";

  const stopSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    canceledRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrentLineIndex(-1);
  };

  const speakFrom = (startIndex: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const lines = linesRef.current;
    if (startIndex >= lines.length) {
      setStatus("idle");
      setCurrentLineIndex(-1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lines[startIndex]);
    const calmVoice = pickCalmVoice(voices);

    if (calmVoice) {
      utterance.voice = calmVoice;
    }

    utterance.rate = 0.84;
    utterance.pitch = 0.92;
    utterance.volume = 0.9;

    utterance.onstart = () => {
      setCurrentLineIndex(startIndex);
    };

    utterance.onend = () => {
      if (canceledRef.current || status === "paused") {
        return;
      }

      window.setTimeout(() => {
        if (!canceledRef.current) {
          speakFrom(startIndex + 1);
        }
      }, 500);
    };

    utterance.onerror = () => {
      setErrorMessage("Voice playback was interrupted. Try starting again.");
      setStatus("idle");
      setCurrentLineIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setErrorMessage("Voice is not supported in this browser.");
      return;
    }

    canceledRef.current = false;
    setErrorMessage("");
    window.speechSynthesis.cancel();

    const nextLines = buildVoiceResetScript(selectedMode, customTopic);
    linesRef.current = nextLines;
    setScriptLines(nextLines);
    setStatus("playing");
    speakFrom(0);
  };

  const pauseSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resumeSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.resume();
    setStatus("playing");
  };

  const replaySession = () => {
    stopSession();
    window.setTimeout(() => {
      startSession();
    }, 120);
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
      window.speechSynthesis.cancel();
    };
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
              <CardDescription>Calm pace, soft pauses, and gentle wording.</CardDescription>
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
                <p className="text-sm text-slate-200">{currentLine || "Press Start to begin your guided reset."}</p>
              </div>

              {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}

              <p className="text-xs text-slate-400">
                Tip: Headphones and a quiet room make this feel smoother.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
