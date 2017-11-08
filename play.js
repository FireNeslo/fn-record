const { create, render, NODES } = require('./lib/render')

const ACTIONS = require('./lib/actions')
const createContext = require('./lib/context')

const Keys = require('./lib/ui/keys')
const Cursor = require('./lib/ui/cursor')
const Controls = require('./lib/ui/controls')

function add(target, key, value) {
  if(!target[key]) target[key] = []
  return target[key].push(value)
}

class Playback {
  constructor(recording, { type, context, plugins }) {
    if(!plugins) plugins = [ Keys, Cursor, Controls ]

    this.plugins = {}
    this.stopped = true
    this.context = context || createContext(type, recording)
    this.recording = recording
    this.onProgress = []
    this.speed = 1
    if(this.context.document) {
      this.context.addEventListener('load', event => {
        this.plugins = this.createPlugins(plugins)
      })
    } else {
      if(!this.plugins) {
        this.plugins = this.createPlugins(plugins)
      }
    }
  }

  get document() {
    return this.context.document
  }
  get window() {
    return this.context
  }
  createPlugins(PLUGINS) {
    const plugins = {}

    this.$plugin = this.document.createElement('div')

    for(const Plugin of PLUGINS) {
      const plugin = new Plugin(this, this.$plugin)

      for(const ACTION of ACTIONS) {
        if(ACTION in plugin) {
          add(plugins, ACTION, plugin)
        }
      }
    }

    this.document.body.appendChild(this.$plugin)

    return plugins
  }


  stop() {
    this.stopped = true
    return this
  }

  play(from=0) {
    this.stopped = false

    const {recording, context, onProgress} = this
    const self = this

    return this.promise = new Promise(resolve => {
      function replay() {
        let {index, plugins} = self.seek(from)
        const start = (index - 1) >= 0 ? recording.changes[index-1].time : 0
        const end = recording.changes[recording.changes.length-1].time

        const startTime = Date.now()
        const raf = context.requestAnimationFrame

        raf(function loop() {
          const {changes, time} = recording.changes[index]

          const delta = (Date.now() - startTime) * self.speed

          if((delta+start) >= time) {
            index += 1
            render({ changes, plugins }, context.document)
          }
          for(const callback of onProgress) {
            callback((delta + start) / end)
          }
          if(recording.changes[index] && !self.stopped) {
            raf(loop)
          } else {
            resolve((delta + start) / end)
          }
        })
      }
      if(context.document) {
        replay()
      } else{
        context.addEventListener('load',replay)
      }
    })
  }

  clear(parent) {
    for(const node of Array.from(parent.childNodes)) {
      if(node !== this.$plugin) {
        parent.removeChild(node)
      }
    }
  }

  seek(from=0) {
    for(const key in NODES) {
      delete NODES[key]
    }
    const {recording, context, speed} = this
    const $body = context.document.body

    this.clear(context.document.head)
    this.clear(context.document.body)

    create(recording.tree, context.document)

    const { plugins } = this

    const end = recording.changes[recording.changes.length-1].time
    const time = end * from

    for(let index = 0; index < recording.changes.length; index++) {
      const change = recording.changes[index]
      const {changes} = change

      if(change.time >= time) return { index, plugins }

      render({ changes, plugins }, context.document)
    }
    return { index: 0, plugins }
  }
  then(cb, eb, pb) {
    return Promise.resolve(this.context)
  }

  progress(pb) {
    if(pb) this.onProgress.push(pb)
    return this
  }

  catch(eb) {
    return this.then(null, eb)
  }

}


module.exports = function play(recording, options) {
  return new Playback(recording, options)
}
