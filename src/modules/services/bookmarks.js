/**
 * Bookmarks Service - Chrome Bookmarks API wrapper
 * Handles all shortcut/bookmark CRUD operations
 */

import { signal } from '../preact.js'

const SHORTCUTS_FOLDER = 'Shortcuts'
const BOOKMARKS_BAR_ID = '1'

// Reactive state
export const shortcutsSignal = signal([])

/**
 * Get or create the Shortcuts folder in the bookmarks bar
 * @returns {Promise<{id: string, title: string}>}
 */
function getOrCreateShortcutsFolder() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getSubTree(BOOKMARKS_BAR_ID, (tree) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }

      let folder = tree[0].children.find(
        (v) => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase()
      )

      if (folder) {
        resolve(folder)
        return
      }

      // Create folder if it doesn't exist
      chrome.bookmarks.create(
        {
          title: SHORTCUTS_FOLDER,
          parentId: BOOKMARKS_BAR_ID
        },
        (newFolder) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }
          resolve(newFolder)
        }
      )
    })
  })
}

/**
 * Get all shortcuts from the Shortcuts folder
 * @returns {Promise<Array>}
 */
export async function getShortcuts() {
  try {
    const folder = await getOrCreateShortcutsFolder()
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getChildren(folder.id, (children) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }
        const shortcuts = children || []
        shortcutsSignal.value = shortcuts
        resolve(shortcuts)
      })
    })
  } catch (error) {
    console.error('Failed to get shortcuts:', error)
    return []
  }
}

/**
 * Add a new shortcut
 * @param {string} title - Bookmark title
 * @param {string} url - Bookmark URL
 * @returns {Promise<Object>}
 */
export async function addShortcut(title, url) {
  const folder = await getOrCreateShortcutsFolder()

  return new Promise((resolve, reject) => {
    chrome.bookmarks.create(
      {
        title,
        url,
        parentId: folder.id
      },
      (bookmark) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }
        resolve(bookmark)
      }
    )
  })
}

/**
 * Update an existing shortcut
 * @param {string} id - Bookmark ID
 * @param {string} title - New title
 * @param {string} url - New URL
 * @returns {Promise<Object>}
 */
export function updateShortcut(id, title, url) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.update(id, { title, url }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }
      resolve(result)
    })
  })
}

/**
 * Delete a shortcut
 * @param {string} id - Bookmark ID
 * @returns {Promise<void>}
 */
export function deleteShortcut(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.remove(id, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }
      resolve()
    })
  })
}

/**
 * Move a shortcut to a new position
 * @param {string} id - Bookmark ID
 * @param {number} index - New index position
 * @returns {Promise<Object>}
 */
export async function moveShortcut(id, index) {
  const folder = await getOrCreateShortcutsFolder()

  return new Promise((resolve, reject) => {
    chrome.bookmarks.move(
      id,
      {
        parentId: folder.id,
        index
      },
      (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }
        resolve(result)
      }
    )
  })
}

/**
 * Subscribe to bookmark change events
 * @param {Function} callback - Called when shortcuts change
 * @returns {Function} Unsubscribe function
 */
export function onShortcutsChanged(callback) {
  const onChange = () => callback()

  chrome.bookmarks.onChanged.addListener(onChange)
  chrome.bookmarks.onCreated.addListener(onChange)
  chrome.bookmarks.onRemoved.addListener(onChange)
  // chrome.bookmarks.onMoved.addListener(onChange)

  // Return unsubscribe function
  return () => {
    chrome.bookmarks.onChanged.removeListener(onChange)
    chrome.bookmarks.onCreated.removeListener(onChange)
    chrome.bookmarks.onRemoved.removeListener(onChange)
    // chrome.bookmarks.onMoved.removeListener(onChange)
  }
}

/**
 * Get the full shortcuts folder tree (for compatibility)
 * @returns {Promise<Object>}
 */
export async function getShortcutsFolder() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getSubTree(BOOKMARKS_BAR_ID, (tree) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }

      const folder = tree[0].children.find(
        (v) => v.title.toLowerCase() === SHORTCUTS_FOLDER.toLowerCase()
      )

      resolve(folder)
    })
  })
}

// Initialize signal and keep it updated
getShortcuts() // Load initial shortcuts
onShortcutsChanged(() => {
  getShortcuts() // Reload when bookmarks change
})
