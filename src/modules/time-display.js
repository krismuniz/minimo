import { $ } from './dom-utils.js'
import { renderTimezones } from './timezones.js'
import { settings } from './services/storage.js'
import { formatDate, getConnectionInfo, getBatteryInfo } from './services/system.js'

export const formatTime = (date) => {
  const timeformat = settings.get('timeformat') || '12'
  const h = date.getHours()
  const m = date.getMinutes()
  const hours = timeformat === '12' ? (h === 0 || h === 12 ? '12' : h % 12) : h
  const minutes = m < 10 ? '0' + m : m

  return `${hours}:${minutes}`
}

export const refreshDate = async () => {
  const date = new Date()
  let status = ''

  const showConnection = settings.get('connection') !== 'hide'
  const showBattery = settings.get('battery') !== 'hide'

  $('.time').textContent = formatTime(date)
  $('.date').textContent = formatDate(date, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  if (showConnection) {
    const connectionInfo = getConnectionInfo()
    status += connectionInfo.formattedSpeed
  }

  if (showBattery) {
    const battery = await getBatteryInfo()
    status += status.length > 0 ? ' · ' + battery.formatted : battery.formatted
  }

  // Render timezone clocks
  renderTimezones()

  $('.status').textContent = status
}

export function initTimeDisplay() {
  refreshDate()

  // refresh the clock
  setInterval(refreshDate, 1000)
}
