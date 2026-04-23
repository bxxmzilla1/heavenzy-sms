"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, ArrowDownLeft, ArrowUpRight, Repeat2 } from "lucide-react";
import { api, Transaction } from "@/lib/api";

interface Props {
  apiKey: string;
}

export default function Transactions({ apiKey }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getTransactions(apiKey);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {transactions.length} transactions
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

      {/* Summary */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div style={{
            background: "rgba(34,211,160,0.06)",
            border: "1px solid rgba(34,211,160,0.2)",
            borderRadius: 14,
            padding: "1.25rem",
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Total Deposited</p>
            <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>+${totalDeposited.toFixed(2)}</p>
          </div>
          <div style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 14,
            padding: "1.25rem",
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Total Spent</p>
            <p className="text-2xl font-bold" style={{ color: "var(--danger)" }}>-${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: "1rem" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">📊</div>
          <p>No transactions yet.</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
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
  const bgColor = isPositive ? "rgba(34,211,160,0.1)" : "rgba(248,113,113,0.1)";

  const date = new Date(tx.created_at);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 p-4">
      <div style={{
        background: bgColor,
        color,
        borderRadius: 10,
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.description || tx.type}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatted}</p>
      </div>
      <p className="font-semibold shrink-0" style={{ color }}>
        {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
      </p>
    </div>
  );
}
