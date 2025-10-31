# remu-audio-napi

> Node.js bindings for remu-audio - A Rust audio playback library based on Rodio, supporting local and network audio playback.

English | [简体中文](./README.zh-CN.md)

# Features

- 🎵 Play local audio files
- 🌐 Stream audio from URLs
- ⏯️ Full playback control (play, pause, stop, seek)
- 🔊 Volume control
- 📊 Playback position and duration tracking
- 📡 Event callbacks for player and loader events
- 🚀 High-performance native implementation

## Installation

```bash
npm install @remuplay/remu-audio
# or
yarn add @remuplay/remu-audio
```

## Quick Start

```javascript
import { Player } from '@remuplay/remu-audio'

// Create player instance
const player = new Player()

// Set up event listeners
player.addEventListener('play', () => {
  console.log('Playback started')
})

player.addEventListener('ended', () => {
  console.log('Playback finished')
})

player.addEventListener('error', (event) => {
  console.error('Error:', event.detail?.message)
})

// Load and play audio
await player.load('./audio.mp3')
player.play()

// Control playback
player.setVolume(0.5) // Set volume to 50%
player.seek(10) // Seek to 10 seconds
player.pause() // Pause playback
player.play() // Resume playback
player.stop() // Stop and clear resources
```

## API Reference

### Player Class

The `Player` class extends `EventTarget`, providing a familiar event-driven API for audio playback control.

#### Constructor

```typescript
new Player()
```

Creates a new audio player instance.

#### Methods

##### `play(): Promise<void>`

Start or resume audio playback. Returns a promise that resolves when playback starts.

##### `pause(): void`

Pause audio playback.

##### `stop(): void`

Stop playback and clear all loaded resources.

##### `seek(position: number): void`

Seek to a specific position in seconds. Automatically clamps to valid range [0, duration].

##### `setVolume(volume: number): void`

Set the playback volume (0.0 to 1.0). Automatically clamps to valid range and unmutes if volume > 0.

##### `setMuted(muted: boolean): void`

Mute or unmute audio playback.

##### `load(src: string): Promise<void>`

Load an audio file or stream. Automatically detects the source type:

- Local file: `./audio.mp3` or `/path/to/audio.mp3`
- Network stream: `http://...` or `https://...`

Supports formats: WAV, MP3, FLAC, OGG, etc.

##### `dispose(): void`

Release all player resources, stop playback, and clean up timers and listeners. The player cannot be used after calling this method.

##### `addEventListener(type: string, listener: EventListener): void`

Register an event listener for player events. Inherited from `EventTarget`.

#### Events

The player emits the following events that can be listened to using `addEventListener()`:

**Playback Control Events:**

- `play` - Playback started or resumed
- `pause` - Playback paused
- `playing` - Playing with sufficient data
- `waiting` - Buffering/waiting for data
- `ended` - Playback finished
- `emptied` - Player resources cleared

**Loading Events:**

- `loadstart` - Loading started
- `loadeddata` - Data loaded and ready to play
- `loadedmetadata` - Metadata (duration, etc.) loaded
- `completed` - Network stream download completed
- `aborted` - Network stream download aborted

**Progress Events:**

- `timeupdate` - Current playback position updated (fires ~every 200ms during playback)
- `durationchange` - Duration changed

**Seek Events:**

- `seeking` - Seek operation started
- `seeked` - Seek operation completed

**Volume Events:**

- `volumechange` - Volume or muted state changed

**Error Events:**

- `error` - Error occurred (event.detail.message contains error details)

#### Properties

##### `src: string` (getter)

Get the current audio source path or URL.

##### `currentTime: number` (getter)

Get the current playback position in seconds.

##### `duration: number` (getter)

Get the total duration in seconds. Returns `NaN` if duration is unknown.

##### `volume: number` (getter)

Get the current volume (0.0 to 1.0).

##### `muted: boolean` (getter)

Check if audio is muted.

##### `paused: boolean` (getter)

Check if playback is paused.

##### `ended: boolean` (getter)

Check if playback has ended.

## Examples

