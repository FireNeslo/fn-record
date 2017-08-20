const {play, record} = require('..')

const tag = document.createElement.bind(document)
const el = (name, props) => Object.assign(tag(name), props)
const text = document.createTextNode.bind(document)
const append = (parent, child) => (parent.appendChild(child), parent)
const list =   (parent, children=[]) => children.reduce(append, parent)
const h = (name, props, children) => list(el(name, props), children)

const btn = txt => h('button', {}, [ text(txt) ])
const items = Array.from({ length: 1000 })




list(document.head, [
  h('style', {}, [
    text(`
      main {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
      }
    `)
  ])
])

function setup() {
  append(document.body, h('main', {}, items.map((_, i) => btn(i))))
}

setup()

var stop = record({ debug: true })

document.addEventListener('dblclick', event => {
  const recording = stop()
  document.body.querySelector('main').remove()
  play(recording, { speed: 0.5 })
})
