import { h, render } from './modules/preact.js'
import { initTheme } from './modules/theme.js'
import { initDialogs } from './modules/dialogs.js'
import { initEditor } from './modules/editor.js'
import { initContextMenu } from './modules/context-menu.js'

// Preact components
import { Shortcuts } from './modules/components/Shortcuts.js'
import { TimeDisplay } from './modules/components/TimeDisplay.js'
import { SyncedTabs } from './modules/components/SyncedTabs.js'
import { Timezones } from './modules/components/Timezones.js'

// Initialize theme first (sets up appearance)
initTheme()

// Mount Preact components
render(h(Shortcuts), document.querySelector('.bookmarks-box'))
render(h(TimeDisplay), document.querySelector('.time-box'))
render(h(SyncedTabs), document.querySelector('.devices-box'))
render(h(Timezones), document.querySelector('#tz-box'))

// Initialize remaining non-Preact modules
initDialogs()
initEditor()
initContextMenu()

// Initialize Sortable for shortcuts (needs to be after render)
import('./modules/shortcuts.js').then(({ initShortcuts }) => {
  initShortcuts()
})
