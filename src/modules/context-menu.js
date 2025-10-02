import { $, el } from './dom-utils.js'
import { toggleEditor, getQuill } from './editor.js'
import { shortcutPrompt, timezonePrompt, showSettingsPrompt } from './dialogs.js'
import { addShortcut, editShortcut } from './shortcuts.js'
import { addTZ, editTZ, deleteTZ } from './timezones.js'
import { refreshDate } from './time-display.js'
import { createTab, createWindow, createIncognitoWindow, openChromePage } from './services/tabs.js'
import { deleteShortcut } from './services/bookmarks.js'
import { writeText, readText } from './services/clipboard.js'

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
          el(`li.menu-option${button.disabled ? '.disabled' : ''}`, button.title, {
            tabindex: tabIndex.toString(),
            click: button.onClick
          })
        )
      }
    }
    tabIndex++
  }
}

export function initContextMenu() {
  window.addEventListener('click', (e) => {
    if (
      !menu.classList.contains('hidden') &&
      !(e.target.classList.contains('menu-option') && e.target.classList.contains('disabled'))
    ) {
      toggleMenu('hide')
    }
  })

  window.addEventListener('blur', (event) => {
    if (!menu.classList.contains('hidden')) {
      toggleMenu('hide')
    }
  })

  window.addEventListener('contextmenu', async (e) => {
    toggleMenu('hide')

    const origin = {
      left: e.pageX,
      top: e.pageY
    }

    let buttons = []

    const eventPath = e.composedPath()

    const shortcutTarget = eventPath.find((element) => {
      return (
        element &&
        element.getAttribute &&
        element.getAttribute('data-type') === 'shortcut' &&
        element.getAttribute('data-id')
      )
    })

    const tzTarget = eventPath.find((element) => {
      return (
        (element, element.getAttribute) &&
        element.getAttribute('data-type') === 'tz-clock' &&
        element.getAttribute('data-id')
      )
    })

    const bookmarkActions = [
      {
        title: 'Open in new tab',
        onClick: () => {
          createTab({ url: shortcutTarget.href })
        }
      },
      {
        title: 'Open in new window',
        onClick: () => {
          createWindow({ url: shortcutTarget.href })
        }
      },
      {
        title: 'Open in incognito window',
        onClick: () => {
          createIncognitoWindow(shortcutTarget.href)
        }
      },
      {
        type: 'divider'
      },
      {
        title: 'Edit',
        onClick: () => {
          shortcutPrompt(shortcutTarget.title, shortcutTarget.href, 'edit', ({ title, url }) => {
            editShortcut(shortcutTarget.getAttribute('data-id'), title, url)
          })
        }
      },
      {
        title: 'Copy URL',
        onClick: () => {
          writeText(shortcutTarget.href)
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          deleteShortcut(shortcutTarget.getAttribute('data-id'))
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
        title: $('#editor-container').classList.contains('hidden')
          ? 'Enter writing mode'
          : 'Exit writing mode',
        onClick: () => {
          toggleEditor()
        }
      }
    ]

    const quickAccess = [
      {
        title: 'History',
        onClick: () => {
          openChromePage('history')
        }
      },
      {
        title: 'Downloads',
        onClick: () => {
          openChromePage('downloads')
        }
      },
      {
        title: 'Bookmarks',
        onClick: () => {
          openChromePage('bookmarks')
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
      $('#editor-container').classList.contains('hidden') ? addShortcutItem : false,
      $('#editor-container').classList.contains('hidden') ? addTimeZone : false,
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
          const quill = getQuill()
          const selection = quill.getSelection()
          const clipboardText = await readText()

          quill.insertText(selection.index, clipboardText, 'user')
          quill.setSelection(selection.index + clipboardText.length)
        }
      },
      {
        title: 'Select All',
        onClick: async () => {
          const quill = getQuill()
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
            timezonePrompt(
              name,
              timezone.replace(/\//g, ' / ').replace(/\_/g, ' '),
              'edit',
              ({ name, timezone }) => {
                editTZ(id, name, timezone)
                refreshDate()
              }
            )
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
    } else if (eventPath.filter((el) => el.id === 'editor').length > 0) {
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

    if (
      eventPath.filter((element) => element.classList && element.classList.contains('overlay'))
        .length === 0
    ) {
      setButtons(buttons.filter(Boolean))
      setPosition(origin)
    }

    if (e.target.getAttribute('data-context-menu') !== 'default') {
      e.preventDefault()
      return false
    }
  })
}
