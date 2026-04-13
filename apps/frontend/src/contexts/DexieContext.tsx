"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import api from "@/lib/api/client";

interface DexieContextProps {
  message: string | null;
  enabled: boolean;
  refreshTagline: () => void;
  toggleDexie: (state: boolean) => Promise<void>;
}

const DexieContext = createContext<DexieContextProps>({
  message: null,
  enabled: true,
  refreshTagline: () => {},
  toggleDexie: async () => {},
});

export const useDexie = () => useContext(DexieContext);

export function DexieProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Deduce context key from the current URL
  const getContextKey = () => {
    if (pathname.includes("/catalog")) return "catalog";
    if (pathname.includes("/cart")) return "cart";
    if (pathname.includes("/wishlist")) return "wishlist";
    if (pathname.includes("/profile/library")) return "library";
    if (pathname.startsWith("/artist/")) return "artist";
    if (pathname === "/") return "home";
    return "browse";
  };

  const fetchTagline = async () => {
    try {
      const ctx = getContextKey();
      // Only fetch if it's a page that Dēxie cares about
      const res = await api.get<any>(`/dexie/tagline?ctx=${ctx}`);
      setEnabled(res.enabled);
      if (res.enabled && res.message) {
        setMessage(res.message);
      } else {
        setMessage(null);
      }
    } catch (err) {
      console.error("[Dēxie] Failed to fetch context:", err);
    }
  };

  useEffect(() => {
    // Re-fetch tagline whenever the user changes pages or logs in
    fetchTagline();
  }, [pathname, isAuthenticated]);

  const toggleDexie = async (state: boolean) => {
    try {
      await api.patch("/dexie/toggle", { enabled: state });
      setEnabled(state);
      if (state) {
        fetchTagline();
      } else {
        setMessage(null);
      }
    } catch (err) {
      console.error("[Dēxie] Failed to toggle:", err);
    }
  };

  return (
    <DexieContext.Provider
      value={{
        message,
        enabled,
        refreshTagline: fetchTagline,
        toggleDexie,
      }}
    >
      {children}
    </DexieContext.Provider>
  );
}
