# remu-audio-napi

> Node.js bindings for remu-audio - A Rust audio playback library based on Rodio, supporting local and network audio playback.

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
player.setCallback((event) => {
  console.log('Event:', event.eventType)
  if (event.message) {
    console.log('Message:', event.message)
  }
})

// Load and play audio
await player.loadFile('./audio.mp3')
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

#### Constructor

```typescript
new Player()
```

Creates a new audio player instance.

#### Methods

##### `play(): void`

Start or resume audio playback.

##### `pause(): void`

Pause audio playback.

##### `stop(): void`

Stop playback and clear all loaded resources.

##### `seek(position: number): void`

Seek to a specific position in seconds.

##### `setVolume(volume: number): void`

Set the playback volume (0.0 to 1.0).

##### `loadFile(filePath: string): Promise<void>`

Load a local audio file. Supports formats: WAV, MP3, FLAC, OGG, etc.

##### `loadUrl(url: string): Promise<void>`

Load and stream audio from a URL.

##### `setCallback(callback: (event: PlayerEventData) => void): void`

Set a callback function to receive player events.

**Player Events:**

- `play` - Playback started or resumed
- `pause` - Playback paused
- `waiting` - Buffering/waiting for data
- `playing` - Playing with sufficient data
- `ended` - Playback ended
- `emptied` - Player resources cleared
- `durationchange` - Duration changed
- `volumechange` - Volume changed
- `seeking` - Seek operation started
- `seeked` - Seek operation completed
- `loadstart` - Loading started
- `loadeddata` - Data loaded
- `loadedmetadata` - Metadata loaded
- `error` - Error occurred (includes message field)

##### `setLoaderCallback(callback: (event: LoaderEventData) => void): void`

Set a callback function to receive loader events (for network streaming).

**Loader Events:**

- `completed` - Download completed
- `aborted` - Download aborted

#### Properties

##### `volume: number` (getter)

Get the current volume (0.0 to 1.0).

##### `paused: boolean` (getter)

Check if playback is paused.

##### `position: number` (getter)

Get the current playback position in seconds.

##### `duration: number | undefined` (getter)

Get the total duration in seconds, or undefined if unknown.

## Examples

### Play Local File

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()
await player.loadFile('./music.mp3')
player.play()
```

### Stream from URL

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

// Monitor loader events
player.setLoaderCallback((event) => {
  console.log('Loader event:', event.eventType)
})

await player.loadUrl('https://example.com/audio.mp3')
player.play()
```

### Monitor Playback Events

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

player.setCallback((event) => {
  switch (event.eventType) {
    case 'play':
      console.log('Playback started')
      break
    case 'pause':
      console.log('Playback paused')
      break
    case 'ended':
      console.log('Playback finished')
      break
    case 'error':
      console.error('Error:', event.message)
      break
  }
})

await player.loadFile('./audio.mp3')
player.play()
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
