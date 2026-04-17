"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDexie } from "@/contexts/DexieContext";
import { X, Sparkles, Zap } from "lucide-react";
import { useToaster } from "react-hot-toast";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

export function DexieAssistant() {
  const { message, enabled } = useDexie();
  const { toasts } = useToaster();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSurprised, setIsSurprised] = useState(false);
  
  // --- Typewriter Effect Logic ---
  const [displayText, setDisplayText] = useState("");
  const typingIndex = useRef(0);

  useEffect(() => {
    if (message) {
      setDisplayText("");
      typingIndex.current = 0;
      setIsDismissed(false);
      setIsMinimized(false);
      setIsExpanded(false);
      setIsVisible(true);
    }
  }, [message]);

  useEffect(() => {
    if (message && isVisible && !isMinimized && displayText.length < message.length) {
      const timeout = setTimeout(() => {
        setDisplayText(message.slice(0, displayText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [message, isVisible, isMinimized, displayText]);

  // --- Mouse Tracking Logic ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Spring animations for smooth tracking
  const springConfig = { damping: 20, stiffness: 150 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate relative distance (-1 to 1)
      const relX = (mousePos.x - centerX) / 500;
      const relY = (mousePos.y - centerY) / 500;
      
      mouseX.set(Math.max(-1, Math.min(1, relX)));
      mouseY.set(Math.max(-1, Math.min(1, relY)));
    }
  }, [mousePos, mouseX, mouseY]);

  const rotateX = useTransform(mouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);

  // --- UI Layout ---
  const activeToasts = toasts.filter((t) => t.visible).length;
  const bottomOffset = 24 + activeToasts * 85;

  useEffect(() => {
    if (isVisible && !isMinimized && !isExpanded && message && displayText === message) {
      const isMobile = window.innerWidth < 768;
      const timeout = isMobile ? 4000 : 12000;
      const t = setTimeout(() => setIsMinimized(true), timeout);
      return () => clearTimeout(t);
    }
  }, [isVisible, isMinimized, isExpanded, message, displayText]);

  if (!enabled || !message || isDismissed) return null;

  return (
    <div
      ref={containerRef}
      className="fixed right-4 md:right-8 z-[90] flex flex-col items-end gap-2"
      style={{
        bottom: `${bottomOffset}px`,
        transition: "bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
    >
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border border-blue-500/30 bg-black/95 p-4 shadow-[0_8px_32px_-12px_rgba(59,130,246,0.6)] backdrop-blur-xl transition-all duration-500 ${
              isExpanded ? "max-w-[calc(100vw-2rem)] md:max-w-xl" : "max-w-[320px] md:max-w-[440px]"
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ rotateX, rotateY, perspective: 1000 }}
          >
            {/* Dynamic Background Gradients */}
            <motion.div 
               animate={{ 
                 x: mousePos.x / 40, y: mousePos.y / 40 
               }}
               className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-yellow-400/20 blur-2xl" 
            />

            <div className="relative flex items-start gap-3.5">
              <motion.div 
                className="relative shrink-0 mt-0.5"
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSurprised(true);
                  setTimeout(() => setIsSurprised(false), 600);
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-yellow-500 shadow-lg overflow-hidden">
                  <motion.div
                    animate={isSurprised ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                  >
                    {isSurprised ? (
                      <Zap className="h-5 w-5 text-white fill-current" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    )}
                  </motion.div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
              </motion.div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-[10px] font-black uppercase tracking-[0.3em] text-transparent font-mono">
                    Dēxie
                  </span>
                </div>
                <p className={`text-[13px] leading-tight text-zinc-200 font-medium ${isExpanded ? "" : "line-clamp-6 md:line-clamp-none"}`}>
                  {displayText}
                  {displayText.length < message.length && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 align-middle"
                    />
                  )}
                </p>
              </div>

              <div className="absolute top-0 right-0 flex flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDismissed(true);
                  }}
                  className="p-1 text-zinc-600 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div 
               onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
               className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-500 text-center font-bold tracking-widest uppercase hover:text-blue-400 transition-colors md:hidden"
            >
               Minimize
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="orb"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="relative group"
            style={{ rotateX, rotateY, perspective: 1000 }}
          >
             <button
               onClick={() => setIsDismissed(true)}
               className="absolute -top-1 -left-1 z-10 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
             >
               <X className="h-2.5 w-2.5" />
             </button>

             <div
               onClick={() => setIsMinimized(false)}
               className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-yellow-500 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
             >
               <div className="flex h-full w-full items-center justify-center rounded-full bg-black/40 backdrop-blur-md overflow-hidden">
                  <motion.div
                    animate={{ 
                      x: mouseX.get() * 5, 
                      y: mouseY.get() * 5 
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </motion.div>
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black bg-yellow-400 shadow-sm" />
             </div>
             
             <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border border-black animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
