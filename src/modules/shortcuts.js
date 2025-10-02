import { $, el, faviconOf } from './dom-utils.js'
import {
  getShortcuts,
  addShortcut as addBookmark,
  updateShortcut,
  moveShortcut as moveBookmark,
  onShortcutsChanged
} from './services/bookmarks.js'
import { getCurrentTab, updateTab } from './services/tabs.js'

export const addShortcut = async (title, url) => {
  await addBookmark(title, url)
}

export const moveShortcut = async (id, index) => {
  await moveBookmark(id, index)
}

export const editShortcut = async (id, title, url) => {
  await updateShortcut(id, title, url)
}

export const loadBookmarks = async () => {
  const shortcuts = await getShortcuts()

  if (shortcuts.length > 0) {
    $('.bookmarks-box').innerHTML = ''

    for (let bookmark of shortcuts) {
      $('.bookmarks-box').appendChild(
        el('a.shortcut', el('div.favicon', faviconOf(bookmark.url)), bookmark.title, {
          href: bookmark.url,
          title: bookmark.title,
          click: async (e) => {
            if (e.metaKey === true || e.ctrlKey === true) return false
            // update current tab location with bookmark.url
            // in case a normal navigation event can't occur
            // e.g. opening chrome:// links
            const tab = await getCurrentTab()
            await updateTab(tab.id, { url: bookmark.url })
          },
          'data-icon': bookmark.favicon,
          'data-id': bookmark.id,
          'data-type': 'shortcut'
        })
      )
    }
  } else {
    const box = $('.bookmarks-box')
    box.innerHTML = ''

    let message = el(
      'span',
      'You have no shortcuts.',
      el('div.button.outlined', 'Add a shortcut', {
        click: () => {
          // Import shortcutPrompt dynamically to avoid circular dependency
          import('./dialogs.js').then(({ shortcutPrompt }) => {
            shortcutPrompt('', '', 'add', ({ title, url }) => {
              addShortcut(title, url)
            })
          })
        }
      })
    )

    box.appendChild(message)
  }
}

let unsubscribe = null

export function initShortcuts() {
  loadBookmarks()

  // Subscribe to bookmark changes
  unsubscribe = onShortcutsChanged(loadBookmarks)

  // Initialize drag-and-drop sorting
  Sortable.create($('.bookmarks-box'), {
    animation: 200,
    dataIdAttr: 'data-sort-id',
    onEnd: (ev) => {
      moveShortcut(
        ev.item.getAttribute('data-id'),
        ev.oldIndex < ev.newIndex ? ev.newIndex + 1 : ev.newIndex
      )
    }
  })
}

// Cleanup function for module unload (optional)
export function cleanupShortcuts() {
  if (unsubscribe) {
    unsubscribe()
  }
}
