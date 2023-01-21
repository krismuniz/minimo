const store = chrome.storage.sync

const SHORTCUTS_FOLDER = 'Shortcuts'
const IS_MAC = window.navigator.platform.indexOf('Mac') !== -1
const today = new Date()

const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="nc-icon-wrapper" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" transform="translate(0.5 0.5)" stroke="currentColor"><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M10,23H3 c-1.105,0-2-0.895-2-2V3c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2v7"/> <circle data-stroke="none" cx="9" cy="18" r="1" stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M14.126,17 c0.444-1.725,2.01-3,3.874-3c1.48,0,2.772,0.804,3.464,1.999"/> <polygon data-color="color-2" data-stroke="none" points="23.22,13.649 22.792,18 18.522,17.061 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M21.874,20 c-0.444,1.725-2.01,3-3.874,3c-1.48,0-2.772-0.804-3.464-1.999"/> <polygon data-color="color-2" data-stroke="none" points="12.78,23.351 13.208,19 17.478,19.939 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/></g></svg>'

const showEditor = () => {
  $('#editor-container').classList.remove('hidden')
  $('#editor-container').classList.add('animate')
  $('.layout').classList.remove('animate-land')
  quill.focus()
}

const hideEditor = () => {
  quill.blur()
  $('#editor-container').classList.add('hidden')
  $('#editor-container').classList.remove('animate')

  setTimeout(() => {
    $('.layout').classList.remove('animate-land')
  }, 100)
  $('.layout').classList.add('animate-land')
}

const toggleEditor = () => {
  if ($('#editor-container').classList.contains('hidden')) {
    showEditor()
  } else {
    hideEditor()
  }
}

const toggleWelcomeDialog = () => {
  const dismissed = localStorage.getItem('welcome-dismissed')

  if (!dismissed) {
    setTimeout(() => {
      $('#welcome-dialog').classList.remove('hidden')
      $('#welcome-dialog').classList.add('animate')
    }, 1000)
  }

  $('#welcome-done-button').addEventListener('click', () => {
    $('#welcome-dialog').classList.add('hidden')
    $('#welcome-dialog').classList.remove('animate')
    localStorage.setItem('welcome-dismissed', Date.now())
  })
}

