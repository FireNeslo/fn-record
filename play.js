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

function applyChanges({changes}, document) {

  for(const change of changes) {
    const target = NODES[change.target]
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
          target.removeChild(NODES[remove])
        }
      break;
      case "characterData":
        target.nodeValue = change.value
      break;
      default:
        console.log(change)
      break;
    }
  }
}


module.exports = function play(recording) {
  const context = document.createElement('iframe')

  context.setAttribute('style', 'width: 100%; height: 100vh;')

  context.onload = function() {
    create(recording.tree, context.contentDocument)

    const start = performance.now()

    requestAnimationFrame(function loop() {
      if(recording.changes.length) {
        requestAnimationFrame(loop)
      } else {
        return
      }
      const time = performance.now() - start
      const change = recording.changes[0]

      if(change.time <= time) {
        applyChanges(recording.changes.shift(), context.contentDocument)
      }
    })
  }

  document.body.appendChild(context)
}
