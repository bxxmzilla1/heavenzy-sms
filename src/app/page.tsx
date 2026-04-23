"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, PhoneCall, ClipboardList, Receipt, LogOut, Wifi } from "lucide-react";
import ApiKeyModal from "@/components/ApiKeyModal";
import Dashboard from "@/components/Dashboard";
import Services from "@/components/Services";
import Orders from "@/components/Orders";
import Transactions from "@/components/Transactions";

type Tab = "dashboard" | "services" | "orders" | "transactions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "services", label: "Services", icon: <PhoneCall size={20} /> },
  { id: "orders", label: "Orders", icon: <ClipboardList size={20} /> },
  { id: "transactions", label: "Transactions", icon: <Receipt size={20} /> },
];

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [refreshTick, setRefreshTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("heavenzysms_key");
    if (stored) setApiKey(stored);
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

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function saveKey(key: string) {
    localStorage.setItem("heavenzysms_key", key);
    setApiKey(key);
  }

  function logout() {
    localStorage.removeItem("heavenzysms_key");
    setApiKey(null);
  }

  const handleOrderCreated = useCallback(() => {
    setTab("orders");
    setRefreshTick((t) => t + 1);
  }, []);

  if (!mounted) return null;

  if (!apiKey) {
    return <ApiKeyModal onSave={saveKey} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top Nav */}
      <header style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c6aff, #a78bfa)" }}>
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Heavenzy SMS</span>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1">
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

          {/* Right */}
          <div className="flex items-center gap-3">
            {!isOnline && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(251,191,36,0.15)", color: "var(--warning)", border: "1px solid rgba(251,191,36,0.3)" }}>
                <Wifi size={12} />
                Offline
              </span>
            )}
            <button
              onClick={logout}
              title="Logout"
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
        {tab === "dashboard" && (
          <Dashboard apiKey={apiKey} refreshTick={refreshTick} />
        )}
        {tab === "services" && (
          <Services apiKey={apiKey} onOrderCreated={handleOrderCreated} />
        )}
        {tab === "orders" && (
          <Orders apiKey={apiKey} refreshTick={refreshTick} />
        )}
        {tab === "transactions" && (
          <Transactions apiKey={apiKey} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
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
              <span style={{ transform: tab === t.id ? "scale(1.1)" : "scale(1)", transition: "transform 0.15s" }}>
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
