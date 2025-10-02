import { $, el, faviconOf } from './modules/dom-utils.js'
import { getShortcuts, moveShortcut } from './modules/services/bookmarks.js'
import { getRemoteTabs, restoreSession } from './modules/services/sessions.js'
import { createTab } from './modules/services/tabs.js'

const loadShortcuts = async () => {
  const shortcuts = await getShortcuts()

  if (shortcuts.length > 0) {
    $('#shortcuts').innerHTML = ''

    for (let bookmark of shortcuts) {
      $('#shortcuts').appendChild(
        el('div.action.link', faviconOf(bookmark.url), bookmark.title, {
          title: bookmark.title,
          'data-url': bookmark.url,
          'data-icon': bookmark.favicon,
          'data-id': bookmark.id,
          'data-type': 'shortcut',
          click: (e) => {
            createTab({
              url: bookmark.url,
              active: !e.metaKey
            })
          }
        })
      )
    }

    $('#shortcuts').appendChild(el('div.divider'))
  }
}

const loadDeviceTabs = async () => {
  const tabs = await getRemoteTabs()

  // if something changed, re-render
  if (tabs.length > 0) {
    let box = $('#device-tabs')
    box.innerHTML = ''

    /* append (almost) every tab */
    for (let tab of tabs) {
      let element = el(
        'div.action.truncate',
        faviconOf(tab.url),
        tab.deviceName + ' › ' + tab.title,
        {
          href: '#',
          title: tab.title,
          click: () => {
            restoreSession(tab.sessionId)
          },
          dragstart: (event) => {
            event.dataTransfer.setData('text/plain', tab.url)
          }
        }
      )

      if (box.children.length < 6) {
        box.appendChild(element)
      }
    }

    if (tabs.length > 0) {
      box.appendChild(el('div.divider'))
    }
  }
}

loadShortcuts()
loadDeviceTabs()

Sortable.create($('#shortcuts'), {
  animation: 150,
  dataIdAttr: 'data-sort-id',
  onEnd: (ev) => {
    moveShortcut(
      ev.item.getAttribute('data-id'),
      ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex
    )
  },
  setData: (dT, el) => {
    dT.setData('text/plain', el.getAttribute('data-url'))
  }
})

$('html').addEventListener('contextmenu', (e) => {
  e.preventDefault()
  return false
})
