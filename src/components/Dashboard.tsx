"use client";

import { useEffect, useState } from "react";
import { Wallet, RefreshCw, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import type { Order } from "@/lib/api";

interface Props {
  refreshTick: number;
}

export default function Dashboard({ refreshTick }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [bal, ords] = await Promise.all([
        api.getBalance(),
        api.getOrders(),
      ]);
      setBalance(bal.balance);
      setOrders(ords.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshTick]);

  const active = orders.filter((o) => o.status === "active");
  const withCode = orders.filter((o) => o.sms_code);
  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Your account overview
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

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Wallet size={20} />}
          label="Balance"
          value={balance !== null ? `$${balance.toFixed(2)}` : "—"}
          color="#7c6aff"
          loading={loading}
        />
        <StatCard
          icon={<span className="text-lg">📱</span>}
          label="Active Rentals"
          value={loading ? "—" : active.length.toString()}
          color="#22d3a0"
          loading={loading}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Codes Received"
          value={loading ? "—" : withCode.length.toString()}
          color="#fbbf24"
          loading={loading}
        />
        <StatCard
          icon={<span className="text-lg">✓</span>}
          label="Completed"
          value={loading ? "—" : completed.length.toString()}
          color="#a78bfa"
          loading={loading}
        />
      </div>

      {/* Active Orders */}
      {!loading && active.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div className="p-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold text-white">Active Rentals</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {active.map((order) => (
              <ActiveOrderRow key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">📭</div>
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">Buy a number from the Services tab to get started.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, color, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  loading: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "1.25rem",
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{
          background: `${color}22`,
          color,
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">
        {loading ? <span className="inline-block w-12 h-6 rounded" style={{ background: "var(--surface2)", animation: "pulse 2s infinite" }}></span> : value}
      </p>
    </div>
  );
}

function ActiveOrderRow({ order }: { order: Order }) {
  const expires = new Date(order.expires_at);
  const now = new Date();
  const minsLeft = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 60000));

  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white capitalize">{order.service}</p>
        <p className="text-sm font-mono mt-0.5" style={{ color: "var(--accent2)" }}>
          {order.phone_number}
        </p>
      </div>
      <div className="text-right">
        {order.sms_code ? (
          <span className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: "rgba(34,211,160,0.15)", color: "var(--success)", border: "1px solid rgba(34,211,160,0.3)" }}>
            {order.sms_code}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {minsLeft}m left
          </span>
        )}
      </div>
    </div>
  );
}
