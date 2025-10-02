import { iconSvg } from './constants.js'
import { $, el, faviconOf } from './dom-utils.js'
import { settings } from './services/storage.js'
import { getRemoteTabs, createTabsHash, restoreSession } from './services/sessions.js'

let syncedTabsHash = ''

export const loadSyncedTabs = async () => {
  const showTabs = settings.get('devices') !== 'hide'

  if (!showTabs) {
    syncedTabsHash = ''
    $('.devices-box .tabs').innerHTML = ''
    return
  }

  const tabs = await getRemoteTabs()
  const currentHash = createTabsHash(tabs)

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
        faviconOf(tab.url),
        tab.deviceName + ' › ' + tab.title,
        {
          href: '#',
          title: tab.title,
          'data-type': 'shortcut',
          click: () => {
            restoreSession(tab.sessionId)
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
}

export function initSyncedTabs() {
  loadSyncedTabs()

  // periodically detect changes in synced tabs
  setInterval(loadSyncedTabs, 1000)
}