### Play Local File

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()
await player.load('./music.mp3')
await player.play()
```

### Stream from URL

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

// Monitor loader events
player.addEventListener('loadstart', () => {
  console.log('Loading started')
})

player.addEventListener('completed', () => {
  console.log('Download completed')
})

await player.load('https://example.com/audio.mp3')
await player.play()
```

### Monitor Playback Events

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

player.addEventListener('play', () => {
  console.log('Playback started')
})

player.addEventListener('pause', () => {
  console.log('Playback paused')
})

player.addEventListener('ended', () => {
  console.log('Playback finished')
})

player.addEventListener('error', (event) => {
  console.error('Error:', event.detail?.message)
})

await player.load('./audio.mp3')
await player.play()
```

### Track Playback Progress

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

player.addEventListener('timeupdate', () => {
  console.log(`Progress: ${player.currentTime.toFixed(2)}s / ${player.duration.toFixed(2)}s`)
})

player.addEventListener('durationchange', () => {
  console.log(`Duration: ${player.duration.toFixed(2)}s`)
})

await player.load('./audio.mp3')
await player.play()
```

### Advanced: Complete Control

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

// Setup event listeners
player.addEventListener('loadedmetadata', () => {
  console.log(`Duration: ${player.duration}s`)
})

player.addEventListener('ended', () => {
  console.log('Playback finished')
  player.dispose() // Clean up resources
})

// Load and play
await player.load('./audio.mp3')
await player.play()

// Wait 5 seconds, then seek to 10s
setTimeout(() => {
  player.seek(10)
}, 5000)

// Adjust volume
player.setVolume(0.5)

// Mute/unmute
player.setMuted(true)
setTimeout(() => player.setMuted(false), 2000)

// Check status
console.log({
  currentTime: player.currentTime,
  duration: player.duration,
  volume: player.volume,
  muted: player.muted,
  paused: player.paused,
  ended: player.ended,
})
```

## Development

### Build

After `yarn build/npm run build` command, you can see `package-template.[darwin|win32|linux].node` file in project root. This is the native addon built from [lib.rs](./src/lib.rs).

### Test

With [ava](https://github.com/avajs/ava), run `yarn test/npm run test` to testing native addon. You can also switch to another testing framework if you want.

### CI

With GitHub Actions, each commit and pull request will be built and tested automatically in [`node@20`, `@node22`] x [`macOS`, `Linux`, `Windows`] matrix. You will never be afraid of the native addon broken in these platforms.

### Release

Release native package is very difficult in old days. Native packages may ask developers who use it to install `build toolchain` like `gcc/llvm`, `node-gyp` or something more.

With `GitHub actions`, we can easily prebuild a `binary` for major platforms. And with `N-API`, we should never be afraid of **ABI Compatible**.

The other problem is how to deliver prebuild `binary` to users. Downloading it in `postinstall` script is a common way that most packages do it right now. The problem with this solution is it introduced many other packages to download binary that has not been used by `runtime codes`. The other problem is some users may not easily download the binary from `GitHub/CDN` if they are behind a private network (But in most cases, they have a private NPM mirror).

In this package, we choose a better way to solve this problem. We release different `npm packages` for different platforms. And add it to `optionalDependencies` before releasing the `Major` package to npm.

`NPM` will choose which native package should download from `registry` automatically. You can see [npm](./npm) dir for details. And you can also run `yarn add @napi-rs/package-template` to see how it works.

## Develop requirements

- Install the latest `Rust`
- Install `Node.js@10+` which fully supported `Node-API`
- Install `yarn@1.x`

## Test in local

- yarn
- yarn build
- yarn test

And you will see:

```bash
$ ava --verbose

  ✔ sync function from native code
  ✔ sleep function from native code (201ms)
  ─

  2 tests passed
✨  Done in 1.12s.
```

## Release package

Ensure you have set your **NPM_TOKEN** in the `GitHub` project setting.

In `Settings -> Secrets`, add **NPM_TOKEN** into it.

When you want to release the package:

```bash
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

git push
```

GitHub actions will do the rest job for you.

> WARN: Don't run `npm publish` manually.

## 📃 About README

✨ This README was generated with GitHub Copilot ✨
