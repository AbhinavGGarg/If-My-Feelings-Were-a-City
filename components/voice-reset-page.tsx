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
type VoiceEngine = "browser" | "featherless";

const lineGapMs = 1800;
const defaultCloudModel = "recursal/QRWKV6-32B-Instruct-Preview-v0.1";
const cloudVoices = [
  "Darok/america",
  "Darok/joshua",
  "Darok/paola",
  "Darok/jessica",
  "Darok/grace",
  "Darok/maya",
  "Darok/knightley",
  "Darok/myriam",
  "Darok/tommy",
];

type CloudPendingRequest = {
  resolve: () => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

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
  const [engine, setEngine] = useState<VoiceEngine>("browser");
  const [browserReady, setBrowserReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [selectedCloudVoice, setSelectedCloudVoice] = useState("Darok/grace");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState("");
  const [currentLineText, setCurrentLineText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const linesRef = useRef<string[]>([]);
  const sessionIdRef = useRef(0);
  const nextIndexRef = useRef(0);
  const gapTimerRef = useRef<number | null>(null);
  const statusRef = useRef<VoiceStatus>("idle");

  const cloudPcRef = useRef<RTCPeerConnection | null>(null);
  const cloudDcRef = useRef<RTCDataChannel | null>(null);
  const cloudAudioRef = useRef<HTMLAudioElement | null>(null);
  const cloudPendingRef = useRef<CloudPendingRequest | null>(null);

  const selectedMode = useMemo(
    () => voiceResetModes.find((mode) => mode.id === selectedModeId) ?? voiceResetModes[0],
    [selectedModeId],
  );

  const selectedBrowserVoice = useMemo(() => {
    if (!voices.length) {
      return null;
    }
    if (selectedVoiceUri) {
      return voices.find((voice) => voice.voiceURI === selectedVoiceUri) ?? pickCalmVoice(voices);
    }
    return pickCalmVoice(voices);
  }, [voices, selectedVoiceUri]);

  const clearGapTimer = () => {
    if (gapTimerRef.current) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  };

  const clearCloudPending = (reason?: string) => {
    const pending = cloudPendingRef.current;
    if (!pending) {
      return;
    }

    window.clearTimeout(pending.timeoutId);
    cloudPendingRef.current = null;

    if (reason) {
      pending.reject(new Error(reason));
    }
  };

  const disconnectCloud = () => {
    clearCloudPending("Cloud voice request canceled.");

    if (cloudDcRef.current) {
      try {
        cloudDcRef.current.close();
      } catch {
        // ignore
      }
      cloudDcRef.current = null;
    }

    if (cloudPcRef.current) {
      try {
        cloudPcRef.current.close();
      } catch {
        // ignore
      }
      cloudPcRef.current = null;
    }

    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current.srcObject = null;
      cloudAudioRef.current = null;
    }
  };

  const hardCancelPlayback = () => {
    clearGapTimer();
    disconnectCloud();

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

  const setupCloudChannelHandlers = (channel: RTCDataChannel) => {
    channel.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as {
          type?: string;
          error?: { message?: string };
        };

        if (payload.type === "error") {
          clearCloudPending(payload.error?.message || "Cloud voice request failed.");
          return;
        }

        if (payload.type === "response.done") {
          const pending = cloudPendingRef.current;
          if (!pending) {
            return;
          }
          window.clearTimeout(pending.timeoutId);
          cloudPendingRef.current = null;
          pending.resolve();
        }
      } catch {
        // ignore malformed realtime events
      }
    };
  };

  const ensureCloudConnection = async () => {
    const existingDc = cloudDcRef.current;
    if (existingDc && existingDc.readyState === "open") {
      return existingDc;
    }

    if (typeof window === "undefined" || typeof RTCPeerConnection === "undefined") {
      throw new Error("WebRTC is unavailable in this browser.");
    }

    disconnectCloud();

    const pc = new RTCPeerConnection();
    pc.addTransceiver("audio", { direction: "recvonly" });

    const audio = new Audio();
    audio.autoplay = true;
    audio.volume = 0.95;
    pc.ontrack = (event) => {
      audio.srcObject = event.streams[0];
      void audio.play().catch(() => {
        // autoplay may be blocked if not started from user gesture
      });
    };

    const dc = pc.createDataChannel("oai-events");
    setupCloudChannelHandlers(dc);

    cloudPcRef.current = pc;
    cloudDcRef.current = dc;
    cloudAudioRef.current = audio;

    const waitForOpen = new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error("Cloud voice channel timed out while connecting."));
      }, 12000);

      dc.addEventListener(
        "open",
        () => {
          window.clearTimeout(timeoutId);
          resolve();
        },
        { once: true },
      );

      dc.addEventListener(
        "close",
        () => {
          window.clearTimeout(timeoutId);
          reject(new Error("Cloud voice channel closed before connecting."));
        },
        { once: true },
      );
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const response = await fetch("/api/voice-reset/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdp: offer.sdp,
        modelId: defaultCloudModel,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
      throw new Error(data.details || data.error || `Cloud handshake failed (${response.status}).`);
    }

    const answerSdp = await response.text();
    await pc.setRemoteDescription({
      type: "answer",
      sdp: answerSdp,
    });

    await waitForOpen;

    dc.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          voice: selectedCloudVoice,
          output_audio_format: "pcm16",
          instructions:
            "Speak with a calm, warm, grounded voice. Keep pacing slow and soothing.",
          temperature: 0.2,
        },
      }),
    );

    return dc;
  };

  const requestCloudSpeech = async (line: string) => {
    const dc = await ensureCloudConnection();

    await new Promise<void>((resolve, reject) => {
      clearCloudPending();

      const timeoutId = window.setTimeout(() => {
        cloudPendingRef.current = null;
        reject(new Error("Cloud voice generation timed out."));
      }, 30000);

      cloudPendingRef.current = {
        resolve,
        reject,
        timeoutId,
      };

      dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Read this line exactly as written, with a calm and gentle tone: ${line}`,
              },
            ],
          },
        }),
      );

      dc.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio"],
            voice: selectedCloudVoice,
            instructions:
              "Read the latest user line exactly as written. Keep voice soft, slow, and soothing.",
            temperature: 0.2,
          },
        }),
      );
    });
  };

  const playLineWithBrowserVoice = (sessionId: number, line: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setErrorMessage("Device voice is not available in this browser.");
      stopSession();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(line);
    const calmVoice = selectedBrowserVoice ?? pickCalmVoice(window.speechSynthesis.getVoices());

    if (calmVoice) {
      utterance.voice = calmVoice;
    }

    utterance.rate = 0.82;
    utterance.pitch = 0.9;
    utterance.volume = 0.95;

    utterance.onend = () => {
      if (sessionIdRef.current !== sessionId) {
        return;
      }
      nextIndexRef.current = index + 1;
      if (statusRef.current === "playing") {
        scheduleNextLine(sessionId);
      }
    };

    utterance.onerror = () => {
      setErrorMessage("Device voice playback was interrupted. Please try again.");
      stopSession();
    };

    window.speechSynthesis.speak(utterance);
  };

  const scheduleNextLine = (sessionId: number) => {
    clearGapTimer();
    gapTimerRef.current = window.setTimeout(() => {
      if (sessionIdRef.current !== sessionId || statusRef.current !== "playing") {
        return;
      }
      void playLine(sessionId, nextIndexRef.current);
    }, lineGapMs);
  };

  const playLine = async (sessionId: number, index: number) => {
    if (sessionIdRef.current !== sessionId || statusRef.current !== "playing") {
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

    if (engine === "browser") {
      playLineWithBrowserVoice(sessionId, line, index);
      return;
    }

    try {
      await requestCloudSpeech(line);
      if (sessionIdRef.current !== sessionId) {
        return;
      }
      nextIndexRef.current = index + 1;
      if (statusRef.current === "playing") {
        scheduleNextLine(sessionId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cloud voice failed.";
      setErrorMessage(`${message} Switched to device voice.`);
      setEngine("browser");
      playLineWithBrowserVoice(sessionId, line, index);
    }
  };

  const startSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (engine === "featherless" && !cloudReady) {
      setErrorMessage("Cloud voice is unavailable right now. Use device calm voice.");
      return;
    }

    if (engine === "browser" && !browserReady) {
      setErrorMessage("Device voice is unavailable in this browser.");
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

    if (engine === "featherless") {
      cloudAudioRef.current?.pause();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }

    setStatus("paused");
  };

  const resumeSession = () => {
    if (status !== "paused") {
      return;
    }

    setStatus("playing");

    if (engine === "featherless") {
      const cloudAudio = cloudAudioRef.current;
      if (cloudAudio && cloudAudio.paused && cloudAudio.currentTime > 0) {
        void cloudAudio.play();
      } else {
        void playLine(sessionIdRef.current, nextIndexRef.current);
      }
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
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
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => {
      hardCancelPlayback();
    };
    // hardCancelPlayback is intentionally stable enough for cleanup in this mount-only effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setBrowserReady(false);
      return;
    }

    setBrowserReady(true);

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const calm = pickCalmVoice(availableVoices);
      if (calm) {
        setSelectedVoiceUri((current) => current || calm.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const response = await fetch("/api/voice-reset/tts", { cache: "no-store" });
        if (!response.ok) {
          setCloudReady(false);
          return;
        }

        const data = (await response.json()) as { available?: boolean; reason?: string };
        if (data.available) {
          setCloudReady(true);
          return;
        }

        setCloudReady(false);
        if (data.reason) {
          setErrorMessage(`${data.reason} Using device voice.`);
        }
      } catch {
        setCloudReady(false);
      }
    };

    void checkProvider();
  }, []);

  useEffect(() => {
    if (!browserReady && cloudReady) {
      setEngine("featherless");
    }
  }, [browserReady, cloudReady]);

  const providerLabel =
    engine === "featherless"
      ? "Featherless cloud voice"
      : browserReady
        ? "Device calm voice (no credits)"
        : "Checking...";

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
              <CardDescription>Calm pace with 1.8-second pauses between lines. Provider: {providerLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setEngine("browser")}
                  disabled={!browserReady}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    engine === "browser"
                      ? "border-sky-300 bg-sky-300/10 text-sky-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500",
                  )}
                >
                  Device calm voice
                </button>
                <button
                  type="button"
                  onClick={() => setEngine("featherless")}
                  disabled={!cloudReady}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    engine === "featherless"
                      ? "border-sky-300 bg-sky-300/10 text-sky-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500",
                  )}
                >
                  Featherless cloud voice
                </button>
              </div>

              {engine === "browser" && browserReady && voices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Voice style</p>
                  <select
                    value={selectedVoiceUri}
                    onChange={(event) => setSelectedVoiceUri(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300"
                  >
                    {voices
                      .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
                      .map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI} className="bg-slate-900 text-slate-100">
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {engine === "featherless" && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Cloud voice style</p>
                  <select
                    value={selectedCloudVoice}
                    onChange={(event) => setSelectedCloudVoice(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300"
                  >
                    {cloudVoices.map((voiceName) => (
                      <option key={voiceName} value={voiceName} className="bg-slate-900 text-slate-100">
                        {voiceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
