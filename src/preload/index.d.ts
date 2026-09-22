import type { NetForgeApi } from './index'

declare global {
  interface Window {
    netforge: NetForgeApi
  }
}
