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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset states when message changes
  useEffect(() => {
    if (message) {
      setIsDismissed(false);
      setIsMinimized(false);
      setIsExpanded(false);
      setIsVisible(true);
    }
  }, [message]);

  // Calculate dynamic stacking height based on active toast notifications
  const activeToasts = toasts.filter((t) => t.visible).length;
  const bottomOffset = 24 + activeToasts * 85;

  // Auto-collapse logic
  useEffect(() => {
    if (isVisible && !isMinimized && !isExpanded && message) {
      const t = setTimeout(() => setIsMinimized(true), 8000);
      return () => clearTimeout(t);
    }
  }, [isVisible, isMinimized, isExpanded, message]);

  if (!enabled || !message || isDismissed) return null;

  return (
    <div
      className={`fixed right-4 md:right-8 z-[90] flex flex-col items-end gap-2 transition-all duration-700 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
      style={{
        bottom: `${bottomOffset}px`,
        width: isMinimized ? "48px" : "calc(100% - 2rem)",
        maxWidth: isMinimized ? "48px" : "400px",
      }}
    >
      {/* --- BUBBLE MODE --- */}
      {!isMinimized && (
        <div
          className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border border-blue-500/30 bg-black/95 p-4 shadow-[0_8px_32px_-12px_rgba(59,130,246,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 ${
            isExpanded ? "scale-[1.01]" : "hover:bg-black"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Gradients */}
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-yellow-400/20 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-tl from-yellow-500/10 to-blue-400/10 blur-xl" />

          <div className="relative flex items-start gap-3.5">
            <div className="relative shrink-0 mt-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-yellow-500 shadow-lg">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-[11px] font-black tracking-[0.15em] text-transparent">
                  Dēxie
                </span>
              </div>
              <p className={`text-[13px] leading-relaxed text-zinc-200 font-medium ${isExpanded ? "" : "line-clamp-2"}`}>
                {message}
              </p>
            </div>

            <div className="absolute top-0 right-0 flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="p-1 text-zinc-600 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Collapse handle for mobile */}
          <div 
             onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
             className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-500 text-center font-bold tracking-widest uppercase hover:text-blue-400 transition-colors md:hidden"
          >
             Minimize
          </div>
        </div>
      )}

      {/* --- ORB MODE --- */}
      {isMinimized && (
        <div className="relative group animate-in fade-in zoom-in-75 duration-500">
           {/* Dismiss X for Orb */}
           <button
             onClick={() => setIsDismissed(true)}
             className="absolute -top-1 -left-1 z-10 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
           >
             <X className="h-2.5 w-2.5" />
           </button>

           <div
             onClick={() => setIsMinimized(false)}
             className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-yellow-500 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-110 active:scale-95"
           >
             <div className="flex h-full w-full items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
               <Sparkles className="h-5 w-5 text-white animate-pulse" />
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black bg-yellow-400 shadow-sm" />
           </div>
           
           {/* Notification Badge */}
           <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border border-black animate-ping" />
        </div>
      )}
    </div>
  );
}
