module.exports = class Cursor {
  constructor(player, parent) {
    const { document } = this.player = player
    const download =  JSON.stringify(player.recording)
    this.download = new Blob([ download ], { type: 'application/json' })
    this.$controls = document.createElement('footer')
    this.$controls.classList.add('playback-controls')
    this.$controls.classList.toggle('playing', !player.stopped)
    this.$controls.innerHTML = this.template(html => html)
    this.events(this.$controls)
    parent.appendChild(this.$controls)
  }
  events($view) {
    const $toggle = $view.querySelector('.toggle')
    const $download = $view.querySelector('.download')
    const $progress = $view.querySelector('.progress')
    const $speed = $view.querySelector('.speed')

    const recording = URL.createObjectURL(this.download)

    $download.setAttribute('href', recording)

    this.player.progress(progress => {
      $progress.value = progress * 100 | 0

      this.player.window.console.log({ progress })

      if(progress | 0) {
        $toggle.value = '▶'
        this.player.stopped = true
      }
      this.$controls.classList.toggle('playing', !this.player.stopped)
    })

    $speed.addEventListener('change', event => {
      this.player.speed = +$speed.value
    })

    $progress.addEventListener('input', event => {
      this.player.seek(+$progress.value / 100)
    })

    $toggle.addEventListener('click', event => {
      if(this.player.stopped) {
        if(+$progress.value === 100) {
          $progress.value = 0
        }
        this.player.window.console.log('play')
        $toggle.value = '▋▋'
        this.player.play(+$progress.value / 100)
      } else {
        this.player.window.console.log('pause')
        $toggle.value = '▶'
        this.player.stop()
      }
    })
  }

  template(html) {
    return html `
      <style>
        .playback-controls {
          display: flex;
          background-color: black;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
        }
        .playback-controls.playing {
          opacity: 0;
        }
        .playback-controls.playing:hover {
          opacity: 1;
        }
        .playback-controls .download,
        .playback-controls .download:hover,
        .playback-controls .download:visited {
          color: white;
          min-width: 2em;
          text-align: center;
          padding: 0.5em 0;
        }
        .playback-controls .download:hover {
          font-weight: bold;
        }

        .playback-controls input {
          color: white;
          border: none;
          min-width: 2em;
          background-color: transparent;
        }
        .playback-controls input[type="range"] {
          flex: 1;
        }
      </style>
      <input type="button" class="toggle" value="▶" />
      <input type="range" class="progress" min="0" max="100" step="1" value="0" />
      <select class="speed">
        <option value="0.25">0.25</option>
        <option value="0.5">0.5</option>
        <option selected value="1">1</option>
        <option value="2">2</option>
        <option value="4">4</option>
      </select>
      <a class="download" download="recording.json">💾</a>
    `
  }
}
