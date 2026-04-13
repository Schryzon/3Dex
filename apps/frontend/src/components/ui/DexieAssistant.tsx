"use client";

import React, { useState, useEffect } from "react";
import { useDexie } from "@/contexts/DexieContext";
import { X, Sparkles } from "lucide-react";

export function DexieAssistant() {
  const { message, enabled } = useDexie();
  const [isVisible, setIsVisible] = useState(false);

  // Briefly hide when message changes to trigger animation
  useEffect(() => {
    if (enabled && message) {
      setIsVisible(true);
      // Auto-hide after 15 seconds to not be annoying
      const t = setTimeout(() => setIsVisible(false), 15000);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [message, enabled]);

  if (!enabled) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 flex max-w-sm flex-col gap-2 transition-all duration-700 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-black/80 p-4 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] backdrop-blur-md">
        {/* Blue-Yellow Gradient Accent Background */}
        <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-yellow-400/20 blur-2xl" />
        <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-tl from-yellow-500/10 to-blue-400/10 blur-xl" />

        {/* Content Wrapper */}
        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0 mt-1">
            {/* The "Avatar" placeholder - Abstract Cyber Anime Vibe */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-yellow-500 shadow-inner">
               <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            {/* Online Indicator */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-sm font-bold tracking-widest text-transparent">
                DĒXIE
              </span>
              <button
                onClick={() => setIsVisible(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-800/50 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            <p className="text-sm leading-relaxed text-zinc-200 font-medium">
              {message}
            </p>
          </div>
        </div>
        
        {/* Cyberpunk Accents */}
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>
    </div>
  );
}
