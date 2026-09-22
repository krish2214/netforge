import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

/** Subscribes once to main-process download progress pushes for the lifetime of the app. */
export function useDownloadEvents(): void {
  const setCurrentDownload = useAppStore((store) => store.setCurrentDownload)

  useEffect(() => {
    let disposed = false
    const unsubscribe = window.netforge.onDownloadUpdated(setCurrentDownload)

    void window.netforge
      .getCurrentDownload()
      .then((download) => {
        if (!disposed && download) setCurrentDownload(download)
      })
      .catch(() => {})

    return () => {
      disposed = true
      unsubscribe()
    }
  }, [setCurrentDownload])
}
