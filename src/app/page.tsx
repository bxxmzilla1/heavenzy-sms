"use client";

import { useState, useEffect, useCallback } from "react";
import { PhoneCall, ClipboardList, Receipt, LogOut, Wifi, Wallet, RefreshCw } from "lucide-react";
import PasswordModal from "@/components/PasswordModal";
import Services from "@/components/Services";
import Orders from "@/components/Orders";
import Transactions from "@/components/Transactions";
import { setSessionToken, api } from "@/lib/api";
import BrandLogo from "@/components/BrandLogo";

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

  const fetchBalance = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) setBalanceLoading(true);
    try {
      const res = await api.getBalance();
      setBalance(res.balance);
    } catch {
      // silently fail
    } finally {
      if (!silent) setBalanceLoading(false);
    }
  }, []);

  // Poll balance every second while signed in (silent updates — no flickering spinner)
  useEffect(() => {
    if (!authenticated) return;

    void fetchBalance();
    const id = setInterval(() => {
      void fetchBalance({ silent: true });
    }, 1000);

    return () => clearInterval(id);
  }, [authenticated, fetchBalance]);

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
          boxShadow: "var(--shadow-sm)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <BrandLogo size={32} className="rounded-lg" priority />
            <span className="font-semibold text-base md:text-lg truncate" style={{ color: "var(--text)" }}>
              Heavenzy SMS
            </span>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center max-w-md">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                type="button"
                style={{
                  background: tab === t.id ? "var(--accent-soft)" : "transparent",
                  color: tab === t.id ? "var(--accent)" : "var(--muted)",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.5rem 0.9rem",
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
          <div className="flex items-center gap-1.5 shrink-0">
            {!isOnline && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md"
                style={{
                  background: "var(--warning-soft)",
                  color: "var(--warning)",
                  border: "1px solid #fde68a",
                }}
              >
                <Wifi size={12} />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => void fetchBalance()}
              title="Refresh balance"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--accent-soft)",
                border: "1px solid #c7d2fe",
                borderRadius: 8,
                padding: "0.35rem 0.7rem",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
            >
              <Wallet size={14} style={{ color: "var(--accent)" }} />
              {balanceLoading ? (
                <RefreshCw size={13} className="animate-spin" style={{ color: "var(--accent)" }} />
              ) : (
                <span className="font-semibold text-sm tabular-nums" style={{ color: "var(--text)" }}>
                  {balance !== null ? `$${balance.toFixed(2)}` : "—"}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              style={{
                background: "var(--surface)",
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
          boxShadow: "0 -4px 12px rgba(15, 23, 42, 0.04)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5"
              style={{
                background: "transparent",
                border: "none",
                color: tab === t.id ? "var(--accent)" : "var(--muted)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: tab === t.id ? 600 : 500,
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
