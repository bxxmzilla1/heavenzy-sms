"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, RefreshCw, ShoppingCart, Loader2, ArrowUpDown, ChevronLeft, ChevronRight, Clock, Zap } from "lucide-react";
import { api, Service, ServicesPagination } from "@/lib/api";

interface Props {
  onOrderCreated: () => void;
}

type SortKey = "name" | "price_asc" | "price_desc" | "stock";

const QUICK_FILTERS = [
  "google", "twitter", "telegram", "facebook",
  "tiktok", "instagram", "whatsapp", "discord",
  "snapchat", "amazon", "netflix", "spotify",
];

export default function Services({ onOrderCreated }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<ServicesPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("name");
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Debounce search → triggers server-side search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (pg = page, q = debouncedSearch) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getServices({ search: q || undefined, page: pg, per_page: 100 });
      setServices(res.services ?? []);
      setPagination(res.pagination ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { load(page, debouncedSearch); }, [debouncedSearch, page]);

  async function buyNumber(service: string) {
    setBuying(service);
    setError("");
    try {
      await api.createOrder(service);
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

  const sorted = useMemo(() => {
    return [...services].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "stock") return b.stock - a.stock;
      return a.display_name.localeCompare(b.display_name);
    });
  }, [services, sort]);

  const availableCount = services.filter((s) => s.stock > 0).length;
  const totalPages = pagination?.total_pages ?? 1;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {loading
              ? "Loading..."
              : `${services.length} services · ${availableCount} in stock`}
          </p>
        </div>
        <button
          onClick={() => load(page, debouncedSearch)}
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
          {loading && debouncedSearch && (
            <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          )}
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
            <option value="price_desc">Priciest</option>
            <option value="stock">Most stock</option>
          </select>
        </div>
      </div>

      {/* Quick-filter chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_FILTERS.map((tag) => (
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
            {getServiceEmoji(tag)} {tag}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No results for &ldquo;{search}&rdquo;</p>
          <p className="text-sm mt-1">Try a different search term.</p>
          <button onClick={() => setSearch("")} className="mt-4 text-sm"
            style={{ color: "var(--accent2)", background: "none", border: "none", cursor: "pointer" }}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              buying={buying === service.name}
              onBuy={() => buyNumber(service.name)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: page === 1 ? "var(--muted)" : "var(--text)",
              padding: "0.5rem",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
              display: "flex",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Page <strong style={{ color: "var(--text)" }}>{page}</strong> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: page === totalPages ? "var(--muted)" : "var(--text)",
              padding: "0.5rem",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.5 : 1,
              display: "flex",
            }}
          >
            <ChevronRight size={16} />
          </button>
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

function ServiceCard({ service, buying, onBuy }: {
  service: Service;
  buying: boolean;
  onBuy: () => void;
}) {
  const available = service.stock > 0;
  const emoji = getServiceEmoji(service.name);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${available ? "var(--border)" : "rgba(107,107,128,0.2)"}`,
        borderRadius: 16,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        opacity: available ? 1 : 0.6,
        transition: "border-color 0.2s",
      }}
      onMouseOver={(e) => available && (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = available ? "var(--border)" : "rgba(107,107,128,0.2)")}
    >
      {/* Name + stock */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate" style={{ fontSize: 14 }}>
              {service.display_name}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{service.name}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
          style={{
            background: available ? "rgba(34,211,160,0.1)" : "rgba(107,107,128,0.1)",
            color: available ? "var(--success)" : "var(--muted)",
            border: `1px solid ${available ? "rgba(34,211,160,0.25)" : "var(--border)"}`,
          }}>
          {available ? `${service.stock} left` : "Out of stock"}
        </span>
      </div>

      {/* TTL + carrier price */}
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {service.ttl_minutes}min rental
        </span>
        <span className="flex items-center gap-1">
          <Zap size={11} />
          Carrier: ${service.carrier_price.toFixed(2)}
        </span>
      </div>

      {/* Price + Buy */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--accent2)" }}>
            ${service.price.toFixed(2)}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>per number</p>
        </div>
        <button
          onClick={onBuy}
          disabled={buying || !available}
          title={!available ? "Currently out of stock" : undefined}
          style={{
            background: available ? "linear-gradient(135deg, #7c6aff, #a78bfa)" : "var(--surface2)",
            color: available ? "white" : "var(--muted)",
            border: "none",
            borderRadius: 10,
            padding: "0.55rem 1.1rem",
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

function SkeletonCard() {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.875rem",
    }}>
      <div className="flex items-center gap-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface2)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "60%", borderRadius: 4, background: "var(--surface2)", marginBottom: 6 }} />
          <div style={{ height: 10, width: "35%", borderRadius: 4, background: "var(--surface2)" }} />
        </div>
      </div>
      <div style={{ height: 10, width: "50%", borderRadius: 4, background: "var(--surface2)" }} />
      <div className="flex justify-between items-center">
        <div style={{ height: 24, width: "25%", borderRadius: 4, background: "var(--surface2)" }} />
        <div style={{ height: 34, width: "30%", borderRadius: 10, background: "var(--surface2)" }} />
      </div>
    </div>
  );
}

function getServiceEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gmail") || n.includes("google")) return "📧";
  if (n.includes("twitter") || n === "x") return "🐦";
  if (n.includes("telegram")) return "✈️";
  if (n.includes("whatsapp")) return "💬";
  if (n.includes("facebook") || n.includes("fb")) return "👤";
  if (n.includes("instagram")) return "📷";
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
  if (n.includes("viber")) return "📞";
  if (n.includes("signal")) return "🔐";
  if (n.includes("line")) return "💚";
  if (n.includes("wechat")) return "🟢";
  if (n.includes("steam")) return "🎲";
  if (n.includes("twitch")) return "🟣";
  return "📱";
}
