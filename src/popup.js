const SHORTCUTS_FOLDER = 'Shortcuts'

const loadShortcuts = () => {
  chrome.bookmarks.getSubTree('1', (tree) => {
    const folder = tree[0].children.find(v => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase())
  
    if (folder && folder.children.length > 0) {
      $('#shortcuts').innerHTML = ''
  
      for (let bookmark of folder.children) {
        $('#shortcuts').appendChild(
          el(
            'div.action.link',
            faviconOf(bookmark.url),
            bookmark.title,
            {
              title: bookmark.title,
              'data-url': bookmark.url,
              'data-icon': bookmark.favicon,
              'data-id': bookmark.id,
              'data-type': 'shortcut',
              click: (e) => {
                chrome.tabs.create({
                  url: bookmark.url,
                  active: !e.metaKey
                })
              }
            }
          )
        )
      }

      $('#shortcuts').appendChild(
        el('div.divider')
      )
    }
  })
}

const loadDeviceTabs = () => {
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
              chrome.sessions.restore(tab.sessionId)
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
  })
}

loadShortcuts()
loadDeviceTabs()

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

Sortable.create($('#shortcuts'), {
  animation: 150,
  dataIdAttr: 'data-sort-id',
  onEnd: (ev) => {
    moveShortcut(ev.item.getAttribute('data-id'), ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex)
  },
  setData: (dT, el) => {
    dT.setData('text/plain', el.getAttribute('data-url'))
  }
})

$('html').addEventListener('contextmenu', (e) => {
  e.preventDefault()
  return false
})
