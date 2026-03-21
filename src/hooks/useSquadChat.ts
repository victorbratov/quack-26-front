import { useState, useEffect, useCallback, useRef } from "react";
import { getAuthToken, squads } from "~/lib/api";
import type { SquadMessageResponse, SquadMessageReaction } from "~/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const WS_BASE = API_BASE.replace(/^http/, "ws");

type WSMessage =
  | {
      type: "chat";
      id: string;
      squad_id: string;
      user_id: string;
      display_name: string;
      content: string;
      reactions: SquadMessageReaction[];
      created_at: string;
    }
  | {
      type: "reaction";
      message_id: string;
      user_id: string;
      display_name: string;
      emoji: string;
      action: "added" | "removed";
    };

export function useSquadChat(squadId: string) {
  const [messages, setMessages] = useState<SquadMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const history = await squads.getMessages(squadId);
      setMessages(history);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      setError("Failed to load message history");
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  const connect = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }

    const wsUrl = `${WS_BASE}/squads/${squadId}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WSMessage;

        if (data.type === "chat") {
          const newMessage: SquadMessageResponse = {
            id: data.id,
            squad_id: data.squad_id,
            user_id: data.user_id,
            display_name: data.display_name,
            content: data.content,
            reactions: data.reactions,
            created_at: data.created_at,
          };
          setMessages((prev) => [...prev, newMessage]);
        } else if (data.type === "reaction") {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== data.message_id) return msg;

              let updatedReactions = [...(msg.reactions || [])];
              if (data.action === "added") {
                // Prevent duplicate reactions if already exists locally
                if (!updatedReactions.some((r) => r.user_id === data.user_id && r.emoji === data.emoji)) {
                  updatedReactions.push({
                    message_id: data.message_id,
                    user_id: data.user_id,
                    display_name: data.display_name,
                    emoji: data.emoji,
                  });
                }
              } else {
                updatedReactions = updatedReactions.filter(
                  (r) => !(r.user_id === data.user_id && r.emoji === data.emoji)
                );
              }

              return { ...msg, reactions: updatedReactions };
            })
          );
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      if (event.code === 1008) {
        setError("Session expired or access denied");
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
    };

    return () => {
      ws.close();
    };
  }, [squadId]);

  useEffect(() => {
    void fetchHistory();
    const disconnectPromise = connect();
    return () => {
      void disconnectPromise.then((cleanup) => cleanup?.());
    };
  }, [fetchHistory, connect]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", content }));
    } else {
      console.error("WebSocket is not open");
    }
  }, []);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "reaction", message_id: messageId, emoji }));
    } else {
      console.error("WebSocket is not open");
    }
  }, []);

  return {
    messages,
    loading,
    connected,
    error,
    sendMessage,
    toggleReaction,
    retryHistory: fetchHistory,
  };
}
