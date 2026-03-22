"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSquadChat } from "~/hooks/useSquadChat";
import { GradientAvatar } from "~/components/ui/GradientAvatar";
import { motion, AnimatePresence } from "motion/react";
import type { SquadMessageReaction } from "~/lib/api";

interface SquadChatProps {
  squadId: string;
  currentUserId?: string;
}

const COMMON_EMOJIS = ["🔥", "🚀", "❤️", "😂", "💯", "👏"];

export function SquadChat({ squadId, currentUserId }: SquadChatProps) {
  const { messages, loading, connected, error, sendMessage, toggleReaction } = useSquadChat(squadId);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
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

  const groupReactions = (reactions: SquadMessageReaction[] = []) => {
    const groups: Record<string, { emoji: string; count: number; reactedByMe: boolean }> = {};
    reactions.forEach((r) => {
      groups[r.emoji] ??= { emoji: r.emoji, count: 0, reactedByMe: false };
      groups[r.emoji]!.count += 1;
      if (r.user_id === currentUserId) {
        groups[r.emoji]!.reactedByMe = true;
      }
    });
    return Object.values(groups);
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
    <div className="flex flex-col h-[60vh] max-h-[600px] rounded-3xl overflow-hidden border border-outline-variant bg-surface-container/30 backdrop-blur-md relative">
      {/* Header */}
      <div className="px-5 py-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
        {error && <span className="text-[10px] text-error font-bold uppercase">{error}</span>}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-muted text-xl">forum</span>
            </div>
            <p className="text-sm text-muted">No transmissions yet. Start the conversation.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.user_id === currentUserId;
              const reactionGroups = groupReactions(msg.reactions);

              // Smart positioning for top messages to avoid clipping
              const showBelow = idx < 2;

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
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col group`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-muted-foreground ml-2 mb-1 uppercase tracking-tight">
                        {msg.display_name}
                      </span>
                    )}
                    <div className="relative">
                      {/* Clickable Message Bubble */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer transition-all select-none ${isMe
                            ? "bg-primary text-on-primary rounded-br-none hover:bg-primary/90"
                            : "bg-surface-container-high text-on-surface border border-outline-variant rounded-bl-none hover:bg-surface-container-high/80"
                          }`}
                      >
                        {msg.content}
                      </motion.div>

                      {/* Emoji Picker Menu */}
                      <AnimatePresence>
                        {showEmojiPickerFor === msg.id && (
                          <>
                            {/* Backdrop to close picker */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPickerFor(null);
                              }}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: showBelow ? -10 : 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: showBelow ? -10 : 10 }}
                              className={`absolute z-20 ${showBelow ? "top-full mt-3" : "bottom-full mb-3"} ${isMe ? "right-0" : "left-0"} 
                                         flex gap-1.5 p-2 bg-surface-container-high border border-primary/20 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl`}
                            >
                              {COMMON_EMOJIS.map((emoji) => {
                                const hasReacted = msg.reactions?.some(r => r.user_id === currentUserId && r.emoji === emoji);
                                return (
                                  <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReaction(msg.id, emoji);
                                      setShowEmojiPickerFor(null);
                                    }}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all text-lg ${hasReacted
                                        ? "bg-primary/20 grayscale-[0.5] opacity-60"
                                        : "hover:bg-white/10"
                                      }`}
                                  >
                                    {emoji}
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Reactions Display */}
                    {reactionGroups.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                        {reactionGroups.map((rg) => (
                          <button
                            key={rg.emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg.id, rg.emoji);
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${rg.reactedByMe
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-white/[0.04] border-outline-variant text-muted hover:border-outline"
                              }`}
                          >
                            <span>{rg.emoji}</span>
                            <span>{rg.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

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
      <form onSubmit={handleSend} className="p-4 bg-surface-container-high/40 border-t border-outline-variant z-20">
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
