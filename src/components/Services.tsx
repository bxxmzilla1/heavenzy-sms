"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, ShoppingCart, Loader2 } from "lucide-react";
import { api, Service } from "@/lib/api";

interface Props {
  apiKey: string;
  onOrderCreated: () => void;
}

export default function Services({ apiKey, onOrderCreated }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getServices(apiKey);
      setServices(res.services ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function buyNumber(service: string) {
    setBuying(service);
    setError("");
    try {
      await api.createOrder(apiKey, service);
      showToast(`Number rented for ${service}!`);
      onOrderCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setBuying(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {services.length} available services
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text)",
            padding: "0.5rem 1rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--text)",
            padding: "0.75rem 1rem 0.75rem 2.5rem",
            width: "100%",
            fontSize: 14,
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.25rem",
              height: 120,
            }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              buying={buying === service.name}
              onBuy={() => buyNumber(service.name)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12" style={{ color: "var(--muted)" }}>
              <p>No services found matching &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in"
          style={{
            background: "rgba(34,211,160,0.15)",
            border: "1px solid rgba(34,211,160,0.4)",
            borderRadius: 12,
            padding: "0.75rem 1.5rem",
            color: "var(--success)",
            fontWeight: 600,
            fontSize: 14,
            whiteSpace: "nowrap",
          }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service, buying, onBuy,
}: {
  service: Service;
  buying: boolean;
  onBuy: () => void;
}) {
  const available = service.available_count > 0;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      transition: "border-color 0.2s",
    }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white capitalize truncate">
            {service.display_name || service.name}
          </p>
          <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--muted)" }}>
            {service.name}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: available ? "rgba(34,211,160,0.1)" : "rgba(107,107,128,0.15)",
            color: available ? "var(--success)" : "var(--muted)",
            border: `1px solid ${available ? "rgba(34,211,160,0.3)" : "var(--border)"}`,
          }}>
          {available ? `${service.available_count} avail.` : "Unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xl font-bold" style={{ color: "var(--accent2)" }}>
          ${service.price?.toFixed(2) ?? "—"}
        </p>
        <button
          onClick={onBuy}
          disabled={buying || !available}
          style={{
            background: available ? "linear-gradient(135deg, #7c6aff, #a78bfa)" : "var(--surface2)",
            color: available ? "white" : "var(--muted)",
            border: "none",
            borderRadius: 10,
            padding: "0.5rem 1rem",
            fontSize: 13,
            fontWeight: 600,
            cursor: buying || !available ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            opacity: buying ? 0.7 : 1,
          }}
        >
          {buying ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
          {buying ? "Buying..." : "Buy"}
        </button>
      </div>
    </div>
  );
}
