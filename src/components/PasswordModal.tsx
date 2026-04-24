"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

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
      style={{
        background: "rgba(241, 245, 249, 0.92)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="w-full max-w-sm animate-fade-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
            }}
          >
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Heavenzy SMS
          </h1>
          <p className="text-sm mt-1.5 text-center" style={{ color: "var(--muted)" }}>
            Sign in to continue
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
                className="w-full text-[15px] outline-none transition-shadow"
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
                  borderRadius: 10,
                  color: "var(--text)",
                  padding: "0.8rem 2.7rem 0.8rem 2.6rem",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
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
              <p
                className="text-xs mt-2.5 flex items-start gap-1.5"
                style={{ color: "var(--danger)" }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "0.8rem",
              fontSize: 15,
              cursor: loading || !password ? "not-allowed" : "pointer",
              opacity: !password ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: !password || loading ? "none" : "0 2px 6px rgba(79, 70, 229, 0.35)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
