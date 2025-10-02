import { IS_MAC } from './constants.js'
import { $ } from './dom-utils.js'
import { setMode, setTheme, setCss, setFavicons } from './theme.js'
import { refreshDate } from './time-display.js'
import { loadSyncedTabs } from './synced-tabs.js'
import {
  settings,
  syncStorage,
  getWritingModeShortcut,
  isWelcomeDismissed,
  dismissWelcome
} from './services/storage.js'
import { isValidTimezone } from './services/system.js'

export const toggleWelcomeDialog = () => {
  if (!isWelcomeDismissed()) {
    setTimeout(() => {
      $('#welcome-dialog').classList.remove('hidden')
      $('#welcome-dialog').classList.add('animate')
    }, 1000)
  }

  $('#welcome-done-button').addEventListener('click', () => {
    $('#welcome-dialog').classList.add('hidden')
    $('#welcome-dialog').classList.remove('animate')
    dismissWelcome()
  })
}

export const setupSettingsDialog = () => {
  const modeInput = $('#settings-mode-input')
  const themeInput = $('#settings-theme-input')
  const faviconsInput = $('#settings-favicons-input')
  const timeformatInput = $('#settings-timeformat-input')
  const batteryInput = $('#settings-battery-input')
  const connectionInput = $('#settings-connection-input')
  const devicesInput = $('#settings-devices-input')
  const cssTextarea = $('#settings-css-textarea')
  const doneButton = $('#settings-done-button')

  // keyboard shortcut overrides
  const writingModeShortcutInput = $('#settings-writing-mode-shortcut-input')

  syncStorage.getAllSettings().then((syncedSettings) => {
    let preset = {
      mode: settings.get('mode'),
      theme: settings.get('theme'),
      css: settings.get('css'),
      favicons: settings.get('favicons'),
      timeformat: settings.get('timeformat'),
      battery: settings.get('battery'),
      connection: settings.get('connection'),
      devices: settings.get('devices'),
      writingModeShortcut: getWritingModeShortcut(),
      ...syncedSettings
    }

    // # set up dialog
    $('#settings-mode-input option').removeAttribute('selected')
    $(`#settings-mode-input option[value='${preset.mode}']`).setAttribute('selected', 'selected')

    $('#settings-theme-input option').removeAttribute('selected')
    $(`#settings-theme-input option[value='${preset.theme}']`).setAttribute('selected', 'selected')

    $('#settings-favicons-input').removeAttribute('checked')
    if (preset.favicons === 'show') {
      $(`#settings-favicons-input`).setAttribute('checked', 'checked')
    }

    $('#settings-timeformat-input option').removeAttribute('selected')
    $(`#settings-timeformat-input option[value='${preset.timeformat}']`).setAttribute(
      'selected',
      'selected'
    )

    $('#settings-battery-input').removeAttribute('checked')
    if (preset.battery === 'show') {
      $(`#settings-battery-input`).setAttribute('checked', 'checked')
    }

    $('#settings-connection-input').removeAttribute('checked')
    if (preset.connection === 'show') {
      $('#settings-connection-input').setAttribute('checked', 'checked')
    }

    $('#settings-devices-input').removeAttribute('checked')
    if (preset.devices === 'show') {
      $('#settings-devices-input').setAttribute('checked', 'checked')
    }

    $('#settings-writing-mode-shortcut-input').value = preset.writingModeShortcut
    $('#settings-css-textarea').value = preset.css
  })

  modeInput.addEventListener('change', async (ev) => {
    await syncStorage.saveSetting('mode', ev.target.value)
    setMode(ev.target.value)
  })

  themeInput.addEventListener('change', async (ev) => {
    await syncStorage.saveSetting('theme', ev.target.value)
    setTheme(ev.target.value)
  })

  writingModeShortcutInput.addEventListener(
    'keydown',
    modikeys((shortcut, event) => {
      settings.set('writingModeShortcut', shortcut)
      event.target.value = shortcut
    })
  )

  cssTextarea.addEventListener('change', async (ev) => {
    await syncStorage.saveSetting('css', ev.target.value)
    setCss(ev.target.value)
  })

  faviconsInput.addEventListener('change', async (ev) => {
    const value = ev.target.checked ? 'show' : 'hide'
    await syncStorage.saveSetting('favicons', value)
    setFavicons(value)
  })

  timeformatInput.addEventListener('change', async (ev) => {
    await syncStorage.saveSetting('timeformat', ev.target.value)
    refreshDate()
  })

  batteryInput.addEventListener('change', async (ev) => {
    const value = ev.target.checked ? 'show' : 'hide'
    await syncStorage.saveSetting('battery', value)
  })

  connectionInput.addEventListener('change', async (ev) => {
    const value = ev.target.checked ? 'show' : 'hide'
    await syncStorage.saveSetting('connection', value)
  })

  devicesInput.addEventListener('change', async (ev) => {
    const value = ev.target.checked ? 'show' : 'hide'
    await syncStorage.saveSetting('devices', value)
    loadSyncedTabs()
  })

  doneButton.addEventListener('click', () => {
    $('.overlay').classList.add('hidden')
    $('#settings-dialog').classList.add('hidden')
    $('#settings-dialog').classList.remove('animate')
  })
}

