"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Copy, CheckCircle, XCircle, RotateCcw, Loader2, Clock } from "lucide-react";
import { api, Order } from "@/lib/api";

interface Props {
  refreshTick: number;
}

export default function Orders({ refreshTick }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getOrders();
      setOrders(res.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTick]);

  // Poll active orders for SMS codes
  useEffect(() => {
    const active = orders.filter((o) => o.status === "active" && !o.sms_code);
    if (active.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updated = await Promise.all(
          active.map((o) => api.getOrder(o.id).then((r) => r.order))
        );
        setOrders((prev) =>
          prev.map((o) => {
            const u = updated.find((u) => u.id === o.id);
            return u ?? o;
          })
        );
      } catch { /* ignore poll errors */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [orders]);

  async function handleCancel(id: number) {
    setActionLoading(id);
    try {
      const res = await api.cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(id: number) {
    setActionLoading(id);
    try {
      const res = await api.completeOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Complete failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReRent(id: number) {
    setActionLoading(id);
    try {
      const res = await api.reRentOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Re-rent failed");
    } finally {
      setActionLoading(null);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusCounts = {
    all: orders.length,
    active: orders.filter((o) => o.status === "active").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {orders.length} total orders
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

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "var(--accent)" : "var(--surface)",
              color: filter === f ? "white" : "var(--muted)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "0.375rem 0.875rem",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({statusCounts[f]})</span>
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">📭</div>
          <p>No {filter !== "all" ? filter : ""} orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actionLoading={actionLoading === order.id}
              copied={copied}
              onCancel={handleCancel}
              onComplete={handleComplete}
              onReRent={handleReRent}
              onCopy={copyText}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order, actionLoading, copied, onCancel, onComplete, onReRent, onCopy,
}: {
  order: Order;
  actionLoading: boolean;
  copied: string | null;
  onCancel: (id: number) => void;
  onComplete: (id: number) => void;
  onReRent: (id: number) => void;
  onCopy: (text: string, key: string) => void;
}) {
  const statusColor = {
    active: "#22d3a0",
    completed: "#7c6aff",
    cancelled: "#f87171",
    expired: "#fbbf24",
  }[order.status] ?? "#6b6b80";

  const expires = new Date(order.expires_at);
  const now = new Date();
  const minsLeft = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 60000));
  const isExpiringSoon = order.status === "active" && minsLeft <= 5;

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${order.status === "active" ? "rgba(124,106,255,0.3)" : "var(--border)"}`,
      borderRadius: 16,
      padding: "1.25rem",
      transition: "border-color 0.2s",
    }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white capitalize">{order.service}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${statusColor}18`,
                color: statusColor,
                border: `1px solid ${statusColor}40`,
              }}>
              {order.status}
            </span>
            {order.status === "active" && !order.sms_code && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                <Loader2 size={11} className="animate-spin" />
                waiting...
              </span>
            )}
          </div>
          <p className="text-sm font-mono mt-1" style={{ color: "var(--accent2)" }}>
            {order.phone_number}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">${order.price.toFixed(2)}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            #{order.id}
          </p>
        </div>
      </div>

      {/* SMS Code */}
      {order.sms_code && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(34,211,160,0.08)", border: "1px solid rgba(34,211,160,0.25)" }}>
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>SMS Code</p>
            <p className="text-xl font-bold font-mono" style={{ color: "var(--success)", letterSpacing: 4 }}>
              {order.sms_code}
            </p>
          </div>
          <button
            onClick={() => onCopy(order.sms_code!, `code-${order.id}`)}
            style={{
              background: "rgba(34,211,160,0.15)",
              border: "1px solid rgba(34,211,160,0.3)",
              borderRadius: 8,
              color: "var(--success)",
              padding: "0.375rem 0.75rem",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {copied === `code-${order.id}` ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied === `code-${order.id}` ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Phone copy + timer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(order.phone_number, `phone-${order.id}`)}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--muted)",
              padding: "0.375rem 0.75rem",
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {copied === `phone-${order.id}` ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied === `phone-${order.id}` ? "Copied" : "Copy Number"}
          </button>

          {order.status === "active" && (
            <span className="flex items-center gap-1 text-xs" style={{ color: isExpiringSoon ? "var(--warning)" : "var(--muted)" }}>
              <Clock size={12} />
              {minsLeft}m left
            </span>
          )}
        </div>

        {/* Actions */}
        {order.status === "active" && (
          <div className="flex gap-2">
            <ActionBtn
              onClick={() => onComplete(order.id)}
              loading={actionLoading}
              icon={<CheckCircle size={13} />}
              label="Complete"
              color="var(--accent)"
            />
            <ActionBtn
              onClick={() => onCancel(order.id)}
              loading={actionLoading}
              icon={<XCircle size={13} />}
              label="Cancel"
              color="var(--danger)"
              danger
            />
          </div>
        )}
        {order.status === "completed" && (
          <ActionBtn
            onClick={() => onReRent(order.id)}
            loading={actionLoading}
            icon={<RotateCcw size={13} />}
            label="Re-rent"
            color="var(--accent)"
          />
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick, loading, icon, label, color, danger,
}: {
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  color: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: danger ? "rgba(248,113,113,0.1)" : `${color}18`,
        border: `1px solid ${danger ? "rgba(248,113,113,0.3)" : `${color}40`}`,
        borderRadius: 8,
        color: danger ? "var(--danger)" : color,
        padding: "0.375rem 0.75rem",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 12,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 4,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
