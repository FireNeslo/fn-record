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

function relative(change, target, cursor) {
  const rect = target.getBoundingClientRect()
  const cur = cursor.getBoundingClientRect()
  return {
    x: (rect.left + change.value.x * rect.width) - (cur.width / 2),
    y: (rect.top + change.value.y * rect.height) - (cur.height / 2)
  }
}


function applyChanges({changes, cursor, keys}, document) {

  for(const change of changes) {
    const target = NODES[change.target]
    let pos, rect

    if(!target) return

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
      case "keydown":
        keys.press(change.value)
      break;
      case "keyup":
        keys.release(change.value)
      break;
      default:
        console.log(change)
      break;
    }
  }
}

class Keys {
  constructor() {
    this.$pad = document.createElement('div')
    this.keys = new Set()
    Object.assign(this.$pad.style, {
      position: 'fixed',
      bottom: 0,
      right: 0
    })
  }
  press(key) {
    this.render()
    return this.keys.add(key), this
  }
  release(key) {
    this.render()
    return this.keys.delete(key), this
  }
  render() {
    if(this.rendering) return
    this.rendering = true
    this.$pad.innerHTML = ''
    requestAnimationFrame(delta => {

      for(const key of this.keys) {
        const $key = document.createElement('button')

        $key.textContent = key
        this.$pad.appendChild($key)
      }

      this.rendering = false
    })
  }
}

function createCursor(speed) {
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

  return cursor
}


function iframe() {
  const context = document.createElement('iframe')

  Object.assign(context.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width:  '100%',
    height:  '100%',
    border: 'thin solid green'
  })

  return context
}



class Playback {
  constructor(recording, {speed=1, context=iframe()}={}) {
    this.context = context
    this.recording = recording
    this.onProgress = []
    this.speed = speed
  }

  play(from=0) {

    const {recording, context, speed, onProgress} = this
    const self = this

    return this.promise = new Promise(resolve => {
      function replay() {
        let {index, cursor, keys} = self.seek(from)
        const start = (index - 1) >= 0 ? recording.changes[index-1].time : 0
        const end = recording.changes[recording.changes.length-1].time

        const startTime = Date.now()

        requestAnimationFrame(function loop() {
          const {changes, time} = recording.changes[index]

          const delta = (Date.now() - startTime) * speed

          if((delta+start) >= time) {
            index += 1
            applyChanges({changes, cursor, keys}, context.contentDocument)
          }
          for(const callback of onProgress) {
            callback((delta + start) / end)
          }
          if(recording.changes[index]) {
            requestAnimationFrame(loop)
          } else {
            resolve()
          }
        })
      }
      if(context.contentDocument) {
        replay()
      } else{
        context.addEventListener('load',replay)
      }

      if(!context.parentNode) document.body.appendChild(context)
    })
  }

  seek(from=0) {
    const {recording, context, speed} = this

    context.contentDocument.body.innerHTML = ''
    context.contentDocument.head.innerHTML = ''

    context.style.height = `${recording.height}px`
    context.style.width = `${recording.width}px`


    const cursor = this.cursor = createCursor(speed)
    const keys = this.keys = new Keys()
    const $body = context.contentDocument.body

    create(recording.tree, context.contentDocument)

    $body.appendChild(cursor)
    $body.appendChild(keys.$pad)

    const end = recording.changes[recording.changes.length-1].time
    const time = end * from


    for(let index = 0; index < recording.changes.length; index++) {
      const change = recording.changes[index]
      const {changes} = change

      if(change.time >= time) return {index, cursor, keys}

      applyChanges({changes, cursor, keys}, context.contentDocument)
    }
    return {index: 0, cursor, keys}
  }
  then(cb, eb, pb) {
    if(!this.promise) this.play()
    if(pb) this.onProgress.push(pb)
    return this.promise.then(cb, eb)
  }

  progress(pb) {
    if(pb) this.onProgress.push(pb)
    return this
  }

  catch(eb) {
    return this.then(null, eb)
  }

}


module.exports = function play(recording, {speed=1, context=iframe()}={}) {
  return new Playback(recording, {speed, context})
}
