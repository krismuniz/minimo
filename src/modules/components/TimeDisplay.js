import { h } from '../preact.js'
import { currentTimeSignal, batterySignal, connectionSignal } from '../services/system.js'
import { formatDate } from '../services/system.js'
import { settings } from '../services/storage.js'

function formatTime(date) {
  const timeformat = settings.get('timeformat') || '12'
  const h = date.getHours()
  const m = date.getMinutes()
  const hours = timeformat === '12' ? (h === 0 || h === 12 ? '12' : h % 12) : h
  const minutes = m < 10 ? '0' + m : m

  return `${hours}:${minutes}`
}

export function TimeDisplay() {
  const date = currentTimeSignal.value
  const battery = batterySignal.value
  const connection = connectionSignal.value

  const showConnection = settings.get('connection') !== 'hide'
  const showBattery = settings.get('battery') !== 'hide'

  let status = ''
  if (showConnection) {
    status += connection.formattedSpeed
  }
  if (showBattery) {
    status += status.length > 0 ? ' · ' + battery.formatted : battery.formatted
  }

  return h('div', { class: 'time-box' }, [
    h('span', { class: 'time' }, formatTime(date)),
    h(
      'span',
      { class: 'date' },
      formatDate(date, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    ),
    h('span', { class: 'status' }, status),
    h('span', { class: 'special-message hidden' })
  ])
}
