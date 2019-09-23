const NODES = exports.NODES = {}

exports.render = applyChanges
exports.create = create

function createDocument(node, document, parent) {
  if(node.id) {
    NODES[node.id] = parent
  }
  return create(node.content[node.content.length-1], document, parent)
}

function apply(node, document, target) {
  if(node.id) {
    NODES[node.id] = target
  }

  if(node.attrs) for(const {name, value} of node.attrs) {
    target.setAttribute(name, value)
  }
  if(node.content) for(const child of node.content) {
    create(child, document, target)
  }

  if(node.shadow) {
    apply(node.shadow, document, target.attachShadow({mode: 'open'}))
  }

  return target
}

function createHTML(node, document, parent) {
  return apply(node, document, parent.documentElement)
}
function createHead(node, document, parent) {
  return apply(node, document, document.head)
}
function createBody(node, document, parent) {
  return apply(node, document, document.body)
}

const SVG_NS = "http://www.w3.org/2000/svg"

function createElement(node, document, parent) {
  let target = null

  if(node.name === 'svg' || (parent.namespaceURI||'').includes('svg')) {
    target = document.createElementNS(SVG_NS, node.name)
  } else {
    target = document.createElement(node.name)
  }

  parent.appendChild(apply(node, document, target))

  return target
}
function createText(node, document, parent) {
  const dom = document.createTextNode(node.content)

  if(node.id) {
    NODES[node.id] = dom
  }

  parent.appendChild(dom)
  return dom
}

function create(node, document, parent=document) {
  switch(node.name) {
    case "SCRIPT": case "#comment": return
    case "#text": return createText(node, document, parent)
    case "#document": return createDocument(node, document, parent)
    case "HTML": return createHTML(node, document, parent)
    case "HEAD": return createHead(node, document, parent)
    case "BODY": return createBody(node, document, parent)
    default: return createElement(node, document, parent)
  }
  return context
}

function applyChanges({changes, plugins}, document) {
  for(const change of changes) {
    const target = NODES[change.target]
    let pos, rect

    if(!target) return

    switch(change.type) {
      case "attributes":
        if(change.value == null) {
          target.removeAttribute(change.name)
        } else {
          target.setAttribute(change.name, change.value)
        }
      break;
      case "childList":
        const value = change.value
        for(const child of value.added || []) {
          create(child, document, target)
        }
        for(const remove of value.removed || []) {
          if(NODES[remove]) NODES[remove].remove()
        }
      break;
      case "characterData":
        target.nodeValue = change.value
      break;
    }
    if(plugins[change.type]) {
      for(const plugin of plugins[change.type]) {
        plugin[change.type]  (change, target)
      }
    }
  }
}
