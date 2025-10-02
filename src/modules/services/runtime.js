/**
 * Runtime Service - Chrome Runtime API utilities
 * Provides runtime-related functionality
 */

/**
 * Get favicon URL for a page
 * @param {string} pageURL - Page URL
 * @param {number} size - Icon size (default: 32)
 * @returns {string} Favicon URL
 */
export function getFaviconUrl(pageURL, size = 32) {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageURL)
  url.searchParams.set('size', size)
  return url.toString()
}

/**
 * Get extension resource URL
 * @param {string} path - Resource path
 * @returns {string} Full URL
 */
export function getResourceUrl(path) {
  return chrome.runtime.getURL(path)
}

/**
 * Get extension manifest
 * @returns {Object} Manifest object
 */
export function getManifest() {
  return chrome.runtime.getManifest()
}

/**
 * Get extension version
 * @returns {string} Version string
 */
export function getVersion() {
  return getManifest().version
}
