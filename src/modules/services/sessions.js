/**
 * Sessions Service - Chrome Sessions API wrapper
 * Handles remote device tabs and session restoration
 */

import { signal } from '../preact.js'

// Reactive state
export const remoteTabsSignal = signal([])

/**
 * Get all remote devices with their tabs
 * @returns {Promise<Array>}
 */
export function getDevices() {
  return new Promise((resolve) => {
    chrome.sessions.getDevices((devices) => {
      resolve(devices || [])
    })
  })
}

/**
 * Get all remote tabs flattened from all devices
 * @param {Object} options - Filter options
 * @param {boolean} options.excludeNewTabs - Exclude chrome://newtab/ (default: true)
 * @returns {Promise<Array>}
 */
export async function getRemoteTabs(options = {}) {
  const { excludeNewTabs = true } = options
  const devices = await getDevices()

  const tabs = devices.reduce((allTabs, device) => {
    const deviceTabs = device.sessions.reduce((sessionTabs, session) => {
      const windowTabs = session.window.tabs.map((tab) => ({
        ...tab,
        deviceName: device.deviceName
      }))
      return sessionTabs.concat(windowTabs)
    }, [])

    return allTabs.concat(deviceTabs)
  }, [])

  const filteredTabs = excludeNewTabs ? tabs.filter((tab) => tab.url !== 'chrome://newtab/') : tabs

  // Update signal
  remoteTabsSignal.value = filteredTabs

  return filteredTabs
}

/**
 * Restore a session/tab
 * @param {string} sessionId - Session ID to restore
 * @returns {Promise<Object>}
 */
export function restoreSession(sessionId) {
  return new Promise((resolve) => {
    chrome.sessions.restore(sessionId, (session) => {
      resolve(session)
    })
  })
}

/**
 * Create a hash of tab URLs for change detection
 * @param {Array} tabs - Array of tab objects
 * @returns {string}
 */
export function createTabsHash(tabs) {
  return tabs.reduce((hash, tab) => hash + ':' + tab.url, '')
}

// Poll for tab updates every second
setInterval(() => {
  getRemoteTabs()
}, 1000)
