function relative(change, target, cursor) {
  const rect = target.getBoundingClientRect()
  const cur = cursor.getBoundingClientRect()
  return {
    x: (rect.left + change.value.x * rect.width) - (cur.width / 2),
    y: (rect.top + change.value.y * rect.height) - (cur.height / 2)
  }
}

module.exports = class Cursor {
  constructor(context, parent) {
    this.$cursor = context.document.createElement('span')

    Object.assign(this.$cursor.style, {
      position: 'fixed',
      bottom: 0,
      right: 0
    })
    parent.appendChild(this.$cursor)
  }
  pointerdown(change, target) {
    const rect = target.getBoundingClientRect()
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      border: 'thin solid red',
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })

  }
  pointerup(change, target) {
    const rect = target.getBoundingClientRect()
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      border: 'none',
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })
  }
  move(change, target) {
    const rect = target.getBoundingClientRect()
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })
  }
}
