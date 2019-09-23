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
    this.$cursor.textContent = 'x'
    this.context = context
    Object.assign(this.$cursor.style, {
      color: 'red',
      border: 'none',
      fontSize: '2em',
      borderRadius: '50%',
      fontWeight: '800',
      position: 'absolute',
      transition: `transform linear ${150 / context.speed | 0}ms`,
      top: 0,
      left: 0
    })
    parent.appendChild(this.$cursor)
  }
  pointerdown(change, target) {
    const rect = target.getBoundingClientRect()
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      border: 'thick solid red',
      transition: `transform linear ${150 / this.context.speed | 0}ms`,
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })

  }
  pointerup(change, target) {
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      border: 'none',
      transition: `transform linear ${150 / this.context.speed | 0}ms`,
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })
  }
  move(change, target) {
    const pos = relative(change, target, this.$cursor)

    Object.assign(this.$cursor.style, {
      transition: `transform linear ${150 / this.context.speed | 0}ms`,
      transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`
    })
  }
}
