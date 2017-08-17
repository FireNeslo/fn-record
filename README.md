<!-- TITLE/ -->

<h1>fn-record</h1>

<!-- /TITLE -->


<!-- DESCRIPTION/ -->

Record user actions as replayable dom *(experimental)*

<!-- /DESCRIPTION -->


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
<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save fn-record</code></li>
<li>Module: <code>require('fn-record')</code></li></ul>

<!-- /INSTALL -->
