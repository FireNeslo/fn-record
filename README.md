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

  // serializable json recording
  const recording = stop()


  // playback
  play(recording)
}, 1000)

```
<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
<ul>
<li>Install: <code>npm install --save fn-record</code></li>
<li>Require: <code>require('fn-record')</code></li>
</ul>

<!-- /INSTALL -->


## API

### Record

#### record()
Record the dom and all changes

##### Returns
* ***function*** *stop* stop callback

#### stop()
Callback to stop recording and return captured changes

##### Returns
* ****object**** *recording* captured changes

### Playback

#### play(recording, options)
Replay a previously recorded session

##### Returns
* ***Player*** *player* Player controls

##### Params:
* ***object*** *recording* - Previously captured changes

* ***object*** *options* - Playback options

```js
// Display pressed keyboard shortcuts
const Keys = require('fn-record/lib/ui/keys')
// Display cursor position
const Cursor = require('fn-record/lib/ui/cursor')
// Display playback controls [play pause seek speed doenload]
const Controls = require('fn-record/lib/ui/controls')

/* defaults */
export const options = {
  type: 'tab', // target to render to. [tab, popup, iframe]
  plugins: [ Keys, Cursor, Controls ], // Display plugins to use
  // pass in window object directly instead create based on type
  context: createContext(type),

}
```

#### player.play(from)
Start playback

##### Returns
* ***Promise*** *finished* Promise for playback completion

##### Params:
* ***number*** *from* - Float between 0 and 1 definin start point

#### player.seek(from)
Jump to point

##### Returns
* ***object*** *seekResult* data about start position
* ***number*** *seekResult.index* pointer to change number to start from
* ***object[]*** *seekResult.plugins* plugins to use for playback

##### Params:
* ***number*** *from* - Float between 0 and 1 definin start point


#### player.stop()
Stop playback

#### player.progress(callback)
Listen for progress

##### Params:
* ***function*** *callback(progress)* - callback to call on progress change
* ***number*** *progress* - number between 0 and 1 defining progress

### Plugins
A plugin is a class that can be used to add additional
visualization of the recorded data.

#### Plugin#constructor(player, $view)
* **Player** *player* - Control context for playback
* ***HTMLElement*** *$view* - Parent node for UI widgets

#### Plugin#attributes(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=attributes]
* ***string*** **change.name** attribute name,
* ***number*** **change.target** pointer to target node
* ***string*** **change.value** attribute value
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#childList(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=childList]
* ***number*** **change.target** pointer to target node
* ***object*** **change.value** childList changes
* ***object[]*** **change.value.added** snapshots of added nodes
* ***number[]*** **change.value.removed** pointers to removed nodes
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#characterData(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=characterData]
* ***number*** **change.target** pointer to target node
* ***string*** **change.value** text value
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#pointerdown(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=pointerdown]
* ***number*** **change.target** pointer to target node
* ***object*** **change.value** coordinates relative to target
* ***number*** **change.value.x** x coordinate relative to target
* ***number*** **change.value.y** x coordinate relative to target
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#pointerup(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=pointerup]
* ***number*** **change.target** pointer to target node
* ***object*** **change.value** coordinates relative to target
* ***number*** **change.value.x** x coordinate relative to target
* ***number*** **change.value.y** x coordinate relative to target
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#move(change, target)
* ***object*** **change** change object
* ***string*** **change.type** [=move]
* ***number*** **change.target** pointer to target node
* ***object*** **change.value** coordinates relative to target
* ***number*** **change.value.x** x coordinate relative to target
* ***number*** **change.value.y** x coordinate relative to target
* ***Node*** **target** - DOM node assosiated with pointer

#### Plugin#keydown(change)
* ***object*** **change** change object
* ***string*** **change.type** [=keydown]
* ***string*** **change.value** Name of pressed key

#### Plugin#keyup(change)
* ***object*** **change** change object
* ***string*** **change.type** [=keyup]
* ***string*** **change.value** Name of pressed key

<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; Øystein Ø. Olsen</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
