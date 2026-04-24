"use client";

import { useState, useEffect, useCallback } from "react";
import { PhoneCall, ClipboardList, Receipt, LogOut, Wifi, Wallet, RefreshCw } from "lucide-react";
import PasswordModal from "@/components/PasswordModal";
import Services from "@/components/Services";
import Orders from "@/components/Orders";
import Transactions from "@/components/Transactions";
import { setSessionToken, api } from "@/lib/api";

type Tab = "services" | "orders" | "transactions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "services", label: "Services", icon: <PhoneCall size={20} /> },
  { id: "orders", label: "Orders", icon: <ClipboardList size={20} /> },
  { id: "transactions", label: "Transactions", icon: <Receipt size={20} /> },
];

const SESSION_KEY = "heavenzysms_session";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("services");
  const [refreshTick, setRefreshTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionToken(stored);
      setAuthenticated(true);
    }

    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await api.getBalance();
      setBalance(res.balance);
    } catch {
      // silently fail
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Fetch balance once authenticated
  useEffect(() => {
    if (authenticated) fetchBalance();
  }, [authenticated, fetchBalance]);

  // Refresh balance whenever an order is created
  useEffect(() => {
    if (authenticated && refreshTick > 0) fetchBalance();
  }, [refreshTick, authenticated, fetchBalance]);

  function handleLogin(token: string) {
    localStorage.setItem(SESSION_KEY, token);
    setSessionToken(token);
    setAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSessionToken("");
    setAuthenticated(false);
    setBalance(null);
  }

  const handleOrderCreated = useCallback(() => {
    setTab("orders");
    setRefreshTick((t) => t + 1);
  }, []);

  if (!mounted) return null;
  if (!authenticated) return <PasswordModal onSuccess={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c6aff, #a78bfa)" }}
            >
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Heavenzy SMS</span>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "rgba(124,106,255,0.15)" : "transparent",
                  color: tab === t.id ? "var(--accent2)" : "var(--muted)",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.5rem 1rem",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          {/* Right: Balance + Offline + Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {!isOnline && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  color: "var(--warning)",
                  border: "1px solid rgba(251,191,36,0.3)",
                }}
              >
                <Wifi size={12} />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            {/* Balance pill */}
            <button
              onClick={fetchBalance}
              title="Refresh balance"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(124,106,255,0.12)",
                border: "1px solid rgba(124,106,255,0.3)",
                borderRadius: 10,
                padding: "0.375rem 0.75rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(124,106,255,0.2)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(124,106,255,0.12)")}
            >
              <Wallet size={14} style={{ color: "var(--accent2)" }} />
              {balanceLoading ? (
                <RefreshCw size={13} className="animate-spin" style={{ color: "var(--accent2)" }} />
              ) : (
                <span className="font-bold text-sm" style={{ color: "var(--accent2)" }}>
                  {balance !== null ? `$${balance.toFixed(2)}` : "—"}
                </span>
              )}
            </button>

            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--muted)",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {tab === "services" && <Services onOrderCreated={handleOrderCreated} />}
        {tab === "orders" && <Orders refreshTick={refreshTick} />}
        {tab === "transactions" && <Transactions />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5"
              style={{
                background: "transparent",
                border: "none",
                color: tab === t.id ? "var(--accent2)" : "var(--muted)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: tab === t.id ? 600 : 400,
                transition: "color 0.15s",
              }}
            >
              <span
                style={{
                  transform: tab === t.id ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
