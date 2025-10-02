/**
 * Preact convenience re-exports
 * Single import point for Preact and Signals
 */

// Core Preact
export {
  h,
  render,
  Fragment,
  Component,
  createRef,
  createContext
} from '../libraries/preact.module.js'

// Signals
export { signal, computed, effect, batch } from '../libraries/signals-core.module.js'
