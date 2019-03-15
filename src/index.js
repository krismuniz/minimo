const store = chrome.storage.sync

const SHORTCUTS_FOLDER = 'Shortcuts'
const IS_MAC = window.navigator.platform.indexOf('Mac') !== -1
const today = new Date()
let holiday = false
let specialMessage = false

const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="nc-icon-wrapper" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" transform="translate(0.5 0.5)" stroke="currentColor"><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M10,23H3 c-1.105,0-2-0.895-2-2V3c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2v7"/> <circle data-stroke="none" cx="9" cy="18" r="1" stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M14.126,17 c0.444-1.725,2.01-3,3.874-3c1.48,0,2.772,0.804,3.464,1.999"/> <polygon data-color="color-2" data-stroke="none" points="23.22,13.649 22.792,18 18.522,17.061 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M21.874,20 c-0.444,1.725-2.01,3-3.874,3c-1.48,0-2.772-0.804-3.464-1.999"/> <polygon data-color="color-2" data-stroke="none" points="12.78,23.351 13.208,19 17.478,19.939 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/></g></svg>'

const showEditor = () => {
  $('#editor-container').classList.remove('hidden')
  $('#editor-container').classList.add('animate')
  $('.layout').classList.remove('animate-land')
  quill.focus()
}

const hideEditor = () => {
  $('#editor-container').classList.add('hidden')
  $('#editor-container').classList.remove('animate')
  $('.layout').classList.add('animate-land')
  quill.blur()
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
  const cssTextarea = $('#settings-css-textarea')
  const doneButton = $('#settings-done-button')

  // keyboard shortcut overrides
  const writingModeShortcutInput = $('#settings-writing-mode-shortcut-input')

  store.get(['theme', 'mode', 'css', 'favicons', 'timeformat', 'battery'], (settings) => {
    let preset = {
      mode: localStorage.getItem('mode') || 'dark',
      theme: localStorage.getItem('theme') || 'smooth-dark',
      css: localStorage.getItem('css') || '',
      favicons: localStorage.getItem('favicons') || 'hide',
      timeformat: localStorage.getItem('timeformat') || '12',
      battery: localStorage.getItem('battery') || 'show',
      writingModeShortcut: localStorage.getItem('writing-mode-shortcut') || (IS_MAC ? 'shift+⌘' : 'ctrl+shift'),
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
  const speed = navigator.connection.downlink
  const connection = navigator.onLine
    ? (speed === 10 ? '> ' + speed : '~' + speed) + ' Mbps'
    : 'Offline'
  
  $('.time').textContent = formatTime(date)
  $('.date').textContent = date.toLocaleDateString(navigator.language, { weekday: 'long', month: 'long', day: 'numeric' })
  let status = connection;

  if (localStorage.getItem('battery') === 'show') {
    const battery = await navigator.getBattery()
    const batteryHealth = (battery.level * 100).toFixed() + '% ' + (battery.charging ? 'Charging' : 'Battery')
    status +=  ' · ' + batteryHealth
  }

  const message = typeof specialMessage === 'function' ? specialMessage({ date }) : specialMessage

  $('.status').textContent = status
  $('.special-message').textContent = (specialMessage && message ? message : '')
  if (!message) {
    $('.special-message').classList.add('hidden')
  } else {
    $('.special-message').classList.remove('hidden')
  }
}

let syncedTabsHash = ''

const loadSyncedTabs = () => {
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
            click: () => {
              chrome.sessions.restore(tab.sessionId)
            },
            dragstart: (event) => {
              event.dataTransfer.setData('text/plain', tab.url)
            }
          }
        )

        if (box.children.length < 3) {
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

const shortcutPrompt = (title, url, type = 'edit', callback) => {
  const dialog = $('#shortcut-dialog')
  const overlay = $('.overlay')

  overlay.classList.remove('hidden')
  dialog.classList.remove('hidden')
  dialog.classList.add('animate')

  $('#shortcut-dialog-title').textContent = `${type === 'add' ? 'Add new' : 'Edit'} shortcut`
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
      console.log(e)
      $('#shortcut-url-feedback').textContent = 'That is an invalid URL'
      return
    }
    hideDialog()
  }

  const keyHandler = (e) => {
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

const settingsPrompt = () => {
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

  const bookmarkActions = [
    {
      title: 'Open in new tab',
      onClick: () => {
        chrome.tabs.create({
          url: e.target.href
        })
      }
    },
    {
      title: 'Open in new window',
      onClick: () => {
        chrome.windows.create({
          url: e.target.href
        })
      }
    },
    {
      title: 'Open in incognito window',
      onClick: () => {
        chrome.windows.create({
          url: e.target.href,
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
        shortcutPrompt(e.target.title, e.target.href, 'edit', ({ title, url}) => {
          editShortcut(e.target.getAttribute('data-id'), title, url)
        })
      }
    },
    {
      title: 'Copy URL',
      onClick: () => {
        navigator.clipboard.writeText(e.target.href)
      }
    },
    {
      title: 'Delete',
      onClick: () => {
        chrome.bookmarks.remove(e.target.getAttribute('data-id'))
      }
    },
    {
      type: 'divider'
    },
    {
      title: 'Add new shortcut',
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
    title: 'Add new shortcut',
    onClick: () => {
      shortcutPrompt('', '', 'add', ({ title, url }) => {
        addShortcut(title, url)
      })
    }
  }

  const customization = [
    ($('#editor-container').classList.contains('hidden') ? addShortcutItem : false),
    {
      title: 'Change appearance',
      onClick: () => {
        settingsPrompt()
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

  if (e.target.getAttribute('data-type') === 'shortcut') {
    buttons = buttons.concat(bookmarkActions)
  } else if (e.path.filter(el => el.id === 'editor').length > 0) {
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

  if (e.path.filter(element => element.classList && element.classList.contains('overlay')).length === 0) {
    setButtons(buttons.filter(Boolean))
    setPosition(origin)
  }

  if (e.target.getAttribute('data-context-menu') !== 'default') {
    e.preventDefault()
    return false
  }
})

Sortable.create($('.bookmarks-box'), {
  animation: 150,
  dataIdAttr: 'data-sort-id',
  onEnd: (ev) => {
    moveShortcut(ev.item.getAttribute('data-id'), ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex)
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

/**
 * Let It Snow, Sometimes.
 * Special thanks to Paul Lewis (@aerotwist)
 */

function randBetween (min, max) {
  return min + Math.random() * (max - min)
}

class Snowflake {
  constructor ({ colors }) {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.radius = 0
    this.velocity = 0
    this.alpha = 0
    this.availableColors = colors

    this.reset()
  }

  reset () {
    this.x = randBetween(0, window.innerWidth)
    this.y = randBetween(0, -window.innerHeight)
    this.vx = randBetween(-3, 3)
    this.vy = randBetween(2, 3)
    this.radius = randBetween(1, 4)
    this.alpha = randBetween(0.1, 0.9)
    this.color = this.availableColors[
      Math.round(
        randBetween(0, this.availableColors.length - 1)
      )
    ]
  }

  update () {
    this.x += this.vx
    this.y += this.vy

    if (this.y + this.radius > window.innerHeight) {
      this.reset()
    }
  }
}

class Snow {
  constructor ({ colors }) {
    this.canvas = document.createElement('canvas')
    this.container = el('div#holiday-canvas.holidays', this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.updateBound = this.update.bind(this)
    this.colors = colors

    document.body.appendChild(this.container)

    $('#settings-css-info').innerHTML = `To stop the snow, add <code>.holidays { display: none; }</code>`
    window.addEventListener('resize', () => this.onResize())

    this.onResize()
    this.createSnowFlakes()
    requestAnimationFrame(this.updateBound)
  }
  
  onResize () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  changeColors (colors) {
    this.colors = colors
    this.createSnowFlakes()
  }

  createSnowFlakes () {
    const flakes = window.innerWidth / 4
    this.snowflakes = []

    for (let i = 0; i < flakes; i++) {
      this.snowflakes.push(
        new Snowflake({
          colors: this.colors
        })
      )
    }
  }
  
  update () {
    this.ctx.clearRect(0, 0, this.width, this.height)

    for (let flake of this.snowflakes) {
      flake.update()

      this.ctx.save()
      this.ctx.fillStyle = flake.color || '#FFFFFF'
      this.ctx.beginPath()
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
      this.ctx.closePath()
      this.ctx.globalAlpha = flake.alpha
      this.ctx.fill()
      this.ctx.restore()
    }

    requestAnimationFrame(this.updateBound)
  }
}

const snowDays = [
  {
    message: 'Happy Holidays!',
    colors: ['#FFFFFF'],
    month: 12,
    day: 24 // Christmas Eve
  },
  {
    message: 'Happy Holidays!',
    colors: [
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
      '#EF2D56',
      '#0CCE6B'
    ],
    month: 12,
    day: 25 // Christmas Day
  },
  {
    message: ({ date }) => {
      const nextYear = date.getFullYear() + 1
      const h = date.getHours()
      const m = date.getMinutes()
      const s = date.getSeconds()

      const hrs = 24 - h - 1
      const min = 60 - m - 1
      const sec = 60 - s - 1

      return hrs <= 5
        ? (hrs === 0 && min === 0 ? `${sec}s` : `${hrs}h ${min}m ${sec}s to New Year ${nextYear}`)
        : ''
    },
    colors: ['#FFFFFF'],
    month: 12, 
    day: 31 // New Year's Eve
  },
  {
    message: 'Happy New Year!',
    colors: [
      '#0CCE6B',
      '#DCED31',
      '#EF2D56',
      '#ED7D3A'
    ],
    month: 1, 
    day: 1 // New Year's Day
  }
]

for (let day of snowDays) {
  if (today.getDate() === day.day && today.getMonth() + 1 === day.month && holiday === false) {
    holiday = new Snow({
      colors: day.colors || ['#FFFFFF']
    })
    if (day.message) specialMessage = day.message 
  }
}
