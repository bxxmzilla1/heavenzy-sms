"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, RefreshCw, ShoppingCart, Loader2, ArrowUpDown } from "lucide-react";
import { api, Service } from "@/lib/api";

interface Props {
  apiKey: string;
  onOrderCreated: () => void;
}

type SortKey = "name" | "price_asc" | "price_desc" | "available";

function normalizeServices(raw: unknown): Service[] {
  if (!raw) return [];
  // Handle both array and { services: [] } shapes
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>).services)
    ? ((raw as Record<string, unknown>).services as unknown[])
    : [];
  return list as Service[];
}

function getAvailableCount(s: Service): number {
  // Different API responses may use different field names
  if (typeof s.available_count === "number") return s.available_count;
  if (typeof s.count === "number") return s.count;
  if (typeof s.available === "number") return s.available;
  if (s.available === true) return 999;
  if (s.available === false) return 0;
  // If no availability info at all, assume available
  return 999;
}

export default function Services({ apiKey, onOrderCreated }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [rawDebug, setRawDebug] = useState<string>("");

  async function load() {
    setLoading(true);
    setError("");
    setRawDebug("");
    try {
      const raw = await api.getServices(apiKey);
      const list = normalizeServices(raw);
      setServices(list);
      if (list.length === 0) {
        setRawDebug(JSON.stringify(raw, null, 2).slice(0, 500));
      }
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

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.display_name ?? "").toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "available") {
        return getAvailableCount(b) - getAvailableCount(a);
      }
      // Default: name A-Z
      return (a.display_name || a.name).localeCompare(b.display_name || b.name);
    });

    return list;
  }, [services, search, sort]);

  const availableCount = services.filter((s) => getAvailableCount(s) > 0).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {loading ? "Loading..." : `${services.length} services · ${availableCount} available`}
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

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search Gmail, Twitter, Telegram..."
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
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              padding: "0.75rem 1rem 0.75rem 2.25rem",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="name">A – Z</option>
            <option value="price_asc">Cheapest</option>
            <option value="price_desc">Most expensive</option>
            <option value="available">Most available</option>
          </select>
        </div>
      </div>

      {/* Quick-filter chips */}
      <div className="flex gap-2 flex-wrap">
        {["gmail", "twitter", "telegram", "facebook", "tiktok", "instagram", "whatsapp", "discord"].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearch(search === tag ? "" : tag)}
            style={{
              background: search === tag ? "rgba(124,106,255,0.2)" : "var(--surface)",
              border: `1px solid ${search === tag ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 20,
              color: search === tag ? "var(--accent2)" : "var(--muted)",
              padding: "0.3rem 0.85rem",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Debug: show raw response if empty */}
      {!loading && services.length === 0 && rawDebug && (
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "var(--warning)" }}>API Response (unexpected format):</p>
          <pre className="text-xs overflow-auto" style={{ color: "var(--muted)" }}>{rawDebug}</pre>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1.25rem",
              height: 110,
              opacity: 1 - i * 0.05,
            }} />
          ))}
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No results for &ldquo;{search}&rdquo;</p>
          <p className="text-sm mt-1">Try a different name or clear the search.</p>
          <button onClick={() => setSearch("")} className="mt-4 text-sm"
            style={{ color: "var(--accent2)", background: "none", border: "none", cursor: "pointer" }}>
            Clear search
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">📭</div>
          <p>No services returned. Check your API key or try refreshing.</p>
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
  const avail = getAvailableCount(service);
  const available = avail > 0;
  const label = service.display_name || service.name;

  // Pick an emoji based on service name
  const emoji = getServiceEmoji(service.name);

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${available ? "var(--border)" : "rgba(107,107,128,0.2)"}`,
      borderRadius: 16,
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      opacity: available ? 1 : 0.65,
      transition: "border-color 0.2s, opacity 0.2s",
    }}
      onMouseOver={(e) => available && (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = available ? "var(--border)" : "rgba(107,107,128,0.2)")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-white capitalize truncate" style={{ fontSize: 14 }}>
              {label}
            </p>
            {label.toLowerCase() !== service.name.toLowerCase() && (
              <p className="text-xs capitalize" style={{ color: "var(--muted)" }}>
                {service.name}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: available ? "rgba(34,211,160,0.1)" : "rgba(107,107,128,0.1)",
            color: available ? "var(--success)" : "var(--muted)",
            border: `1px solid ${available ? "rgba(34,211,160,0.25)" : "var(--border)"}`,
          }}>
          {avail >= 999 ? "In stock" : available ? `${avail} left` : "Unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xl font-bold" style={{ color: "var(--accent2)" }}>
          ${(service.price ?? 0).toFixed(2)}
        </p>
        <button
          onClick={onBuy}
          disabled={buying || !available}
          title={!available ? "Currently unavailable" : undefined}
          style={{
            background: available ? "linear-gradient(135deg, #7c6aff, #a78bfa)" : "var(--surface2)",
            color: available ? "white" : "var(--muted)",
            border: "none",
            borderRadius: 10,
            padding: "0.5rem 1rem",
            fontSize: 13,
            fontWeight: 600,
            cursor: buying ? "wait" : available ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 5,
            opacity: buying ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {buying ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
          {buying ? "Buying..." : "Buy"}
        </button>
      </div>
    </div>
  );
}

function getServiceEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gmail") || n.includes("google")) return "📧";
  if (n.includes("twitter") || n.includes("x.com")) return "🐦";
  if (n.includes("telegram")) return "✈️";
  if (n.includes("whatsapp")) return "💬";
  if (n.includes("facebook") || n.includes("fb")) return "👤";
  if (n.includes("instagram") || n.includes("insta")) return "📷";
  if (n.includes("tiktok")) return "🎵";
  if (n.includes("discord")) return "🎮";
  if (n.includes("snapchat")) return "👻";
  if (n.includes("amazon")) return "📦";
  if (n.includes("apple") || n.includes("icloud")) return "🍎";
  if (n.includes("microsoft") || n.includes("outlook")) return "🪟";
  if (n.includes("paypal")) return "💳";
  if (n.includes("uber")) return "🚗";
  if (n.includes("airbnb")) return "🏠";
  if (n.includes("netflix")) return "🎬";
  if (n.includes("spotify")) return "🎧";
  if (n.includes("linkedin")) return "💼";
  if (n.includes("reddit")) return "🤖";
  if (n.includes("yahoo")) return "📮";
  if (n.includes("line")) return "💚";
  if (n.includes("viber")) return "📞";
  if (n.includes("signal")) return "🔐";
  return "📱";
}
