"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Props {
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ onSave }: Props) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.startsWith("dsk_") || key.length < 20) {
      setError("Invalid API key. It must start with dsk_ (get it from the DiddySMS Telegram bot).");
      return;
    }
    onSave(key.trim());
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md animate-fade-in"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "2.5rem" }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #7c6aff, #a78bfa)", boxShadow: "0 0 32px rgba(124,106,255,0.4)" }}>
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Heavenzy SMS</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Enter your DiddySMS API key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              API Key
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                placeholder="dsk_..."
                autoComplete="off"
                spellCheck={false}
                style={{
                  background: "var(--surface2)",
                  border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
                  borderRadius: 10,
                  color: "var(--text)",
                  padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                  width: "100%",
                  fontSize: 14,
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
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full font-semibold py-3 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, #7c6aff, #a78bfa)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Connect
          </button>
        </form>

        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
            Get your API key from the{" "}
            <a
              href="https://t.me/DiddySMSBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
              style={{ color: "var(--accent2)" }}
            >
              DiddySMS Telegram Bot <ExternalLink size={11} />
            </a>
          </p>
          <p className="text-xs text-center mt-1" style={{ color: "var(--muted)" }}>
            Your key is stored locally and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
