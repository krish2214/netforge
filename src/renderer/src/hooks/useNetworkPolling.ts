import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

const POLL_INTERVAL_MS = 5000

/** Keeps the interface list and their latency readouts fresh while a screen that shows them is mounted —
 * e.g. so plugging in a phone over USB, or losing Wi-Fi, is reflected without the user restarting NetForge. */
export function useNetworkPolling(enabled: boolean): void {
  const loadInterfaces = useAppStore((store) => store.loadInterfaces)
  const refreshLatencies = useAppStore((store) => store.refreshLatencies)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const tick = async (): Promise<void> => {
      await loadInterfaces()
      if (!cancelled) await refreshLatencies()
    }
    void tick()
    const interval = setInterval(tick, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [enabled, loadInterfaces, refreshLatencies])
}
