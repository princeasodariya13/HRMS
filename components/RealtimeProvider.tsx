"use client";

import { useEffect } from "react";

export function RealtimeProvider({ companyId }: { companyId?: string }) {
  useEffect(() => {
    if (!companyId) return;

    // Connect to our MongoDB-backed Server-Sent Events endpoint
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      eventSource = new EventSource('/api/realtime/notifications');
    
    eventSource.onmessage = (event) => {
      try {
        const newNotifs = JSON.parse(event.data);
        if (newNotifs && newNotifs.length > 0) {
          // Dispatch a custom event so any UI component (like TopNavbar) can react instantly
          window.dispatchEvent(new CustomEvent('new-notifications', { detail: newNotifs }));
        }
      } catch (e) {
        console.error("Realtime parsing error:", e);
      }
    };

      eventSource.onerror = () => {
        eventSource?.close();
        if (!stopped) reconnectTimer = setTimeout(connect, 1000);
      };
    };

    connect();

    // Cleanup subscription on unmount to prevent memory leaks and duplicate listeners
    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      eventSource?.close();
    };
  }, [companyId]);
  
  return null;
}
