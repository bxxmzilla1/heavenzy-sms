"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  onSuccess: (token: string) => void;
}

export default function PasswordModal({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Incorrect password. Try again.");
        return;
      }

      onSuccess(data.token);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(10,10,15,0.98)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="w-full max-w-sm animate-fade-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "2.5rem",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 glow-pulse"
            style={{
              background: "linear-gradient(135deg, #7c6aff, #a78bfa)",
              boxShadow: "0 0 40px rgba(124,106,255,0.35)",
            }}
          >
            <span className="text-3xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Heavenzy SMS</h1>
          <p className="text-sm mt-1.5 text-center" style={{ color: "var(--muted)" }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Password"
                autoComplete="current-password"
                autoFocus
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
                  borderRadius: 12,
                  color: "var(--text)",
                  padding: "0.875rem 2.75rem 0.875rem 2.75rem",
                  width: "100%",
                  fontSize: 15,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "var(--border)";
                }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{
                  color: "var(--muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--danger)" }}>
                <span>⚠</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: "linear-gradient(135deg, #7c6aff, #a78bfa)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "0.875rem",
              width: "100%",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !password ? "not-allowed" : "pointer",
              opacity: !password ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
