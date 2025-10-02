/**
 * Tabs & Windows Service - Chrome Tabs and Windows API wrapper
 * Handles tab/window creation and manipulation
 */

/**
 * Get the current tab
 * @returns {Promise<Object>}
 */
export function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.getCurrent((tab) => {
      resolve(tab)
    })
  })
}

/**
 * Create a new tab
 * @param {Object} options
 * @param {string} options.url - URL to open
 * @param {boolean} options.active - Whether tab should be active (default: true)
 * @returns {Promise<Object>}
 */
export function createTab({ url, active = true }) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url, active }, (tab) => {
      resolve(tab)
    })
  })
}

/**
 * Update a tab
 * @param {number} tabId - Tab ID
 * @param {Object} updateInfo - Properties to update
 * @returns {Promise<Object>}
 */
export function updateTab(tabId, updateInfo) {
  return new Promise((resolve) => {
    chrome.tabs.update(tabId, updateInfo, (tab) => {
      resolve(tab)
    })
  })
}

/**
 * Create a new window
 * @param {Object} options
 * @param {string} options.url - URL to open
 * @param {boolean} options.incognito - Whether to open in incognito mode
 * @returns {Promise<Object>}
 */
export function createWindow({ url, incognito = false }) {
  return new Promise((resolve) => {
    chrome.windows.create({ url, incognito }, (window) => {
      resolve(window)
    })
  })
}

/**
 * Create an incognito window
 * @param {string} url - URL to open
 * @returns {Promise<Object>}
 */
export function createIncognitoWindow(url) {
  return createWindow({ url, incognito: true })
}

/**
 * Navigate to a Chrome internal page
 * @param {string} page - Chrome page (e.g., 'history', 'downloads', 'bookmarks')
 * @returns {Promise<Object>}
 */
export function openChromePage(page) {
  return createTab({ url: `chrome://${page}` })
}
