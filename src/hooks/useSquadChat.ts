import { useState, useEffect, useCallback, useRef } from "react";
import { getAuthToken, squads } from "~/lib/api";
import type { SquadMessageResponse } from "~/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const WS_BASE = API_BASE.replace(/^http/, "ws");

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
        const newMessage = JSON.parse(event.data as string) as SquadMessageResponse;
        setMessages((prev) => [...prev, newMessage]);
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
      wsRef.current.send(content);
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
    retryHistory: fetchHistory,
  };
}
