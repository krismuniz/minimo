import { h } from '../preact.js'
import { remoteTabsSignal } from '../services/sessions.js'
import { restoreSession } from '../services/sessions.js'
import { settings } from '../services/storage.js'
import { iconSvg } from '../constants.js'
import { getFaviconUrl } from '../services/runtime.js'

export function SyncedTabs() {
  const showTabs = settings.get('devices') !== 'hide'

  if (!showTabs) {
    return h('div', { class: 'devices-box' }, [h('div', { class: 'tabs' })])
  }

  const tabs = remoteTabsSignal.value

  if (tabs.length === 0) {
    return h('div', { class: 'devices-box' }, [h('div', { class: 'tabs' })])
  }

  const tabElements = tabs.slice(0, 4).map((tab) =>
    h(
      'div',
      {
        key: tab.sessionId,
        class: 'link truncate',
        href: '#',
        title: tab.title,
        'data-type': 'shortcut',
        onClick: () => {
          restoreSession(tab.sessionId)
        },
        onDragStart: (event) => {
          event.dataTransfer.setData('text/plain', tab.url)
        }
      },
      [
        h('img', { src: getFaviconUrl(tab.url), alt: '', class: 'favicon' }),
        tab.deviceName + ' › ' + tab.title
      ]
    )
  )

  const iconElement = h('div', {
    class: 'icon',
    innerHTML: iconSvg,
    onClick: () => {
      // Trigger refresh by just calling getRemoteTabs (signal auto-updates)
      import('../services/sessions.js').then(({ getRemoteTabs }) => getRemoteTabs())
    }
  })

  return h('div', { class: 'devices-box' }, [
    h('div', { class: 'tabs' }, [iconElement, ...tabElements])
  ])
}
