"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { generateCityModel } from "@/lib/city-generator";
import { inferEmotionalProfile } from "@/lib/emotion-engine";
import { defaultAnswers, emotionOptions, paceOptions, promptSteps } from "@/lib/prompts";
import { saveCityModel } from "@/lib/storage";
import type { PromptAnswers } from "@/lib/types";
import { cn } from "@/lib/utils";

type PromptDraftAnswers = Omit<PromptAnswers, "dominantEmotion" | "cityPace"> & {
  dominantEmotion: PromptAnswers["dominantEmotion"] | "";
  cityPace: PromptAnswers["cityPace"] | "";
};

const blankAnswers: PromptDraftAnswers = {
  reflection: "",
  dominantEmotion: "",
  underConstruction: "",
  feelsEmpty: "",
  feelsAlive: "",
  avoidRevisiting: "",
  keepsYouGoing: "",
  cityPace: "",
};

export function PromptWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PromptDraftAnswers>(blankAnswers);
  const [touched, setTouched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const current = promptSteps[step];
  const progress = useMemo(() => ((step + 1) / promptSteps.length) * 100, [step]);

  const currentValue = answers[current.id];
  const isCurrentStepValid =
    current.id === "dominantEmotion" || current.id === "cityPace"
      ? Boolean(currentValue)
      : typeof currentValue === "string"
        ? currentValue.trim().length >= (current.id === "reflection" ? 35 : 3)
        : true;

  const updateField = <K extends keyof PromptDraftAnswers>(key: K, value: PromptDraftAnswers[K]) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setTouched(false);
  };

  const onNext = () => {
    if (!isCurrentStepValid) {
      setTouched(true);
      return;
    }

    setStep((previous) => Math.min(previous + 1, promptSteps.length - 1));
  };

  const onBack = () => setStep((previous) => Math.max(previous - 1, 0));

  const completeGeneration = async (input: PromptAnswers) => {
    setIsGenerating(true);
    const profile = inferEmotionalProfile(input);
    const city = generateCityModel(profile, input);
    saveCityModel(city);
    router.push("/city");
  };

  const onSubmit = async () => {
    if (!isCurrentStepValid) {
      setTouched(true);
      return;
    }

    if (answers.dominantEmotion === "" || answers.cityPace === "") {
      setTouched(true);
      return;
    }

    const finalized: PromptAnswers = {
      ...answers,
      dominantEmotion: answers.dominantEmotion,
      cityPace: answers.cityPace,
    };

    await completeGeneration(finalized);
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="font-serif">Build Your Emotional City</CardTitle>
        <CardDescription>
          Eight prompts, one symbolic city, and practical guidance for what you may need now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>
              Prompt {step + 1} of {promptSteps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="space-y-4"
        >
          <div>
            <p className="font-serif text-3xl leading-tight text-slate-50">{current.title}</p>
            <p className="mt-2 text-sm text-slate-300">{current.subtitle}</p>
          </div>

          {current.type === "textarea" && (
            <Textarea
              placeholder={current.placeholder}
              value={answers[current.id] as string}
              onChange={(event) => updateField(current.id, event.target.value)}
              className="min-h-36 text-base leading-relaxed"
            />
          )}

          {current.type === "text" && (
            <Input
              placeholder={current.placeholder}
              value={answers[current.id] as string}
              onChange={(event) => updateField(current.id, event.target.value)}
              className="h-12 text-base"
            />
          )}

          {current.type === "emotion" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {emotionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("dominantEmotion", option.value)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    answers.dominantEmotion === option.value
                      ? "border-sky-300 bg-sky-400/15"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-500",
                  )}
                >
                  <p className="font-medium text-slate-100">{option.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{option.tone}</p>
                </button>
              ))}
            </div>
          )}

          {current.type === "pace" && (
            <div className="grid gap-3 sm:grid-cols-3">
              {paceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("cityPace", option.value)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    answers.cityPace === option.value
                      ? "border-amber-300 bg-amber-300/10"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-500",
                  )}
                >
                  <p className="font-medium text-slate-100">{option.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{option.hint}</p>
                </button>
              ))}
            </div>
          )}

          <div className="min-h-5">
            {touched && !isCurrentStepValid && (
              <Label className="text-rose-300">Add a little more detail so the city can be meaningfully mapped.</Label>
            )}
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => void completeGeneration(defaultAnswers)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Use demo city
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={step === 0 || isGenerating}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step === promptSteps.length - 1 ? (
              <Button type="button" size="lg" onClick={() => void onSubmit()} disabled={isGenerating}>
                {isGenerating ? "Generating city..." : "Generate my city"}
              </Button>
            ) : (
              <Button type="button" onClick={onNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
