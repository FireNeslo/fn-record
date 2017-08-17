{
  const ELEMENT = HTMLElement
  const {TEXT_NODE, ATTRIBUTE_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE} = ELEMENT
  const {addEventListener, removeEventListener} = ELEMENT

  let recording = null
  let roots = []
  let start = 0

  const observer = new MutationObserver(function(mutations) {
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

  function record(options={}) {
    const tree = snapshot(options.root)
    const changes = recording = []

    start = performance.now()

    for(const root of roots) {
      observer.observe(root, {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true
      })
    }

    return function stop() {
      recorded = null
      start = 0
      return { tree, changes }
    }
  }
}
