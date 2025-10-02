/**
 * Clipboard Service - Navigator Clipboard API wrapper
 * Provides text clipboard operations
 */

/**
 * Write text to clipboard
 * @param {string} text - Text to write
 * @returns {Promise<void>}
 */
export async function writeText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Failed to write to clipboard:', error)
    throw error
  }
}

/**
 * Read text from clipboard
 * @returns {Promise<string>}
 */
export async function readText() {
  try {
    return await navigator.clipboard.readText()
  } catch (error) {
    console.error('Failed to read from clipboard:', error)
    throw error
  }
}

/**
 * Copy text using legacy execCommand (fallback)
 * @param {string} text - Text to copy
 * @returns {boolean} Success status
 */
export function legacyCopy(text) {
  // This is a fallback for older browsers
  // The current code uses document.execCommand which is deprecated
  // but still works. This function maintains compatibility.
  try {
    const selection = document.getSelection()
    if (selection && selection.toString() !== '') {
      return document.execCommand('copy', false, null)
    }
    return false
  } catch (error) {
    console.error('Legacy copy failed:', error)
    return false
  }
}

/**
 * Cut text using legacy execCommand (fallback)
 * @returns {boolean} Success status
 */
export function legacyCut() {
  try {
    const selection = document.getSelection()
    if (selection && selection.toString() !== '') {
      return document.execCommand('cut', false, null)
    }
    return false
  } catch (error) {
    console.error('Legacy cut failed:', error)
    return false
  }
}
