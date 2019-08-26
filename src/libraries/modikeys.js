window.modikeys = (cb, opts = { preventDefault: true }) => {
  const isMac = window.navigator.platform.indexOf('Mac') !== -1
  const KEY_REGEX = /Key|Digit/

  return (e) => {
    if (opts.preventDefault) e.preventDefault()
    if (!e.key) return false

    const keys = new Set([
      e.ctrlKey ? (isMac ? 'control': 'ctrl') : undefined,
      e.altKey ? (isMac ? 'option' : 'alt') : undefined,
      e.shiftKey ? 'shift' : undefined,
      e.metaKey ? (isMac ? 'command' : 'win') : undefined,
      ['shift', 'meta', 'control', 'option', 'alt'].includes(e.key.toLowerCase())
        ? undefined
        : e.code.replace(KEY_REGEX, '')
    ])

    const combo = [...keys].filter(Boolean)

    if (combo.length >= 2) {
      const comboString = combo.length < 2 ? '' : combo.join('+').toLowerCase()

      if (cb) {
        cb(comboString, e)
      }

      return false
    }
  }
}
