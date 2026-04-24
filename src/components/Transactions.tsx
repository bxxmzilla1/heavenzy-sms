"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, ArrowDownLeft, ArrowUpRight, Repeat2, FileBarChart } from "lucide-react";
import { api, Transaction } from "@/lib/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalSpent = transactions
    .filter((t) => t.type === "purchase")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalDeposited = transactions
    .filter((t) => t.type === "deposit")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>Transactions</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {transactions.length} records
          </p>
        </div>
        <button
          type="button"
          onClick={load}
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

      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div
            style={{
              background: "var(--success-soft)",
              border: "1px solid #a7f3d0",
              borderRadius: 12,
              padding: "1rem",
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Deposits</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: "var(--success)" }}>+${totalDeposited.toFixed(2)}</p>
          </div>
          <div
            style={{
              background: "var(--danger-soft)",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "1rem",
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Spent</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: "var(--danger)" }}>-${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid #fecaca", borderRadius: 10, padding: "0.75rem 1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : transactions.length === 0 ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto"
            style={{ background: "var(--surface2)" }}
          >
            <FileBarChart size={22} style={{ color: "var(--muted)" }} />
          </div>
          <p className="font-medium" style={{ color: "var(--text)" }}>No transactions yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            History will show here after activity.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit";
  const isRefund = tx.type === "refund";
  const isPositive = isDeposit || isRefund;

  const icon = isDeposit
    ? <ArrowDownLeft size={16} />
    : isRefund
    ? <Repeat2 size={16} />
    : <ArrowUpRight size={16} />;

  const color = isPositive ? "var(--success)" : "var(--danger)";
  const bgColor = isPositive ? "var(--success-soft)" : "var(--danger-soft)";

  const date = new Date(tx.created_at);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 p-3.5">
      <div
        style={{
          background: bgColor,
          color,
          borderRadius: 10,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${isPositive ? "#a7f3d0" : "#fecaca"}`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{tx.description || tx.type}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatted}</p>
      </div>
      <p className="font-semibold tabular-nums shrink-0 text-sm" style={{ color }}>
        {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
      </p>
    </div>
  );
}
