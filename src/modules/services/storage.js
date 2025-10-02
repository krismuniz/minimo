/**
 * Storage Service - Unified interface for localStorage and chrome.storage.sync
 * Provides type-safe getters/setters with defaults and automatic JSON handling
 */

import { signal } from '../preact.js'

// Reactive state for timezones
export const timezonesSignal = signal([])

const DEFAULTS = {
  // Appearance
  mode: 'system',
  theme: 'smooth-dark',
  css: '',
  favicons: 'hide',

  // Display options
  timeformat: '12',
  battery: 'show',
  connection: 'show',
  devices: 'show',

  // Editor
  editor: null,
  writingModeShortcut: null, // Platform-specific default set at runtime

  // Data
  timezones: [],

  // Flags
  welcomeDismissed: null,
  installed: null
}

/**
 * Settings Manager - localStorage with defaults
 */
class SettingsManager {
  get(key) {
    const value = localStorage.getItem(key)
    if (value === null) {
      return DEFAULTS[key]
    }

    // Parse JSON for complex types
    if (key === 'timezones' || key === 'editor') {
      try {
        return JSON.parse(value)
      } catch (e) {
        return DEFAULTS[key]
      }
    }

    return value
  }

  set(key, value) {
    // Stringify JSON for complex types
    if (key === 'timezones' || key === 'editor') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  // Specialized getters with type conversion
  getBoolean(key) {
    return this.get(key) === 'show'
  }

  setBoolean(key, value) {
    this.set(key, value ? 'show' : 'hide')
  }

  getNumber(key) {
    const value = this.get(key)
    return value ? Number(value) : DEFAULTS[key]
  }

  getJSON(key) {
    const value = localStorage.getItem(key)
    if (!value) return DEFAULTS[key]
    try {
      return JSON.parse(value)
    } catch (e) {
      return DEFAULTS[key]
    }
  }

  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

/**
 * Sync Storage Manager - chrome.storage.sync wrapper
 */
class SyncStorageManager {
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve)
    })
  }

  set(items) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, resolve)
    })
  }

  /**
   * Get all settings from sync storage and merge with local defaults
   */
  async getAllSettings() {
    const keys = [
      'theme',
      'mode',
      'css',
      'favicons',
      'timeformat',
      'battery',
      'connection',
      'devices'
    ]
    const syncSettings = await this.get(keys)

    // Merge with local settings (local takes precedence if sync is empty)
    const merged = {}
    for (const key of keys) {
      merged[key] = syncSettings[key] || settings.get(key)
    }

    return merged
  }

  /**
   * Save a setting to both sync and local storage
   */
  async saveSetting(key, value) {
    await this.set({ [key]: value })
    settings.set(key, value)
  }
}

// Export singleton instances
export const settings = new SettingsManager()
export const syncStorage = new SyncStorageManager()

/**
 * Helper functions for common patterns
 */

// Get with platform-specific defaults
export function getWritingModeShortcut() {
  const isMac = window.navigator.platform.indexOf('Mac') !== -1
  return settings.get('writingModeShortcut') || (isMac ? 'shift+command' : 'ctrl+shift')
}

// Initialize installation tracking
export function initInstallation() {
  if (!settings.get('installed')) {
    settings.set('installed', Date.now())
  }
}

// Timezones helpers
export function getTimezones() {
  const timezones = settings.getJSON('timezones') || []
  timezonesSignal.value = timezones
  return timezones
}

export function setTimezones(timezones) {
  settings.setJSON('timezones', timezones)
  timezonesSignal.value = timezones
}

export function addTimezone(name, timezone) {
  const timezones = getTimezones()
  const newTimezone = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    timezone
  }
  setTimezones([...timezones, newTimezone])
  return newTimezone
}

export function updateTimezone(id, name, timezone) {
  const timezones = getTimezones()
  setTimezones(timezones.map((tz) => (tz.id === id ? { id, name, timezone } : tz)))
}

export function deleteTimezone(id) {
  const timezones = getTimezones()
  setTimezones(timezones.filter((tz) => tz.id !== id))
}

export function moveTimezone(id, toIndex) {
  const timezones = getTimezones()
  const fromIndex = timezones.findIndex((tz) => tz.id === id)

  if (fromIndex === -1) return

  const reordered = [...timezones]
  const [item] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, item)

  setTimezones(reordered.filter(Boolean))
}

// Editor content helpers
export function getEditorContent() {
  return settings.getJSON('editor')
}

export function setEditorContent(content) {
  settings.setJSON('editor', content)
}

// Welcome dialog
export function isWelcomeDismissed() {
  return settings.get('welcomeDismissed') !== null
}

export function dismissWelcome() {
  settings.set('welcomeDismissed', Date.now())
}

// Initialize timezones signal
getTimezones()
