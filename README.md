<!-- TITLE -->
<!-- DESCRIPTION -->
## Usage
```js
const record = require('fn-record/record')
const play = require('fn-record/play')

// start recording
const stop = record()

setTimeout(function later() {

  // serilizable json recording
  const recording = stop()


  // playback
  play(recording)
}, 1000)

```
<!-- INSTALL -->
