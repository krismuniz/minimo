import { $ } from './dom-utils.js'
import { settings, syncStorage, initInstallation } from './services/storage.js'
import { onColorSchemeChange } from './services/system.js'

export const setTheme = (theme) => {
  $('html').className = Array.from($('html').classList)
    .filter((c) => !c.startsWith('theme-'))
    .join(' ')
  $('html').classList.add('theme-' + theme)
}

export const setMode = (mode) => {
  $('html').className = Array.from($('html').classList)
    .filter((c) => !c.startsWith('mode-'))
    .join(' ')
  $('html').classList.add('mode-' + mode)

  if ($('summary')) {
    // hack: fixes issue with summary not changing color
    $('summary').click()
    $('summary').click()
  }
}

export const setFavicons = (state) => {
  $('html').className = Array.from($('html').classList)
    .filter((c) => !c.startsWith('favicons-'))
    .join(' ')
  $('html').classList.add('favicons-' + state)
}

export const setPrefers = (mode) => {
  $('html').className = Array.from($('html').classList)
    .filter((c) => !c.startsWith('prefers-'))
    .join(' ')
  $('html').classList.add('prefers-' + mode)
}

export const setCss = (css) => {
  $('#custom-style').textContent = css
}

export const setAppearance = (appearance) => {
  // custom styles can only be added after all DOM contents have been loaded :(
  document.addEventListener('DOMContentLoaded', () => {
    if (appearance.css) setCss(appearance.css)
  })

  if (appearance.mode) setMode(appearance.mode)
  if (appearance.theme) setTheme(appearance.theme)
  if (appearance.favicons) setFavicons(appearance.favicons)
}

export const loadAppearance = async () => {
  // Load from local storage first
  const localSettings = {
    mode: settings.get('mode'),
    theme: settings.get('theme'),
    favicons: settings.get('favicons'),
    timeformat: settings.get('timeformat'),
    battery: settings.get('battery'),
    css: settings.get('css')
  }

  setAppearance(localSettings)

  // Then load from sync storage and merge
  const syncedSettings = await syncStorage.getAllSettings()

  // Save synced settings to local storage
  for (const [key, value] of Object.entries(syncedSettings)) {
    settings.set(key, value)
  }

  // Apply synced appearance
  setAppearance(syncedSettings)
}

export function initTheme() {
  // Set up color scheme preference listener
  onColorSchemeChange(setPrefers)

  // Track installation
  initInstallation()

  // Load appearance settings
  loadAppearance()
}
