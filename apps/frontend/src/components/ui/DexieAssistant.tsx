"use client";

import React, { useState, useEffect } from "react";
import { useDexie } from "@/contexts/DexieContext";
import { X, Sparkles } from "lucide-react";
import { useToaster } from "react-hot-toast";

export function DexieAssistant() {
  const { message, enabled } = useDexie();
  const { toasts } = useToaster();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate dynamic stacking height based on active toast notifications
  const activeToasts = toasts.filter((t) => t.visible).length;
  const bottomOffset = 24 + activeToasts * 85; 

  // Auto-hide logic
  useEffect(() => {
    if (enabled && message) {
      setIsVisible(true);
      // Auto-hide after 15 seconds, but ONLY if NOT expanded
      if (!isExpanded) {
        const t = setTimeout(() => setIsVisible(false), 15000);
        return () => clearTimeout(t);
      }
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [message, enabled, isExpanded]);

  if (!enabled) return null;

  return (
    <div
      className={`fixed right-4 md:right-8 z-[90] flex w-[calc(100%-2rem)] md:w-96 flex-col gap-2 transition-all duration-500 ease-in-out ${
        isVisible
          ? "opacity-100"
          : "opacity-0 pointer-events-none translate-y-4"
      }`}
      style={{ 
        bottom: `${bottomOffset}px`,
        transitionProperty: 'bottom, transform, opacity' 
      }}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative cursor-pointer overflow-hidden rounded-xl border border-blue-500/30 bg-black/90 p-3.5 shadow-[0_8px_32px_-12px_rgba(59,130,246,0.5)] backdrop-blur-lg transition-all duration-300 ${
           isExpanded ? "scale-[1.02]" : "hover:bg-black/95"
        }`}
      >
        {/* Blue-Yellow Gradient Accent Background */}
        <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-yellow-400/20 blur-2xl" />
        <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-tl from-yellow-500/10 to-blue-400/10 blur-xl" />

        {/* Content Wrapper */}
        <div className="relative flex items-start gap-3.5">
          <div className="relative shrink-0 mt-0.5">
            {/* The "Avatar" placeholder */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-yellow-500 shadow-inner">
               <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            {/* Online Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center justify-between mb-1">
              <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-[11px] font-black tracking-[0.1em] text-transparent uppercase">
                Dēxie
              </span>
            </div>
            
            <p className={`text-[13px] leading-relaxed text-zinc-200 font-medium transition-all ${
              isExpanded ? "" : "line-clamp-2"
            }`}>
              {message}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-0 right-0 p-1 text-zinc-500 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Expansion Hint / Border Accent */}
        <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent ${
          isExpanded ? "w-full" : "w-1/2 left-1/4 opacity-50"
        }`} />
      </div>
    </div>
  );
}
