module.exports = class Cursor {
  constructor(player, parent) {
    const { document } = this.player = player
    this.$controls = document.createElement('footer')
    this.$controls.classList.add('playback-controls')
    this.$controls.innerHTML = this.template(html => html)
    this.events(this.$controls)
    parent.appendChild(this.$controls)
  }
  events($view) {
    const $toggle = $view.querySelector('#toggle')
    const $progress = $view.querySelector('#progress')

    this.player.progress(progress => {
      $progress.value = progress * 100 | 0
    })

    $toggle.addEventListener('click', event => {
      if(this.player.stopped) {
        this.player.window.console.log('play')
        $toggle.value = '▋▋'
        this.player.play(+$progress.value)
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
          opacity: 0;
        }
        .playback-controls:hover {
          opacity: 1;
        }
        .playback-controls input {
          color: white;
          border: none;
          background-color: transparent;
        }
        .playback-controls input[type="range"] {
          flex: 1;
        }
      </style>
      <input type="button" id="toggle" value="▶" />
      <input type="range" id="progress" min="0" max="100" step="1" value="0" />
    `
  }
}
