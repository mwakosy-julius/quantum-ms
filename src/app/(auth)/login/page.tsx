"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
            Quantum Razer
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl"
        >
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">Sign in</h2>
          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-2 rounded">
              {error}
            </p>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-[var(--metallic-silver)] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--metallic-silver-dark)] focus:outline-none focus:ring-1 focus:ring-[var(--midnight-green)]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-[var(--metallic-silver)] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--metallic-silver-dark)] focus:outline-none focus:ring-1 focus:ring-[var(--midnight-green)]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-[var(--midnight-green)] hover:opacity-90 text-white font-medium rounded transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--metallic-silver)]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
