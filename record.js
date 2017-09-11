
const ELEMENT = HTMLElement
const {TEXT_NODE, ATTRIBUTE_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE} = ELEMENT
const {addEventListener, removeEventListener} = ELEMENT

let recording = null
let roots = []
let start = 0

const observer = new MutationObserver(function(mutations) {
  if(!recording) return

  recording.push({
    time: performance.now() - start,
    changes: mutations.map(change => {
      switch(change.type) {
        case "attributes": return {
          type: change.type,
          name: change.attributeName,
          target: IDENTITY.get(change.target),
          value: change.target.getAttribute(change.attributeName)
        }
        case "characterData": return {
          type: change.type,
          target: IDENTITY.get(change.target),
          value: change.target.nodeValue
        }
        case "childList": return {
          type: change.type,
          target: IDENTITY.get(change.target),
          value: {
            added: Array.from(change.addedNodes)
              .map(snapshot),
            removed: Array.from(change.removedNodes)
              .map(node => IDENTITY.get(node))
          }
        }
      }
    })
  })
})

const IDENTITY = new WeakMap()

let uid = 0

function snapshot(root=document) {
  let node = null, id = uid++

  IDENTITY.set(root, id)

  if(!roots.length) {
    roots.push(root)
    if(recording) {
      observer.observe(root, {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true
      })
    }
  }

  switch(root.nodeType) {
    case TEXT_NODE:
      node = {id, name: '#text', content: root.nodeValue }
    break;
    case ATTRIBUTE_NODE:
      node = {id, name: root.name, content: root.value }
    break;
    default:
      node = {
        id: id,
        name: root.nodeName,
        attrs: root.attributes && Array.from(root.attributes)
          .map(attr => ({ name: attr.name, value: attr.value  })),
        shadow: root.shadowRoot && snapshot(root.shadowRoot),
        content: root.childNodes && Array.from(root.childNodes).map(snapshot)
      }
    break;
  }

  if(root.shadowRoot) {
    roots.push(root.shadowRoot)
    if(recording) {
      observer.observe(root.shadowRoot, {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true
      })
    }
  }

  return node
}

function debounce(time, callback) {
  var debounce = false
  var current = null

  return (...args) => {
    current = args
    if(debounce) return
    debounce = true
    setTimeout(done => {
      debounce = false
      callback(...current)
    }, time)
  }
}

function relative(current) {
  if(!(current.target && current.target.getBoundingClientRect)) return

  const rect = current.target.getBoundingClientRect()

  const x = Math.min((current.clientX - rect.left) / rect.width, 1)
  const y = Math.min((current.clientY - rect.top) / rect.height, 1)


  console.log({x, y})

  return {x, y}
}

function events(start, root) {
  var listener = null
  const events = []

  root.addEventListener('mousemove', listener = current => {
    const target = IDENTITY.get(current.target)
    const value = relative(current)

    console.log(value)

    if(!recording) return

    recording.push({
      time: performance.now() - start,
      changes: [{
        type: 'move',
        target: target,
        value: value
      }]
    })
  })

  events.push(['mousemove', listener])

  for(const event of ['touchstart', 'mousedown']) {
    root.addEventListener(event, listener = current => {
      recording.push({
        time: performance.now() - start,
        changes: [{
          type: 'pointerdown',
          target: IDENTITY.get(current.target),
          value: relative(current)
        }]
      })
    })
    events.push([event, listener])
  }
  for(const event of ['touchend', 'touchcancel', 'mouseup']) {
    root.addEventListener(event, listener = current => {
      recording.push({
        time: performance.now() - start,
        changes: [{
          type: 'pointerup',
          target: IDENTITY.get(current.target),
          value: relative(current)
        }]
      })
    })
    events.push([event, listener])
  }

  for(const event of ['keydown', 'keyup']) {
    root.addEventListener(event, listener = current => {
      if(!(current.ctrlKey || current.metaKey || current.altKey)) return

      recording.push({
        time: performance.now() - start,
        changes: [{
          type: event,
          value: current.key
        }]
      })
    })
    events.push([event, listener])
  }

  return ( ) => {
    for(const [event, listener] of events) {
      root.removeEventListener(event, listener)
    }
  }

}


module.exports = function record(options={}) {
  const tree = snapshot(options.root)
  const changes = recording = []
  const listeners = []
  start = performance.now()

  for(const root of roots) {
    listeners.push(events(start, root))
    observer.observe(root, {
      characterData: true,
      attributes: true,
      childList: true,
      subtree: true
    })
  }



  return function stop() {
    recording.push({
      time: performance.now() - start,
      changes: []
    })
    observer.disconnect();
    for(const destroy of listeners) destroy()
    recording = null
    start = 0
    return {
      tree,
      changes,
      width: innerWidth,
      height: innerHeight
    }
  }
}
