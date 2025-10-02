import { isMac } from './services/system.js'

export const SHORTCUTS_FOLDER = 'Shortcuts'
export const IS_MAC = isMac()
export const today = new Date()

export const iconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="nc-icon-wrapper" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" transform="translate(0.5 0.5)" stroke="currentColor"><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M10,23H3 c-1.105,0-2-0.895-2-2V3c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2v7"/> <circle data-stroke="none" cx="9" cy="18" r="1" stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M14.126,17 c0.444-1.725,2.01-3,3.874-3c1.48,0,2.772,0.804,3.464,1.999"/> <polygon data-color="color-2" data-stroke="none" points="23.22,13.649 22.792,18 18.522,17.061 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/> <path data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" d="M21.874,20 c-0.444,1.725-2.01,3-3.874-3c-1.48,0-2.772-0.804-3.464-1.999"/> <polygon data-color="color-2" data-stroke="none" points="12.78,23.351 13.208,19 17.478,19.939 " stroke-linejoin="miter" stroke-linecap="square" stroke="none"/></g></svg>'