const setupSettingsDialog = () => {
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

  store.get(['theme', 'mode', 'css', 'favicons', 'timeformat', 'battery', 'connection', 'devices'], (settings) => {
    let preset = {
      mode: localStorage.getItem('mode') || 'system',
      theme: localStorage.getItem('theme') || 'smooth-dark',
      css: localStorage.getItem('css') || '',
      favicons: localStorage.getItem('favicons') || 'hide',
      timeformat: localStorage.getItem('timeformat') || '12',
      battery: localStorage.getItem('battery') || 'show',
      connection: localStorage.getItem('connection') || 'show',
      devices: localStorage.getItem('devices') || 'show',
      writingModeShortcut: localStorage.getItem('writing-mode-shortcut') || (IS_MAC ? 'shift+command' : 'ctrl+shift'),
      ...settings
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
    $(`#settings-timeformat-input option[value='${preset.timeformat}']`).setAttribute('selected', 'selected')

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

  modeInput.addEventListener('change', (ev) => {
    store.set({ mode: ev.target.value }, () => {
      localStorage.setItem('mode', ev.target.value)
      setMode(ev.target.value)
    })
  })

  themeInput.addEventListener('change', (ev) => {
    store.set({ theme: ev.target.value }, () => {
      localStorage.setItem('theme', ev.target.value)
      setTheme(ev.target.value)
    })
  })

  writingModeShortcutInput.addEventListener('keydown', modikeys(
    (shortcut, event) => {
      localStorage.setItem('writing-mode-shortcut', shortcut)
      event.target.value = shortcut
    }
  ))

  cssTextarea.addEventListener('change', (ev) => {
    store.set({ css: ev.target.value }, () => {
      localStorage.setItem('css', ev.target.value)
      setCss(ev.target.value)
    })
  })

  faviconsInput.addEventListener('change', (ev) => {
    store.set({ favicons: ev.target.checked ? 'show' : 'hide' }, () => {
      localStorage.setItem('favicons', ev.target.checked ? 'show' : 'hide')
      setFavicons(ev.target.checked ? 'show' : 'hide')
    })
  })

  timeformatInput.addEventListener('change', (ev) => {
    store.set({ timeformat: ev.target.value }, () => {
      localStorage.setItem('timeformat', ev.target.value)
      refreshDate()
    })
  })

  batteryInput.addEventListener('change', (ev) => {
    store.set({ battery: ev.target.checked ? 'show' : 'hide' }, () => {
      localStorage.setItem('battery', ev.target.checked ? 'show' : 'hide')
    })
  })

  connectionInput.addEventListener('change', (ev) => {
    store.set({ connection: ev.target.checked ? 'show' : 'hide' }, () => {
      localStorage.setItem('connection', ev.target.checked ? 'show' : 'hide')
    })
  })

  devicesInput.addEventListener('change', (ev) => {
    store.set({ connection: ev.target.checked ? 'show' : 'hide' }, () => {
      localStorage.setItem('devices', ev.target.checked ? 'show' : 'hide')
      loadSyncedTabs()
    })
  })

  doneButton.addEventListener('click', () => {
    $('.overlay').classList.add('hidden')
    $('#settings-dialog').classList.add('hidden')
    $('#settings-dialog').classList.remove('animate')
  })
}

const addShortcut = (title, url) => {
  chrome.bookmarks.getSubTree('1', (tree) => {
    let folder = tree[0].children.find(v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase())

    if (folder) {
      chrome.bookmarks.create({
        title,
        url,
        parentId: folder.id
      })
      return
    }

    chrome.bookmarks.create({
      title: SHORTCUTS_FOLDER,
      parentId: '1'
    }, () => {
      let folder = tree[0].children.find(v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase())

      chrome.bookmarks.create({
        title,
        url,
        parentId: folder.id
      })
    })
  })
}

const moveShortcut = (id, index) => {
  chrome.bookmarks.getSubTree('1', (tree) => {
    let folder = tree[0].children.find(v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase())

    if (folder) {
      chrome.bookmarks.move(id, {
        parentId: folder.id,
        index
      })
      return
    }
  })
}

const editShortcut = (id, title, url) => {
  chrome.bookmarks.update(id, { title, url })
}

const addTZ = (name, timezone) => {
  const timezones = JSON.parse(localStorage.getItem('timezones')) || []
  
  localStorage.setItem(
    'timezones',
    JSON.stringify(
      [ ...timezones, { id: Math.random().toString(36).substr(2, 9), name, timezone } ]
    )
  )
}

const editTZ = (id, name, timezone) => {
  const timezones = JSON.parse(localStorage.getItem('timezones')) || []

  localStorage.setItem('timezones', JSON.stringify(
    timezones.map(
      (v) => {
        return v.id === id ? { id, name, timezone } : v
      }
    )
  ))
}

const moveTZ = (id, to) => {
  const timezones = JSON.parse(localStorage.getItem('timezones')) || []
  const from = timezones.map((v) => v.id).indexOf(id)

  console.log(timezones)
  timezones.splice(to, 0, timezones.splice(from, 1)[0])
  console.log(timezones)
  localStorage.setItem(
    'timezones',
    JSON.stringify(
      timezones.filter(Boolean)
    )
  )
}

const deleteTZ = (id) => {
  const timezones = JSON.parse(localStorage.getItem('timezones')) || []
  localStorage.setItem(
    'timezones',
    JSON.stringify(
      timezones.filter((v) => v.id !== id)
    )
  )
}

const formatTime = (date) => {
  const timeformat = localStorage.getItem('timeformat') || '12'
  const h = date.getHours()
  const m = date.getMinutes()
  const hours = timeformat === '12'
    ? h === 0 || h === 12 ? '12' : h % 12
    : h
  const minutes = m < 10 ? '0' + m : m

  return `${hours}:${minutes}`
}

const refreshDate = async () => {
  const date = new Date()
  let status = ''

  const showConnection = !localStorage.getItem('connection') || localStorage.getItem('connection') === 'show'
  const showBattery = !localStorage.getItem('battery') || localStorage.getItem('battery') === 'show'
  const hour12 = localStorage.getItem('timeformat') && localStorage.getItem('timeformat') !== '12' ? false : '12'
  const timezones = JSON.parse(localStorage.getItem('timezones')) || []

  $('.time').textContent = formatTime(date)
  $('.date').textContent = date.toLocaleDateString(navigator.language, { weekday: 'long', month: 'long', day: 'numeric' })

  if (showConnection) {
    const speed = navigator.connection.downlink

    const connection = navigator.onLine
      ? (speed === 10 ? '> ' + speed : '~' + speed) + ' Mbps'
      : 'Offline'

    status += connection
  }

  if (showBattery) {
    const battery = await navigator.getBattery()
    const batteryHealth = (battery.level * 100).toFixed() + '% ' + (battery.charging ? 'Charging' : 'Battery')

    status += status.length > 0
      ? ' · ' + batteryHealth
      : batteryHealth
  }

  for (let zone of timezones) {
    const tz = $(`#tz-box .tz-clock[data-id="${zone.id}"]`)

    if (!tz) {
      $('#tz-box').appendChild(
        el(`div.tz-clock`, {
          'data-type': 'tz-clock',
          'data-timezone': zone.timezone,
          'data-name': zone.name,
          'data-id': zone.id
        }, [
          el('div.tz-name'),
          el('div.tz-time')
        ])
      )
    }
  }

  for (let tzClock of $('#tz-box').children) {
    const zone = timezones.find(({ id }) => id === tzClock.getAttribute('data-id'))

    const time = date.toLocaleTimeString(navigator.language, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: zone.timezone,
      hour12
    })

    if (zone) {
      tzClock.setAttribute('data-timezone', zone.timezone)
      tzClock.setAttribute('data-name', zone.name)
      tzClock.children[0].textContent = zone.name
      tzClock.children[1].textContent = time
    } else {
      tzClock.remove()
    }
  }

  $('.status').textContent = status
}

let syncedTabsHash = ''

const loadSyncedTabs = () => {
  const showTabs = !localStorage.getItem('devices') || localStorage.getItem('devices') && localStorage.getItem('devices') === 'show'

  if (!showTabs) {
    syncedTabsHash = ''
    $('.devices-box .tabs').innerHTML = ''
    return
  }

  chrome.sessions.getDevices((devices) => {
    let tabs = devices.reduce((p, device) => {
      return p.concat(
        device.sessions.reduce(
          (acc, session) => {
            return acc.concat(
              session.window.tabs.map(tab => ({ ...tab, deviceName: device.deviceName }))
            )
          },
          []
        )
      )
    }, []).filter(t => t.url !== 'chrome://newtab/')

    let currentHash = tabs.reduce((prev, curr) => {
      return prev += ':' + curr.url
    }, '') || ''

    // if something changed, re-render
    if (currentHash !== syncedTabsHash && tabs.length > 0) {
      let box = $('.devices-box .tabs')
      box.innerHTML = ''

      /* append icon */
      let icon = el('div.icon', { click: loadSyncedTabs })
      icon.innerHTML = iconSvg
      box.appendChild(icon)

      /* append (almost) every tab */
      for (let tab of tabs) {
        let element = el(
          'div.link.truncate',
          el(
            'div.favicon',
            el(
              'img',
              {
                src: `chrome://favicon/size/16@1x/${tab.url}`,
                srcset: `
                  chrome://favicon/size/16@1x/${tab.url},
                  chrome://favicon/size/16@2x/${tab.url} 2x
                `
              }
            )
          ),
          tab.deviceName + ' › ' + tab.title,
          {
            href: '#',
            title: tab.title,
            'data-type': 'shortcut',
            click: () => {
              chrome.sessions.restore(tab.sessionId)
            },
            dragstart: (event) => {
              event.dataTransfer.setData('text/plain', tab.url)
            }
          }
        )

        if (box.children.length < 5) {
          box.appendChild(element)
        }
      }

      syncedTabsHash = currentHash
    }
  })
}

const loadBookmarks = () => {
  chrome.bookmarks.getSubTree('1', (tree) => {
    const folder = tree[0].children.find(v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase())

    if (folder && folder.children.length > 0) {
      $('.bookmarks-box').innerHTML = ''

      for (let bookmark of folder.children) {
        $('.bookmarks-box').appendChild(
          el(
            'a.shortcut',
            el(
              'div.favicon',
              el(
                'img',
                {
                  src: `chrome://favicon/size/16@1x/${bookmark.url}`,
                  srcset: `
                    chrome://favicon/size/16@1x/${bookmark.url},
                    chrome://favicon/size/16@2x/${bookmark.url} 2x
                  `
                }
              )
            ),
            bookmark.title,
            {
              href: bookmark.url,
              title: bookmark.title,
              click: (e) => {
                if (e.metaKey === true || e.ctrlKey === true) return false
                // update current tab location with bookmark.url
                // in case a normal navigation event can't occur
                // e.g. opening chrome:// links
                chrome.tabs.getCurrent((tab) => {
                  chrome.tabs.update(tab.id, { url: bookmark.url })
                })
              },
              'data-icon': bookmark.favicon,
              'data-id': bookmark.id,
              'data-type': 'shortcut'
            }
          )
        )
      }
    } else {
      const box = $('.bookmarks-box')
      box.innerHTML = ''

      let message = el(
        'span',
        'You have no shortcuts.',
        el(
          'div.button.outlined',
          'Add a shortcut',
          {
            click: () => {
              shortcutPrompt('', '', 'add', ({ title, url }) => {
                addShortcut(title, url)
              })
            }
          }
        )
      )

      box.appendChild(message)
    }
  })
}

refreshDate()
loadBookmarks()
loadSyncedTabs()
setupSettingsDialog()

// refresh the clock
setInterval(refreshDate, 1000)

// periodically detect changes in synced tabs
setInterval(loadSyncedTabs, 1000)

// listen for Bookmarks events to update the view
chrome.bookmarks.onChanged.addListener(loadBookmarks)
chrome.bookmarks.onCreated.addListener(loadBookmarks)
chrome.bookmarks.onRemoved.addListener(loadBookmarks)
// chrome.bookmarks.onMoved.addListener(loadBookmarks)

const menu = $('.menu')
const body = $('body')

const toggleMenu = (command) => {
  switch (command) {
    case 'show':
      menu.classList.remove('hidden')
      break
    case 'hide':
      menu.classList.remove('animate')
      menu.classList.add('hidden')
      break
    default:
      return false
  }
}

const setPosition = ({ top, left }) => {
  toggleMenu('show')

  const bodyRect = body.getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()

  const adjustedLeft = bodyRect.width - left < menuRect.width
    ? left - menuRect.width
    : left

  const adjustedTop = bodyRect.height - top < menuRect.height
    ? top - menuRect.height
    : top
  
  menu.style.left = `${adjustedLeft}px`
  menu.style.top = `${adjustedTop}px`
  menu.classList.add('animate')
}

const setButtons = (buttons) => {
  const menu = $('.menu-options')
  menu.innerHTML = ''
  let tabIndex = 1

  for (let button of buttons) {
    switch (button.type) {
      case 'divider': {
        menu.appendChild(el('div.menu-divider'))
        break
      }
      default: {
        menu.appendChild(el(`li.menu-option${button.disabled ? '.disabled' : ''}`, button.title, { tabindex: tabIndex.toString(), click: button.onClick }))
      }
    }
    tabIndex++
  }
}

window.addEventListener('click', e => {
  if (!menu.classList.contains('hidden') && !(e.target.classList.contains('menu-option') && e.target.classList.contains('disabled'))) {
    toggleMenu('hide')
  }
})

window.addEventListener('blur', (event) => {
  if (!menu.classList.contains('hidden')) {
    toggleMenu('hide')
  }
})

const timezonePrompt = (name, timezone, type = '', callback) => {
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
    const timezone = $('#tz-timezone-input').value.replace(/\s\/\s/g, '/').replace(/\s/g, '_')

    $('#tz-name-feedback').textContent = ''
    $('#tz-timezone-feedback').textContent = ''

    if (!name || !timezone) {
      $('#tz-name-feedback').textContent = !name ? 'Please provide a friendly name' : ''
      $('#tz-timezone-feedback').textContent = !timezone ? 'Please select a time zone' : ''
      return
    }

    if (!window.tzList.includes(timezone)) {
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

const shortcutPrompt = (title, url, type = 'edit', callback) => {
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

const showSettingsPrompt = () => {
  $('.overlay').classList.remove('hidden')
  $('#settings-dialog').classList.remove('hidden')
  $('#settings-dialog').classList.add('animate')
}

window.addEventListener('contextmenu', async e => {
  toggleMenu('hide')

  const origin = {
    left: e.pageX,
    top: e.pageY
  }

  let buttons = []

  const eventPath = e.composedPath()

  const shortcutTarget = eventPath.find((element) => {
    return (element && element.getAttribute) && element.getAttribute('data-type') === 'shortcut' && element.getAttribute('data-id')
  })

  const tzTarget = eventPath.find((element) => {
    return (element, element.getAttribute) && element.getAttribute('data-type') === 'tz-clock' && element.getAttribute('data-id')
  })

  const bookmarkActions = [
    {
      title: 'Open in new tab',
      onClick: () => {
        chrome.tabs.create({
          url: shortcutTarget.href
        })
      }
    },
    {
      title: 'Open in new window',
      onClick: () => {
        chrome.windows.create({
          url: shortcutTarget.href
        })
      }
    },
    {
      title: 'Open in incognito window',
      onClick: () => {
        chrome.windows.create({
          url: shortcutTarget.href,
          incognito: true
        })
      }
    },
    {
      type: 'divider'
    },
    {
      title: 'Edit',
      onClick: () => {
        shortcutPrompt(shortcutTarget.title, shortcutTarget.href, 'edit', ({ title, url}) => {
          editShortcut(shortcutTarget.getAttribute('data-id'), title, url)
        })
      }
    },
    {
      title: 'Copy URL',
      onClick: () => {
        navigator.clipboard.writeText(shortcutTarget.href)
      }
    },
    {
      title: 'Delete',
      onClick: () => {
        chrome.bookmarks.remove(shortcutTarget.getAttribute('data-id'))
      }
    },
    {
      type: 'divider'
    },
    {
      title: 'Add shortcut',
      onClick: () => {
        shortcutPrompt('', '', 'add', ({ title, url }) => {
          addShortcut(title, url)
        })
      }
    }
  ]

  const switcher = [
    {
      title: $('#editor-container').classList.contains('hidden') ? 'Enter writing mode' : 'Exit writing mode',
      onClick: () => {
        toggleEditor()
      }
    }
  ]

  const quickAccess = [
    {
      title: 'History',
      onClick: () => {
        chrome.tabs.create({
          url: 'chrome://history'
        })
      }
    },
    {
      title: 'Downloads',
      onClick: () => {
        chrome.tabs.create({
          url: 'chrome://downloads'
        })
      }
    },
    {
      title: 'Bookmarks',
      onClick: () => {
        chrome.tabs.create({
          url: 'chrome://bookmarks'
        })
      }
    }
  ]

  const addShortcutItem = {
    title: 'Add shortcut',
    onClick: () => {
      shortcutPrompt('', '', 'add', ({ title, url }) => {
        addShortcut(title, url)
      })
    }
  }

  const addTimeZone = {
    title: 'Add time zone',
    onClick: () => {
      timezonePrompt('', '', 'add', ({ name, timezone }) => {
        addTZ(name, timezone)
        refreshDate()
      })
    }
  }

  const customization = [
    ($('#editor-container').classList.contains('hidden') ? addShortcutItem : false),
    ($('#editor-container').classList.contains('hidden') ? addTimeZone : false),
    {
      title: 'Change appearance',
      onClick: () => {
        showSettingsPrompt()
      }
    }
  ]

  const editingTools = [
    {
      title: 'Copy',
      disabled: document.getSelection().toString() === '' ? true : false,
      onClick: () => {
        if (document.getSelection().toString() !== '') document.execCommand('copy', false, null)
      }
    },
    {
      title: 'Cut',
      disabled: document.getSelection().toString() === '' ? true : false,
      onClick: () => {
        if (document.getSelection().toString() !== '') document.execCommand('cut', false, null)
      }
    },
    {
      title: 'Paste',
      onClick: async () => {
        const selection = quill.getSelection()
        const clipboardText = await navigator.clipboard.readText()

        quill.insertText(selection.index, clipboardText, 'user')
        quill.setSelection(selection.index + clipboardText.length)
      }
    },
    {
      title: 'Select All',
      onClick: async () => {
        quill.setSelection(0, Infinity)
      }
    }
  ]

  if (shortcutTarget) {
    buttons = buttons.concat(bookmarkActions)
  } else if (tzTarget) {
    buttons = buttons.concat(
      {
        title: 'Edit',
        onClick: () => {
          const id = tzTarget.getAttribute('data-id')
          const name = tzTarget.getAttribute('data-name')
          const timezone = tzTarget.getAttribute('data-timezone')
          timezonePrompt(name, timezone.replace(/\//g, ' / ').replace(/\_/g, ' '), 'edit', ({ name, timezone }) => {
            editTZ(id, name, timezone)
            refreshDate()
          })
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          deleteTZ(tzTarget.getAttribute('data-id'))
          tzTarget.remove()
          refreshDate()
        }
      },
      { type: 'divider' },
      addTimeZone
    )
  } else if (eventPath.filter(el => el.id === 'editor').length > 0) {
    buttons = buttons.concat([
      ...switcher,
      { type: 'divider' },
      ...editingTools,
      { type: 'divider' },
      ...customization
    ])
  } else {
    buttons = buttons.concat([
      ...switcher,
      { type: 'divider' },
      ...customization,
      { type: 'divider' },
      ...quickAccess
    ])
  }

  if (eventPath.filter(element => element.classList && element.classList.contains('overlay')).length === 0) {
    setButtons(buttons.filter(Boolean))
    setPosition(origin)
  }

  if (e.target.getAttribute('data-context-menu') !== 'default') {
    e.preventDefault()
    return false
  }
})

Sortable.create($('.bookmarks-box'), {
  animation: 200,
  dataIdAttr: 'data-sort-id',
  onEnd: (ev) => {
    moveShortcut(ev.item.getAttribute('data-id'), ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex)
  }
})

Sortable.create($('#tz-box'), {
  animation: 200,
  dataIdAttr: 'data-sort-id',
  onEnd: (ev) => {
    moveTZ(ev.item.getAttribute('data-id'), ev.newIndex)
  }
})

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['code'],
  [{ 'header': 1 }, { 'header': 2 }, 'blockquote'],
  ['clean']
]

Quill.import('modules/clipboard')

const quill = new Quill('#editor', {
  theme: 'bubble',
  modules: {
    toolbar: toolbarOptions
  },
  placeholder: 'Jot down your thoughts...'
})

const setKeyListener = () => {
  const shortcutListener = modikeys(
    (combo, event) => {
      if (event.target.getAttribute('data-shortcut-listener') !== 'true') {
        switch (combo) {
          case localStorage.getItem('writing-mode-shortcut') || (IS_MAC ? 'shift+⌘' : 'ctrl+shift'):
            event.preventDefault()
            toggleEditor()
            break
          default:
            return true
        }
      }
    },
    { preventDefault: false }
  )

  window.addEventListener('keydown', shortcutListener)
}

function handleEditorChange (ch) {
  localStorage.setItem('editor', JSON.stringify(quill.getContents()))
}

quill.on('text-change', debounce(handleEditorChange, 500))
quill.setContents(JSON.parse(localStorage.getItem('editor')))
quill.setSelection(Infinity, Infinity)
window.addEventListener('storage', (ev) => {
  quill.setContents(JSON.parse(ev.newValue))
})

localStorage.getItem('installed')

setKeyListener()
toggleWelcomeDialog()

for (let zone of window.tzList) {
  $('#tz-timezone-list').appendChild(
    el('option', zone.replace(/\_/g, ' ').replace(/\//g, ' / '))
  )
}
