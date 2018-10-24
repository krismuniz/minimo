window.$ = (q) => document.querySelector(q)

const isContent = (p) => (
  typeof p === 'string' || typeof p === 'number' || Array.isArray(p) || p.nodeType && p.nodeType === document.ELEMENT_NODE
)

const el = (querySelector, ...props) => {
  let nodeType = querySelector.match(/^[a-z0-9]+/i)
  let id = querySelector.match(/#([a-z]+[a-z0-9-]*)/gi)
  let classes = querySelector.match(/\.([a-z]+[a-z0-9-]*)/gi)
  let attributes = querySelector.match(/\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi)
  let node = (nodeType) ? nodeType[0] : 'div'
  let content = props.filter(isContent)
  let extraAttrs = props.filter((p) => !isContent(p)).reduce((a, b) => ({...a, ...b}), {})

  if (id && id.length > 1) {
    throw new Error('only 1 ID is allowed')
  }

  const element = document.createElement(node)

  if (id) {
    element.id = id[0].replace('#', '')
  }

  if (classes) {
    const attrClasses = classes.join(' ').replace(/\./g, '')
    element.setAttribute('class', attrClasses)
  }

  if (attributes) {
    attributes.forEach(item => {
      item = item.slice(0, -1).slice(1)

      let [label, value] = item.split('=')

      if (value) {
        value = value.replace(/^['"](.*)['"]$/, '$1')
      }

      element.setAttribute(label, value || '')
    })
  }

  for (let attribute in extraAttrs) {
    if (typeof extraAttrs[attribute] === "string") {
      element.setAttribute(attribute, extraAttrs[attribute])
    } else if (typeof extraAttrs[attribute] === "function") {
      element.addEventListener(attribute, extraAttrs[attribute])
    }
  }
  
  const processContent = (item) => {
    if (typeof item === "string" || typeof item === "number") {
      element.appendChild(document.createTextNode(item))
    } else if (Array.isArray(item)) {
      for (let child of item) {
        processContent(child)
      }
    } else if (item.nodeType === document.ELEMENT_NODE) {
      element.appendChild(item)
    }
  }
  
  processContent(content)

  return element
}
