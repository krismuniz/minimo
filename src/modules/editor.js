import { IS_MAC } from './constants.js'
import { $ } from './dom-utils.js'
import { debounce } from './utils.js'
import { getEditorContent, setEditorContent, getWritingModeShortcut } from './services/storage.js'

let quill = null

export const showEditor = () => {
  $('#editor-container').classList.remove('hidden')
  $('#editor-container').classList.add('animate')
  $('.layout').classList.remove('animate-land')
  quill.focus()
}

export const hideEditor = () => {
  quill.blur()
  $('#editor-container').classList.add('hidden')
  $('#editor-container').classList.remove('animate')

  setTimeout(() => {
    $('.layout').classList.remove('animate-land')
  }, 100)
  $('.layout').classList.add('animate-land')
}

export const toggleEditor = () => {
  if ($('#editor-container').classList.contains('hidden')) {
    showEditor()
  } else {
    hideEditor()
  }
}

const setKeyListener = () => {
  const shortcutListener = modikeys(
    (combo, event) => {
      if (event.target.getAttribute('data-shortcut-listener') !== 'true') {
        switch (combo) {
          case getWritingModeShortcut() || (IS_MAC ? 'shift+⌘' : 'ctrl+shift'):
            event.preventDefault()
            toggleEditor()
            break
          default:
            return true
        }
      }
    },
    { preventDefault: false }
  )

  window.addEventListener('keydown', shortcutListener)
}

function handleEditorChange(ch) {
  setEditorContent(quill.getContents())
}

export function getQuill() {
  return quill
}

export function initEditor() {
  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code'],
    [{ header: 1 }, { header: 2 }, 'blockquote'],
    ['clean']
  ]

  Quill.import('modules/clipboard')

  quill = new Quill('#editor', {
    theme: 'bubble',
    modules: {
      toolbar: toolbarOptions
    },
    placeholder: 'Jot down your thoughts...'
  })

  quill.on('text-change', debounce(handleEditorChange, 500))
  quill.setContents(getEditorContent())
  quill.setSelection(Infinity, Infinity)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'editor') {
      quill.setContents(JSON.parse(ev.newValue))
    }
  })

  setKeyListener()
}
