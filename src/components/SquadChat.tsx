"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSquadChat } from "~/hooks/useSquadChat";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { motion, AnimatePresence } from "motion/react";

interface SquadChatProps {
  squadId: string;
  currentUserId?: string;
}

export function SquadChat({ squadId, currentUserId }: SquadChatProps) {
  const { messages, loading, connected, error, sendMessage } = useSquadChat(squadId);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <span className="material-symbols-outlined animate-spin mb-2">progress_activity</span>
        <p className="text-xs uppercase tracking-widest font-bold">Synchronizing history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh] max-h-[600px] rounded-3xl overflow-hidden border border-outline-variant bg-surface-container/30 backdrop-blur-md">
      {/* Header */}
      <div className="px-5 py-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/40">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-primary shadow-[0_0_8px_rgba(230,221,197,0.5)]" : "bg-muted"}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {connected ? "Live Stream Active" : "Connecting..."}
          </span>
        </div>
        {error && <span className="text-[10px] text-error font-bold uppercase">{error}</span>}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-muted text-xl">forum</span>
            </div>
            <p className="text-sm text-muted">No transmissions yet. Start the conversation.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.user_id === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {!isMe && (
                    <div className="mb-1">
                      <GradientAvatar initials={msg.display_name?.[0] ?? "?"} size={28} />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-muted-foreground ml-2 mb-1 uppercase tracking-tight">
                        {msg.display_name}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-primary text-on-primary rounded-br-none"
                          : "bg-surface-container-high text-on-surface border border-outline-variant rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 mx-1">
                      {new Date(msg.created_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-surface-container-high/40 border-t border-outline-variant">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Broadcast a message..."
            className="flex-1 bg-surface-container/60 border border-outline-variant focus:border-primary/50 rounded-2xl px-5 py-3 text-sm outline-none transition-all placeholder:text-muted/50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !connected}
            className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
