import { h } from '../preact.js'
import { shortcutsSignal } from '../services/bookmarks.js'
import { getCurrentTab, updateTab } from '../services/tabs.js'
import { getFaviconUrl } from '../services/runtime.js'

export function Shortcuts() {
  const shortcuts = shortcutsSignal.value

  if (shortcuts.length === 0) {
    return h('div', { class: 'bookmarks-box' }, [
      h('span', null, [
        'You have no shortcuts.',
        h(
          'div',
          {
            class: 'button outlined',
            onClick: () => {
              // Import shortcutPrompt dynamically to avoid circular dependency
              import('../dialogs.js').then(({ shortcutPrompt }) => {
                import('../shortcuts.js').then(({ addShortcut }) => {
                  shortcutPrompt('', '', 'add', ({ title, url }) => {
                    addShortcut(title, url)
                  })
                })
              })
            }
          },
          'Add a shortcut'
        )
      ])
    ])
  }

  return h(
    'div',
    { class: 'bookmarks-box' },
    shortcuts.map((bookmark) =>
      h(
        'a',
        {
          key: bookmark.id,
          class: 'shortcut',
          href: bookmark.url,
          title: bookmark.title,
          'data-icon': bookmark.favicon,
          'data-id': bookmark.id,
          'data-type': 'shortcut',
          onClick: async (e) => {
            if (e.metaKey === true || e.ctrlKey === true) return false
            // update current tab location with bookmark.url
            // in case a normal navigation event can't occur
            // e.g. opening chrome:// links
            const tab = await getCurrentTab()
            await updateTab(tab.id, { url: bookmark.url })
          }
        },
        [
          h('div', { class: 'favicon' }, [h('img', { src: getFaviconUrl(bookmark.url), alt: '' })]),
          bookmark.title
        ]
      )
    )
  )
}
