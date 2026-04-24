"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  RefreshCw,
  ShoppingCart,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
} from "lucide-react";
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

const cardClass = {
  base: {
    background: "var(--surface)" as const,
    border: "1px solid var(--border)" as const,
    borderRadius: 14,
    boxShadow: "var(--shadow-sm)" as const,
  },
};

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

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (pg = page, q = debouncedSearch) => {
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
    },
    [page, debouncedSearch]
  );

  useEffect(() => {
    load(page, debouncedSearch);
  }, [debouncedSearch, page]);

  async function buyNumber(service: string) {
    setBuying(service);
    setError("");
    try {
      await api.createOrder(service);
      showToast("Number rented");
      onOrderCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setBuying(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Services
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {loading
              ? "Loading"
              : `${services.length} services — ${availableCount} in stock`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(page, debouncedSearch)}
          disabled={loading}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            padding: "0.45rem 0.9rem",
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="search"
            placeholder="Search by service name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--text)",
              padding: "0.65rem 1rem 0.65rem 2.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          />
          {loading && debouncedSearch && (
            <Loader2
              size={14}
              className="animate-spin absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
          )}
        </div>
        <div className="relative">
          <ArrowUpDown
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-full text-sm font-medium"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--text)",
              padding: "0.65rem 0.9rem 0.65rem 2rem",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              appearance: "none",
            }}
          >
            <option value="name">A to Z</option>
            <option value="price_asc">Price: low</option>
            <option value="price_desc">Price: high</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {QUICK_FILTERS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSearch(search === tag ? "" : tag)}
            style={{
              background: search === tag ? "var(--accent-soft)" : "var(--surface)",
              border: `1px solid ${search === tag ? "var(--accent2)" : "var(--border)"}`,
              borderRadius: 7,
              color: search === tag ? "var(--accent)" : "var(--muted)",
              padding: "0.28rem 0.7rem",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize" as const,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger-soft)",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "0.75rem 1rem",
          }}
        >
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ background: "var(--surface2)" }}
          >
            <Search size={22} style={{ color: "var(--muted)" }} />
          </div>
          <p className="font-medium" style={{ color: "var(--text)" }}>
            {search ? `No results for “${search}”` : "No services found"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Try another search or clear filters.
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              ...cardClass.base,
              padding: "0.45rem",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
              display: "flex",
            }}
          >
            <ChevronLeft size={16} style={{ color: "var(--text)" }} />
          </button>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Page <span className="font-medium" style={{ color: "var(--text)" }}>{page}</span> of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              ...cardClass.base,
              padding: "0.45rem",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.4 : 1,
              display: "flex",
            }}
          >
            <ChevronRight size={16} style={{ color: "var(--text)" }} />
          </button>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-medium animate-fade-in"
          style={{
            background: "var(--success-soft)",
            border: "1px solid #a7f3d0",
            color: "var(--success)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function ServiceStarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
    </svg>
  );
}

function ServiceAvatar({ label }: { label: string }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center"
      role="img"
      aria-label={label || "Service"}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "linear-gradient(180deg, var(--accent-soft) 0%, #e0e7ff 100%)",
        color: "var(--accent)",
        border: "1px solid #c7d2fe",
      }}
    >
      <ServiceStarIcon />
    </div>
  );
}

function ServiceCard({
  service,
  buying,
  onBuy,
}: {
  service: Service;
  buying: boolean;
  onBuy: () => void;
}) {
  const available = service.stock > 0;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${available ? "var(--border)" : "#e2e8f0"}`,
        borderRadius: 14,
        padding: "1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        boxShadow: "var(--shadow-sm)",
        opacity: available ? 1 : 0.75,
        transition: "box-shadow 0.2s",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <ServiceAvatar label={service.display_name || service.name} />
          <div className="min-w-0">
            <p className="font-semibold truncate text-[15px]" style={{ color: "var(--text)" }}>
              {service.display_name}
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>
              {service.name}
            </p>
          </div>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0"
          style={{
            background: available ? "var(--success-soft)" : "var(--surface2)",
            color: available ? "var(--success)" : "var(--muted)",
            border: `1px solid ${available ? "#a7f3d0" : "var(--border)"}`,
          }}
        >
          {available ? `${service.stock} left` : "Out of stock"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {service.ttl_minutes} min
        </span>
        <span className="flex items-center gap-1">
          <Zap size={12} />
          ${service.carrier_price.toFixed(2)} carrier
        </span>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div>
          <p className="text-lg font-bold tabular-nums" style={{ color: "var(--accent)" }}>
            ${service.price.toFixed(2)}
          </p>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            per number
          </p>
        </div>
        <button
          type="button"
          onClick={onBuy}
          disabled={buying || !available}
          style={{
            background: available
              ? "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)"
              : "var(--surface2)",
            color: available ? "white" : "var(--muted)",
            border: "none",
            borderRadius: 8,
            padding: "0.45rem 0.9rem",
            fontSize: 13,
            fontWeight: 600,
            cursor: buying ? "wait" : available ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 5,
            boxShadow: available ? "0 1px 3px rgba(79, 70, 229, 0.25)" : "none",
          }}
        >
          {buying ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} strokeWidth={2} />}
          {buying ? "…" : "Buy"}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "1.1rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "55%", borderRadius: 4, background: "var(--surface2)", marginBottom: 6 }} />
          <div style={{ height: 10, width: "30%", borderRadius: 4, background: "var(--surface2)" }} />
        </div>
      </div>
      <div style={{ height: 10, width: "45%", borderRadius: 4, background: "var(--surface2)", marginTop: 10 }} />
      <div className="flex justify-between items-center mt-3">
        <div style={{ height: 22, width: "28%", borderRadius: 4, background: "var(--surface2)" }} />
        <div style={{ height: 32, width: "26%", borderRadius: 8, background: "var(--surface2)" }} />
      </div>
    </div>
  );
}
