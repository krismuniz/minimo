import { $, el } from './dom-utils.js'
import {
  getTimezones,
  addTimezone,
  updateTimezone,
  moveTimezone,
  deleteTimezone,
  settings
} from './services/storage.js'
import { formatTimeForTimezone } from './services/system.js'

export const addTZ = (name, timezone) => {
  addTimezone(name, timezone)
}

export const editTZ = (id, name, timezone) => {
  updateTimezone(id, name, timezone)
}

export const moveTZ = (id, to) => {
  moveTimezone(id, to)
}

export const deleteTZ = (id) => {
  deleteTimezone(id)
}

export function renderTimezones() {
  const timezones = getTimezones()
  const hour12 = settings.get('timeformat') !== '24'
  const date = new Date()

  for (let zone of timezones) {
    const tz = $(`#tz-box .tz-clock[data-id="${zone.id}"]`)

    if (!tz) {
      $('#tz-box').appendChild(
        el(
          `div.tz-clock`,
          {
            'data-type': 'tz-clock',
            'data-timezone': zone.timezone,
            'data-name': zone.name,
            'data-id': zone.id
          },
          [el('div.tz-name'), el('div.tz-time')]
        )
      )
    }
  }

  for (let tzClock of $('#tz-box').children) {
    const zone = timezones.find(({ id }) => id === tzClock.getAttribute('data-id'))

    if (zone) {
      const time = formatTimeForTimezone(date, zone.timezone, hour12)
      tzClock.setAttribute('data-timezone', zone.timezone)
      tzClock.setAttribute('data-name', zone.name)
      tzClock.children[0].textContent = zone.name
      tzClock.children[1].textContent = time
    } else {
      tzClock.remove()
    }
  }
}

export function initTimezones() {
  // Initialize drag-and-drop sorting
  Sortable.create($('#tz-box'), {
    animation: 200,
    dataIdAttr: 'data-sort-id',
    onEnd: (ev) => {
      moveTZ(ev.item.getAttribute('data-id'), ev.newIndex)
    }
  })

  // Populate timezone list in dialog
  for (let zone of window.tzList) {
    $('#tz-timezone-list').appendChild(el('option', zone.replace(/\_/g, ' ').replace(/\//g, ' / ')))
  }
}
