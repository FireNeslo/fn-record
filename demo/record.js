const {play, record} = require('..')

const tag = document.createElement.bind(document)
const el = (name, props) => Object.assign(tag(name), props)
const text = document.createTextNode.bind(document)
const append = (parent, child) => (parent.appendChild(child), parent)
const list =   (parent, children=[]) => children.reduce(append, parent)
const h = (name, props, children) => list(el(name, props), children)

const btn = txt => h('button', {}, [ text(txt) ])
const items = Array.from({ length: 50 })


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
  list(document.body, [
    h('main', {}, [
      h('div', { innerHTML: `
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width='100' height='100'>
          <path d="M 50,5 95,97.5 5,97.5 z"/>
        </svg>
      `}, []),
      ...items.map((_, i) => btn(i))
    ])
  ])
}

setup()

var stop = record({ debug: true })

document.addEventListener('dblclick', event => {
  const recording = stop()
  document.body.querySelector('main').remove()
  play(recording, { speed: 0.5 }).then(data => {
    setup()
    stop = record({ debug: true })
  })
})
