module.exports = class Keys {
  constructor(context, parent) {
    this.$pad = document.createElement('div')
    this.keys = new Set()

    Object.assign(this.$pad.style, {
      position: 'fixed',
      bottom: 0,
      right: 0
    })

    parent.appendChild(this.$pad)
  }
  keyup(change) {
    this.render()
    return this.keys.add(change.value), this
  }
  keydown(change) {
    this.render()
    return this.keys.delete(change.value), this
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
