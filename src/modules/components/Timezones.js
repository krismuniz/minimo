import { h } from '../preact.js'
import { timezonesSignal } from '../services/storage.js'
import { currentTimeSignal, formatTimeForTimezone } from '../services/system.js'
import { settings } from '../services/storage.js'

export function Timezones() {
  const timezones = timezonesSignal.value
  const currentTime = currentTimeSignal.value
  const hour12 = settings.get('timeformat') !== '24'

  if (timezones.length === 0) {
    return h('div', { id: 'tz-box' })
  }

  return h(
    'div',
    { id: 'tz-box' },
    timezones.map((zone) =>
      h(
        'div',
        {
          key: zone.id,
          class: 'tz-clock',
          'data-type': 'tz-clock',
          'data-timezone': zone.timezone,
          'data-name': zone.name,
          'data-id': zone.id
        },
        [
          h('div', { class: 'tz-name' }, zone.name),
          h('div', { class: 'tz-time' }, formatTimeForTimezone(currentTime, zone.timezone, hour12))
        ]
      )
    )
  )
}
