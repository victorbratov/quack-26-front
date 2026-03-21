"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import { setAuthToken } from "~/lib/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(String(result.error.message ?? "Sign in failed"));
          setLoading(false);
          return;
        }
      } else {
        const result = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] || "User" });
        if (result.error) {
          setError(String(result.error.message ?? "Sign up failed"));
          setLoading(false);
          return;
        }
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(true);

    try {
      const res = await fetch("/api/demo-token", { method: "POST" });
      if (!res.ok) {
        setError("Failed to get demo token");
        setDemoLoading(false);
        return;
      }
      const data = await res.json() as { token: string };
      setAuthToken(data.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
      setDemoLoading(false);
    }
  };

  const handleGitHub = async () => {
    await authClient.signIn.social({ provider: "github", callbackURL: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">STRIDE</h1>
          <p className="text-sm text-muted mt-2">Financial wellness, reimagined</p>
        </div>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full py-4 rounded-full bg-secondary text-on-secondary font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {demoLoading ? (
            "Signing in..."
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              Try Demo Account
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-xs text-muted uppercase tracking-widest">or sign in</span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-on-surface placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-on-surface placeholder:text-muted-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-on-surface placeholder:text-muted-foreground"
          />

          {error && (
            <p className="text-error text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold text-base py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* GitHub */}
        <button
          onClick={handleGitHub}
          className="w-full py-4 rounded-full border border-outline-variant text-on-surface font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Continue with GitHub
        </button>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="text-primary font-bold hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
