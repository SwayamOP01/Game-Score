"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AuthPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Please acknowledge Terms and Privacy Policy.");
      return;
    }
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      return;
    }
    if (res?.ok) {
      window.location.href = "/";
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Please acknowledge Terms and Privacy Policy.");
      return;
    }
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Sign up failed");
      return;
    }
    const login = await signIn("credentials", { email, password, redirect: false });
    if (login?.error) {
      setError(login.error === "CredentialsSignin" ? "Invalid email or password" : login.error);
      return;
    }
    if (login?.ok) {
      window.location.href = "/";
    }
  }

  if (session) {
    return (
      <div className="card p-6 space-y-4">
        <p className="text-zinc-200">Signed in as {session.user?.email}</p>
        <button className="btn-secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-cyan-300">Sign in with OAuth</h2>
        <button className="btn-primary" onClick={() => signIn("google", { callbackUrl: "/" })}>
          Continue with Google
        </button>
        <button className="btn-secondary" onClick={() => signIn("facebook", { callbackUrl: "/" })}>
          Continue with Facebook
        </button>
        <p className="text-sm text-zinc-400">Note: Configure OAuth keys in .env.local</p>
      </div>

      <form onSubmit={handleCredentials} className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-violet-300">Sign up/in via Email</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full input"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="text-zinc-300">I agree to Terms and Privacy Policy</span>
        </label>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Sign in</button>
          <button type="button" onClick={handleSignup} className="btn-secondary">Sign up</button>
        </div>
      </form>
    </div>
  );
}