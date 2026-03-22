"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  DynamicIslandProvider,
  DynamicIsland,
  DynamicContainer,
  DynamicDiv,
  useDynamicIslandSize,
  type SizePresets,
} from "~/components/ui/DynamicIsland"

type Notification = {
  id: number
  icon: string
  text: string
  color: string
}

function IslandContent({ notification }: { notification: Notification | null }) {
  const { setSize, scheduleAnimation } = useDynamicIslandSize()
  const prevNotifId = useRef<number | null>(null)

  useEffect(() => {
    if (notification && notification.id !== prevNotifId.current) {
      prevNotifId.current = notification.id
      scheduleAnimation([
        { size: "compactLong" as SizePresets, delay: 0 },
        { size: "default" as SizePresets, delay: 2200 },
        { size: "empty" as SizePresets, delay: 600 },
      ])
    }
  }, [notification, scheduleAnimation, setSize])

  if (!notification) return null

  return (
    <DynamicContainer className="flex items-center justify-center h-full w-full px-4">
      <DynamicDiv className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg" style={{ color: notification.color }}>
          {notification.icon}
        </span>
        <span className="text-white font-bold text-sm whitespace-nowrap">{notification.text}</span>
      </DynamicDiv>
    </DynamicContainer>
  )
}

type NotificationIslandRef = {
  show: (icon: string, text: string, color?: string) => void
}

const NotificationIslandContext = React.createContext<NotificationIslandRef | null>(null)

export function useNotificationIsland() {
  return React.useContext(NotificationIslandContext)
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) && !(ua.includes("Macintosh") && !("ontouchend" in document))
  const isStandalone = "standalone" in navigator || window.matchMedia("(display-mode: standalone)").matches
  // Only show on actual iOS devices, ideally in PWA mode
  return isIOS && ("ontouchend" in document) && (isStandalone || ua.includes("iPhone"))
}

export function NotificationIslandProvider({ children }: { children: React.ReactNode }) {
  const [isIOS, setIsIOS] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const idRef = useRef(0)

  useEffect(() => {
    setIsIOS(isIOSDevice())
  }, [])

  const show = useCallback((icon: string, text: string, color = "#c9b183") => {
    idRef.current += 1
    setNotification({ id: idRef.current, icon, text, color })
  }, [])

  const ref = useRef<NotificationIslandRef>({ show })
  ref.current.show = show

  return (
    <NotificationIslandContext.Provider value={ref.current}>
      {isIOS && (
        <div className="fixed top-2 left-0 right-0 z-[300] flex justify-center pointer-events-none">
          <DynamicIslandProvider initialSize={"empty" as SizePresets}>
            <DynamicIsland id="notification-island">
              <IslandContent notification={notification} />
            </DynamicIsland>
          </DynamicIslandProvider>
        </div>
      )}
      {children}
    </NotificationIslandContext.Provider>
  )
}
