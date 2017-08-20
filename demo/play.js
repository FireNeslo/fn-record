const play = require('./play')

fetch('./recording.json')
  .then(res => res.json())
  .then(recording => play(recording))
