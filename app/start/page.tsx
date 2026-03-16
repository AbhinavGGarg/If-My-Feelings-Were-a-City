import { PromptWizard } from "@/components/prompt-wizard";

export default function StartPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,rgba(104,203,255,0.13),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(255,195,107,0.15),transparent_42%),#070d14] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Prompt Flow</p>
          <h1 className="mt-2 font-serif text-5xl text-slate-50">Start your city</h1>
          <p className="mt-3 text-slate-300">
            Answer a short set of prompts and we will build a symbolic map from your emotional patterns.
          </p>
        </div>

        <PromptWizard />
      </div>
    </div>
  );
}
