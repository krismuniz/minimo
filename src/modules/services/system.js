/**
 * System Service - Browser and system information abstraction
 * Provides access to platform, network, battery, and other system APIs
 */

import { signal, computed } from '../preact.js'

// Reactive state
export const currentTimeSignal = signal(new Date())
export const batterySignal = signal({ level: 0, charging: false, formatted: 'N/A' })
export const connectionSignal = signal({ speed: 0, online: true, formattedSpeed: 'N/A' })

/**
 * Get the user's language/locale
 * @returns {string}
 */
export function getLanguage() {
  return navigator.language
}

/**
 * Get the platform string
 * @returns {string}
 */
export function getPlatform() {
  return window.navigator.platform
}

/**
 * Check if running on macOS
 * @returns {boolean}
 */
export function isMac() {
  return getPlatform().indexOf('Mac') !== -1
}

/**
 * Check if running on Windows
 * @returns {boolean}
 */
export function isWindows() {
  return getPlatform().indexOf('Win') !== -1
}

/**
 * Get network connection information
 * @returns {Object} {speed: number, online: boolean}
 */
export function getConnectionInfo() {
  const speed = navigator.connection?.downlink || 0
  const online = navigator.onLine

  const info = {
    speed,
    online,
    formattedSpeed: online ? (speed === 10 ? '> ' + speed : '~' + speed) + ' Mbps' : 'Offline'
  }

  // Update signal
  connectionSignal.value = info

  return info
}

/**
 * Check if online
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Get battery information
 * @returns {Promise<Object>} {level: number, charging: boolean, formatted: string}
 */
export async function getBatteryInfo() {
  try {
    const battery = await navigator.getBattery()
    const level = (battery.level * 100).toFixed()
    const charging = battery.charging

    const info = {
      level: Number(level),
      charging,
      formatted: `${level}% ${charging ? 'Charging' : 'Battery'}`
    }

    // Update signal
    batterySignal.value = info

    return info
  } catch (error) {
    console.error('Battery API not available:', error)
    return {
      level: 0,
      charging: false,
      formatted: 'N/A'
    }
  }
}

/**
 * Get preferred color scheme (light or dark)
 * @returns {string} 'light' or 'dark'
 */
export function getPreferredColorScheme() {
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  return darkQuery.matches ? 'dark' : 'light'
}

/**
 * Subscribe to color scheme changes
 * @param {Function} callback - Called with 'light' or 'dark'
 * @returns {Function} Unsubscribe function
 */
export function onColorSchemeChange(callback) {
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (event) => {
    callback(event.matches ? 'dark' : 'light')
  }

  darkQuery.addEventListener('change', handler)

  // Call immediately with current value
  callback(darkQuery.matches ? 'dark' : 'light')

  // Return unsubscribe function
  return () => {
    darkQuery.removeEventListener('change', handler)
  }
}

/**
 * Format a date for display
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }

  return date.toLocaleDateString(getLanguage(), { ...defaultOptions, ...options })
}

/**
 * Format time for a timezone
 * @param {Date} date - Date to format
 * @param {string} timezone - IANA timezone identifier
 * @param {boolean} hour12 - Use 12-hour format
 * @returns {string}
 */
export function formatTimeForTimezone(date, timezone, hour12 = true) {
  return date.toLocaleTimeString(getLanguage(), {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timezone,
    hour12: hour12 === '12' || hour12 === true
  })
}

/**
 * Get timezone list from global
 * @returns {Array<string>}
 */
export function getTimezoneList() {
  return window.tzList || []
}

/**
 * Validate a timezone identifier
 * @param {string} timezone - IANA timezone identifier
 * @returns {boolean}
 */
export function isValidTimezone(timezone) {
  return getTimezoneList().includes(timezone)
}

// Update time, battery, and connection signals every second
setInterval(() => {
  currentTimeSignal.value = new Date()
  getConnectionInfo()
  getBatteryInfo()
}, 1000)
