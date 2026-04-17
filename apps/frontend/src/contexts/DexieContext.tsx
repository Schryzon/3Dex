"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
    // 1. Dēxie stays silent on the catalog browse list page
    if (pathname === "/catalog") return null;

    // 2. Specific 3D model detail page
    const detailMatch = pathname.match(/^\/catalog\/([^\/]+)$/);
    if (detailMatch) return { ctx: "catalog", tag: detailMatch[1] };

    if (pathname.includes("/cart")) return { ctx: "cart" };
    if (pathname.includes("/wishlist")) return { ctx: "wishlist" };
    if (pathname.includes("/profile/library")) return { ctx: "library" };
    if (pathname.startsWith("/artist/")) {
      const artistMatch = pathname.match(/^\/artist\/([^\/]+)$/);
      return { ctx: "artist", tag: artistMatch?.[1] };
    }
    if (pathname === "/") return { ctx: "home" };
    
    return { ctx: "browse" };
  };

  const seenMessages = useRef<Set<string>>(new Set());
  const isFetching = useRef(false);
  const lastFetchKey = useRef<string | null>(null);

  const fetchTagline = async () => {
    if (isFetching.current) return;

    try {
      const config = getContextKey();
      if (!config) {
        setEnabled(false);
        setMessage(null);
        return;
      }

      const { ctx, tag } = config;
      const currentKey = `${ctx}:${tag ?? ""}`;
      
      // Prevent duplicate fetching for the same context in rapid succession
      if (lastFetchKey.current === currentKey && message) return;
      
      isFetching.current = true;
      lastFetchKey.current = currentKey;

      // Only fetch if it's a page that Dēxie cares about
      const url = `/dexie/tagline?ctx=${ctx}${tag ? `&tag=${tag}` : ""}`;
      const res = await api.get<any>(url);
      
      setEnabled(res.enabled);
      
      if (res.enabled && res.message) {
        // Deduplication: Only show if not seen this session
        if (!seenMessages.current.has(res.message)) {
          setMessage(res.message);
          seenMessages.current.add(res.message);
        } else {
          // If already seen, we stay quiet for this specific page visit
          setMessage(null);
        }
      } else {
        setMessage(null);
      }
    } catch (err) {
      console.error("[Dēxie] Failed to fetch context:", err);
    } finally {
      isFetching.current = false;
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
