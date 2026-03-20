"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginLocalUser } from "@/lib/storage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const result = loginLocalUser(email, password);

    if (!result.ok) {
      setError(result.message ?? "Could not log in.");
      setBusy(false);
      return;
    }

    router.push("/saved");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_18%_12%,rgba(104,203,255,0.14),transparent_40%),#060d15] px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to save and revisit your cities.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in..." : "Login"}
              </Button>

              <p className="text-sm text-slate-300">
                Need an account? <Link className="text-sky-300 underline" href="/signup">Sign up</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