export const timezonePrompt = (name, timezone, type = '', callback) => {
  const dialog = $('#tz-dialog')
  const overlay = $('.overlay')

  overlay.classList.remove('hidden')
  dialog.classList.remove('hidden')
  dialog.classList.add('animate')

  $('#tz-dialog-title').textContent = `${type === 'add' ? 'Add' : 'Edit'} time zone`
  $('#tz-name-input').value = name
  $('#tz-timezone-input').value = timezone

  $('#tz-name-input').focus()

  const hideDialog = () => {
    dialog.classList.remove('animate')
    dialog.classList.add('hidden')
    overlay.classList.add('hidden')
    removeHandlers()
  }

  const saveHandler = () => {
    const name = $('#tz-name-input').value
    const timezone = $('#tz-timezone-input')
      .value.replace(/\s\/\s/g, '/')
      .replace(/\s/g, '_')

    $('#tz-name-feedback').textContent = ''
    $('#tz-timezone-feedback').textContent = ''

    if (!name || !timezone) {
      $('#tz-name-feedback').textContent = !name ? 'Please provide a friendly name' : ''
      $('#tz-timezone-feedback').textContent = !timezone ? 'Please select a time zone' : ''
      return
    }

    if (!isValidTimezone(timezone)) {
      $('#tz-timezone-feedback').textContent = 'Sorry, that time zone is not a valid time zone'
      return
    }

    callback({ name, timezone })
    hideDialog()
  }

  const keyHandler = (e) => {
    if (!e.code) return
    switch (e.code.toLowerCase()) {
      case 'enter': {
        saveHandler()
        break
      }
      case 'escape': {
        hideDialog()
        break
      }
      default:
        return
    }
  }

  const removeHandlers = () => {
    $('#tz-save-button').removeEventListener('click', saveHandler)
    $('#tz-cancel-button').removeEventListener('click', hideDialog)
    dialog.removeEventListener('keydown', keyHandler)
  }

  dialog.addEventListener('keydown', keyHandler)

  $('#tz-save-button').addEventListener('click', saveHandler)
  $('#tz-cancel-button').addEventListener('click', hideDialog)
}

export const shortcutPrompt = (title, url, type = 'edit', callback) => {
  const dialog = $('#shortcut-dialog')
  const overlay = $('.overlay')

  overlay.classList.remove('hidden')
  dialog.classList.remove('hidden')
  dialog.classList.add('animate')

  $('#shortcut-dialog-title').textContent = `${type === 'add' ? 'Add' : 'Edit'} shortcut`
  $('#shortcut-name-input').value = title
  $('#shortcut-url-input').value = url

  $('#shortcut-name-input').focus()

  const hideDialog = () => {
    dialog.classList.remove('animate')
    dialog.classList.add('hidden')
    overlay.classList.add('hidden')
    removeHandlers()
  }

  const saveHandler = () => {
    const title = $('#shortcut-name-input').value
    const url = $('#shortcut-url-input').value

    $('#shortcut-name-feedback').textContent = ''
    $('#shortcut-url-feedback').textContent = ''

    if (!title || !url) {
      $('#shortcut-name-feedback').textContent = !title ? 'Please provide a name' : ''
      $('#shortcut-url-feedback').textContent = !url ? 'Please provide a URL' : ''
      return
    }

    try {
      new URL(url)
      callback({ title, url })
      removeHandlers()
    } catch (e) {
      $('#shortcut-url-feedback').textContent = 'That is an invalid URL'
      return
    }
    hideDialog()
  }

  const keyHandler = (e) => {
    if (!e.code) return
    switch (e.code.toLowerCase()) {
      case 'enter': {
        saveHandler()
        break
      }
      case 'escape': {
        hideDialog()
        break
      }
      default:
        return
    }
  }

  const removeHandlers = () => {
    $('#shortcut-save-button').removeEventListener('click', saveHandler)
    $('#shortcut-cancel-button').removeEventListener('click', hideDialog)
    dialog.removeEventListener('keydown', keyHandler)
  }

  dialog.addEventListener('keydown', keyHandler)

  $('#shortcut-save-button').addEventListener('click', saveHandler)
  $('#shortcut-cancel-button').addEventListener('click', hideDialog)
}

export const showSettingsPrompt = () => {
  $('.overlay').classList.remove('hidden')
  $('#settings-dialog').classList.remove('hidden')
  $('#settings-dialog').classList.add('animate')
}

export function initDialogs() {
  setupSettingsDialog()
  toggleWelcomeDialog()
}
