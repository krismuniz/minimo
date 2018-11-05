window.browser = (function() {
  return window.msBrowser || window.browser || window.chrome
})()

const isChrome = /chrome/i.test(navigator.userAgent)

let pagePrefix

if (isChrome) {
  pagePrefix = 'chrome://'
} else {
  pagePrefix = 'about:'
}

let subTreeID
if (isChrome) {
  subTreeID = '1'
} else {
  subTreeID = 'unfiled_____'
}

browser.sessions.getDevices = () => {
  return 'Not Implemented'
}

const store = browser.storage.sync

const SHORTCUTS_FOLDER = 'Shortcuts'

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
  const cssTextarea = $('#settings-css-textarea')
  const doneButton = $('#settings-done-button')

  store.get(['theme', 'mode', 'css'], (settings) => {
    let preset = {
      mode: localStorage.getItem('mode') || 'dark',
      theme: localStorage.getItem('theme') || 'smooth-dark',
      css: localStorage.getItem('css') || '',
      favicons: localStorage.getItem('favicons') || 'hide',
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

  doneButton.addEventListener('click', () => {
    $('.overlay').classList.add('hidden')
    $('#settings-dialog').classList.add('hidden')
    $('#settings-dialog').classList.remove('animate')
  })
}

const addShortcut = (title, url) => {
  browser.bookmarks.getSubTree(subTreeID, (tree) => {
    let folder = tree[0].children.find(
      v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase()
    )

    if (folder) {
      browser.bookmarks.create({
        title,
        url,
        parentId: folder.id
      })
      return
    }

    browser.bookmarks.create(
      { title: SHORTCUTS_FOLDER, parentId: subTreeID },
      folder => {
        browser.bookmarks.create({
          title,
          url,
          parentId: folder.id
        })
      }
    )
  })
}

const moveShortcut = (id, index) => {
  browser.bookmarks.getSubTree(subTreeID, (tree) => {
    let folder = tree[0].children.find(
      v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase()
    )

    if (folder) {
      browser.bookmarks.move(id, {
        parentId: folder.id,
        index
      })
      return
    }
  })
}

const editShortcut = (id, title, url) => {
  browser.bookmarks.update(id, { title, url })
}

const formatTime = (date) => {
  const h = date.getHours()
  const m = date.getMinutes()
  const hours = h === 0 || h === 12 ? '12' : h % 12
  const minutes = m < 10 ? '0' + m : m

  return `${hours}:${minutes}`
}

const refreshDate = async () => {
  const date = new Date()
  const battery =
    (navigator.getBattery && (await navigator.getBattery())) || {}

  const connection =
    navigator.connection && navigator.onLine
      ? '~' + navigator.connection.downlink + ' Mbps '
      : 'Offline '

  const batteryHealth =
    (battery.level * 100).toFixed() +
    '% ' +
    (battery.charging ? 'Charging' : 'Battery')

  $('.time').textContent = formatTime(date)
  $('.date').textContent = date.toLocaleDateString(navigator.language, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  if (isChrome) {
    $('.status').textContent = connection + ' · ' + batteryHealth
  } else {
    let status = 'offline'
    if (navigator.onLine) {
      status = 'online'
    }
    $('.status').textContent = `You are ${status}`
  }
}

let syncedTabsHash = ''

const loadSyncedTabs = () => {
  browser.sessions.getDevices((devices) => {
    let tabs = devices.reduce((p, device) => {
        return p.concat(
          device.sessions.reduce((acc, session) => {
            return acc.concat(
              session.window.tabs.map(tab => ({ ...tab, deviceName: device.deviceName }))
            )
          },
          [])
        )
      }, []).filter(t => t.url !== `${pagePrefix}newtab/`)

    let currentHash = tabs.reduce((prev, curr) => {
        return (prev += ':' + curr.url)
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
                src: `${pagePrefix}favicon/size/16@1x/${tab.url}`,
                srcset: `
                ${pagePrefix}favicon/size/16@1x/${tab.url},
                ${pagePrefix}favicon/size/16@2x/${tab.url} 2x
                `}
              )
          ),
          tab.deviceName + ' › ' + tab.title,
          {
            href: '#',
            title: tab.title,
            click: () => {
              browser.sessions.restore(tab.sessionId)
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
  browser.bookmarks.getSubTree(subTreeID, tree => {
    const folder = tree[0].children.find(
      v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase()
    )

    if (folder && folder.children.length > 0) {
      $('.bookmarks-box').innerHTML = ''

      for (let bookmark of folder.children) {
        $('.bookmarks-box').appendChild(
          el(
            'a.shortcut',
            el(
              'div.favicon',
              el('img', {
                src: `${pagePrefix}favicon/size/16@1x/${bookmark.url}`,
                srcset: `
                ${pagePrefix}favicon/size/16@1x/${bookmark.url},
                ${pagePrefix}favicon/size/16@2x/${bookmark.url} 2x
                  `
              })
            ),
            bookmark.title,
            {
              href: bookmark.url,
              title: bookmark.title,
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
browser.bookmarks.onChanged.addListener(loadBookmarks)
browser.bookmarks.onCreated.addListener(loadBookmarks)
browser.bookmarks.onRemoved.addListener(loadBookmarks)
// browser.bookmarks.onMoved.addListener(loadBookmarks)

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

  const adjustedLeft = bodyRect.width - left < menuRect.width ? left - menuRect.width : left

  const adjustedTop = bodyRect.height - top < menuRect.height ? top - menuRect.height : top

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
        menu.appendChild(
          el(
            `li.menu-option${button.disabled ? '.disabled' : ''}`,
            button.title,
            { tabindex: tabIndex.toString(), click: button.onClick }
          )
        )
      }
    }
    tabIndex++
  }
}

window.addEventListener('click', e => {
  if (
    !menu.classList.contains('hidden') &&
    e.which !== 3 &&
    !(
      e.target.classList.contains('menu-option') &&
      e.target.classList.contains('disabled')
    )
  ) {
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
        browser.tabs.create({
          url: e.target.href
        })
      }
    },
    {
      title: 'Open in new window',
      onClick: () => {
        browser.windows.create({
          url: e.target.href
        })
      }
    },
    {
      title: 'Open in incognito window',
      onClick: () => {
        browser.windows.create({
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
        browser.bookmarks.remove(e.target.getAttribute('data-id'))
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
  let quickAccess = []
  if (isChrome) {
    quickAccess = [
      { type: 'divider' },
      {
        title: 'History',
        onClick: () => {
          browser.tabs.create({
            url: `${pagePrefix}history`
          })
        }
      },
      {
        title: 'Downloads',
        onClick: () => {
          browser.tabs.create({
            url: `${pagePrefix}downloads`
          })
        }
      },
      {
        title: 'Bookmarks',
        onClick: () => {
          browser.tabs.create({
            url: `${pagePrefix}bookmarks`
          })
        }
      }
    ]
  }

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

  function eventPath(evt) {
    var path = (evt.composedPath && evt.composedPath()) || evt.path,
      target = evt.target

    if (path != null) {
      // Safari doesn't include Window, but it should.
      return path.indexOf(window) < 0 ? path.concat(window) : path
    }

    if (target === window) {
      return [window]
    }

    function getParents(node, memo) {
      memo = memo || []
      var parentNode = node.parentNode

      if (!parentNode) {
        return memo
      } else {
        return getParents(parentNode, memo.concat(parentNode))
      }
    }

    return [target].concat(getParents(target), window)
  }

  const path = eventPath(e)
  if (e.target.getAttribute('data-type') === 'shortcut') {
    buttons = buttons.concat(bookmarkActions)
  } else if (path.filter(el => el.id === 'editor').length > 0) {
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
    moveShortcut(ev.item.getAttribute('data-id'), ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex
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
  let lastPress = 0
  let delta = 300

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Meta' || e.key === 'Shift') {
      if (Date.now() - lastPress <= delta) {
        toggleEditor()
        e.preventDefault()
        lastPress = 0
      } else {
        lastPress = Date.now()
      }
    }
  })
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
