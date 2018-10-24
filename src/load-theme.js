const setTheme = (theme) => {
  $('html').className = Array.from($('html').classList).filter(c => !c.startsWith('theme-')).join(' ')
  $('html').classList.add('theme-' + theme)
}

const setMode = (mode) => {
  $('html').className = Array.from($('html').classList).filter(c => !c.startsWith('mode-')).join(' ')
  $('html').classList.add('mode-' + mode)

  if ($('summary')) {
    // hack: fixes issue with summary not changing color
    $('summary').click()
    $('summary').click()
  }
}

const setFavicons = (state) => {
  $('html').className = Array.from($('html').classList).filter(c => !c.startsWith('favicons-')).join(' ')
  $('html').classList.add('favicons-' + state)
}

const setCss = (css) => {
  $('#custom-style').textContent = css
}

const setAppearance = (appearance) => {
  // custom styles can only be added after all DOM contents have been loaded :(
  document.addEventListener('DOMContentLoaded', () => {
    if (appearance.css) setCss(appearance.css)
  })

  if (appearance.mode) setMode(appearance.mode)
  if (appearance.theme) setTheme(appearance.theme)
  if (appearance.favicons) setFavicons(appearance.favicons)
}

const loadAppearance = () => {
  let mode = localStorage.getItem('mode') || 'dark'
  let theme = localStorage.getItem('theme') || 'smooth-dark'
  let favicons = localStorage.getItem('favicons') || 'hide'
  let css = localStorage.getItem('css') || ''

  setAppearance({ mode, theme, favicons, css })

  chrome.storage.sync.get(['theme', 'mode', 'css'], (settings) => {
    let preset = {
      mode,
      theme,
      favicons,
      css,
      ...settings
    }

    localStorage.setItem('mode', preset.mode)
    localStorage.setItem('theme', preset.theme)
    localStorage.setItem('favicons', preset.favicons)
    localStorage.setItem('css', preset.css)

    setAppearance({ mode: preset.mode, theme: preset.theme, favicons: preset.favicons, css: preset.css })
  })
}

loadAppearance()
