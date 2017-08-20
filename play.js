const NODES = {}

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


function createElement(node, document, parent) {
  const dom = apply(node, document, document.createElement(node.name))

  parent.appendChild(dom)

  return dom
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

function relative(change, target, cursor) {
  const rect = target.getBoundingClientRect()
  const cur = cursor.getBoundingClientRect()
  return {
    x: (rect.x + change.value.x * rect.width) - (cur.width / 2),
    y: (rect.y + change.value.y * rect.height) - (cur.height / 2)
  }
}

function applyChanges({changes, cursor}, document) {

  for(const change of changes) {
    const target = NODES[change.target]
    let pos, rect
    switch(change.type) {
      case "attributes":
        target.setAttribute(change.name, change.value)
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
      case "pointerdown":
        rect = target.getBoundingClientRect()
        pos = relative(change, target, cursor)

        Object.assign(cursor.style, {
          border: 'thin solid red',
          transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
        })
      break;
      case "pointerup":
        rect = target.getBoundingClientRect()
        pos = relative(change, target, cursor)

        Object.assign(cursor.style, {
          border: 'none',
          transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
        })
      break;
      case "move":
        rect = target.getBoundingClientRect()
        pos = relative(change, target, cursor)

        Object.assign(cursor.style, {
          transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
        })
      break;
      default:
        console.log(change)
      break;
    }
  }
}


module.exports = function play(recording, {speed = 1}={}) {
  const context = document.createElement('iframe')
  const cursor = document.createElement('span')

  cursor.textContent = 'x'

  Object.assign(cursor.style, {
    color: 'red',
    border: 'none',
    borderRadius: '50%',
    fontWeight: '800',
    position: 'absolute',
    transition: `transform linear ${150 / speed | 0}ms`,
    top: 0,
    left: 0
  })

  Object.assign(context.style, {
    width: '100%',
    height: '100%',
    position: 'fixed',
    top: 0,
    left: 0
  })

  return new Promise(resolve => {
    let index = 0

    context.onload = function() {
      create(recording.tree, context.contentDocument)

      context.contentDocument.body.appendChild(cursor)

      const start = performance.now()

      requestAnimationFrame(function loop() {
        if(!recording.changes[index]) {
          context.parentNode.removeChild(context)
          return resolve()
        }

        const time = (performance.now() - start) * speed
        const change = recording.changes[index]

        if(change.time <= time) {
          const {changes} = recording.changes[index++]
          applyChanges({changes, cursor}, context.contentDocument)
        }

        requestAnimationFrame(loop)
      })
    }
    document.body.appendChild(context)
  })
}
