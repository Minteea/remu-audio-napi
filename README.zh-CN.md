# remu-audio-napi

> remu-audio 的 Node.js 绑定 - 基于 Rodio 的 Rust 音频播放库，支持本地和网络音频播放。

[English](./README.md) | 简体中文

# 特性

- 🎵 播放本地音频文件
- 🌐 从 URL 流式传输音频
- ⏯️ 完整的播放控制（播放、暂停、停止、定位）
- 🔊 音量控制
- 📊 播放位置和时长跟踪
- 📡 播放器和加载器事件回调
- 🚀 高性能原生实现

## 安装

```bash
npm install @remuplay/remu-audio
# 或
yarn add @remuplay/remu-audio
```

## 快速开始

```javascript
import { Player } from '@remuplay/remu-audio'

// 创建播放器实例
const player = new Player()

// 设置事件监听器
player.addEventListener('play', () => {
  console.log('播放开始')
})

player.addEventListener('ended', () => {
  console.log('播放结束')
})

player.addEventListener('error', (event) => {
  console.error('错误:', event.detail?.message)
})

// 加载并播放音频
await player.load('./audio.mp3')
player.play()

// 控制播放
player.setVolume(0.5) // 设置音量为 50%
player.seek(10) // 定位到 10 秒
player.pause() // 暂停播放
player.play() // 恢复播放
player.stop() // 停止并清除资源
```

## API 参考

### Player 类

`Player` 类继承自 `EventTarget`，提供了熟悉的事件驱动 API 来控制音频播放。

#### 构造函数

```typescript
new Player()
```

创建一个新的音频播放器实例。

#### 方法

##### `play(): Promise<void>`

开始或恢复音频播放。返回一个在播放开始时解析的 Promise。

##### `pause(): void`

暂停音频播放。

##### `stop(): void`

停止播放并清除所有已加载的资源。

##### `seek(position: number): void`

定位到指定位置（秒）。自动限制在有效范围 [0, duration] 内。

##### `setVolume(volume: number): void`

设置播放音量（0.0 到 1.0）。自动限制在有效范围内，如果音量 > 0 则自动取消静音。

##### `setMuted(muted: boolean): void`

静音或取消静音音频播放。

##### `load(src: string): Promise<void>`

加载音频文件或流。自动检测源类型：

- 本地文件：`./audio.mp3` 或 `/path/to/audio.mp3`
- 网络流：`http://...` 或 `https://...`

支持的格式：WAV、MP3、FLAC、OGG 等。

##### `dispose(): void`

释放所有播放器资源，停止播放，并清理定时器和监听器。调用此方法后播放器将无法再使用。

##### `addEventListener(type: string, listener: EventListener): void`

为播放器事件注册事件监听器。继承自 `EventTarget`。

#### 事件

播放器会发出以下可以使用 `addEventListener()` 监听的事件：

**播放控制事件：**

- `play` - 播放开始或恢复
- `pause` - 播放暂停
- `playing` - 正在播放且数据充足
- `waiting` - 缓冲/等待数据
- `ended` - 播放结束
- `emptied` - 播放器资源已清除

**加载事件：**

- `loadstart` - 加载开始
- `loadeddata` - 数据已加载并准备播放
- `loadedmetadata` - 元数据（时长等）已加载
- `completed` - 网络流下载完成
- `aborted` - 网络流下载中止

**进度事件：**

- `timeupdate` - 当前播放位置更新（播放期间约每 200ms 触发一次）
- `durationchange` - 时长改变

**定位事件：**

- `seeking` - 定位操作开始
- `seeked` - 定位操作完成

**音量事件：**

- `volumechange` - 音量或静音状态改变

**错误事件：**

- `error` - 发生错误（event.detail.message 包含错误详情）

#### 属性

##### `src: string` (getter)

获取当前音频源路径或 URL。

##### `currentTime: number` (getter)

获取当前播放位置（秒）。

##### `duration: number` (getter)

获取总时长（秒）。如果时长未知则返回 `NaN`。

##### `volume: number` (getter)

获取当前音量（0.0 到 1.0）。

##### `muted: boolean` (getter)

检查音频是否静音。

##### `paused: boolean` (getter)

检查播放是否暂停。

##### `ended: boolean` (getter)

检查播放是否已结束。

## 示例

### 播放本地文件

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()
await player.load('./music.mp3')
await player.play()
```

### 从 URL 流式传输

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

// 监听加载器事件
player.addEventListener('loadstart', () => {
  console.log('开始加载')
})

player.addEventListener('completed', () => {
  console.log('下载完成')
})

await player.load('https://example.com/audio.mp3')
await player.play()
```

### 监听播放事件

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

player.addEventListener('play', () => {
  console.log('播放开始')
})

player.addEventListener('pause', () => {
  console.log('播放暂停')
})

player.addEventListener('ended', () => {
  console.log('播放结束')
})

player.addEventListener('error', (event) => {
  console.error('错误:', event.detail?.message)
})

await player.load('./audio.mp3')
await player.play()
```

### 跟踪播放进度

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

player.addEventListener('timeupdate', () => {
  console.log(`进度: ${player.currentTime.toFixed(2)}s / ${player.duration.toFixed(2)}s`)
})

player.addEventListener('durationchange', () => {
  console.log(`时长: ${player.duration.toFixed(2)}s`)
})

await player.load('./audio.mp3')
await player.play()
```

### 高级：完整控制

```javascript
import { Player } from '@remuplay/remu-audio'

const player = new Player()

// 设置事件监听器
player.addEventListener('loadedmetadata', () => {
  console.log(`时长: ${player.duration}秒`)
})

player.addEventListener('ended', () => {
  console.log('播放结束')
  player.dispose() // 清理资源
})

// 加载并播放
await player.load('./audio.mp3')
await player.play()

// 5 秒后定位到 10 秒
setTimeout(() => {
  player.seek(10)
}, 5000)

// 调整音量
player.setVolume(0.5)

// 静音/取消静音
player.setMuted(true)
setTimeout(() => player.setMuted(false), 2000)

// 检查状态
console.log({
  currentTime: player.currentTime,
  duration: player.duration,
  volume: player.volume,
  muted: player.muted,
  paused: player.paused,
  ended: player.ended,
})
```

## 开发

### 构建

执行 `yarn build` 或 `npm run build` 命令后，您可以在项目根目录看到 `package-template.[darwin|win32|linux].node` 文件。这是从 [lib.rs](./src/lib.rs) 构建的原生插件。

### 测试

使用 [ava](https://github.com/avajs/ava)，运行 `yarn test` 或 `npm run test` 来测试原生插件。如果需要，您也可以切换到其他测试框架。

### 持续集成

通过 GitHub Actions，每个提交和拉取请求都会在 [`node@20`, `@node22`] x [`macOS`, `Linux`, `Windows`] 矩阵中自动构建和测试。您不必担心原生插件在这些平台上出现问题。

### 发布

在过去，发布原生包是非常困难的。原生包可能要求使用它的开发者安装 `build toolchain`，如 `gcc/llvm`、`node-gyp` 等。

通过 `GitHub actions`，我们可以轻松地为主流平台预构建 `binary`。而且通过 `N-API`，我们不必担心 **ABI 兼容性**。

另一个问题是如何将预构建的 `binary` 交付给用户。在 `postinstall` 脚本中下载它是目前大多数包采用的常见方式。这种解决方案的问题是它引入了许多其他包来下载 `runtime codes` 未使用的二进制文件。另一个问题是，如果用户位于私有网络后面，可能无法轻易从 `GitHub/CDN` 下载二进制文件（但在大多数情况下，他们有私有 NPM 镜像）。

在这个包中，我们选择了一种更好的方式来解决这个问题。我们为不同平台发布不同的 `npm packages`，并在将 `Major` 包发布到 npm 之前将其添加到 `optionalDependencies`。

`NPM` 会自动从 `registry` 选择应下载哪个原生包。您可以查看 [npm](./npm) 目录了解详情。您也可以运行 `yarn add @napi-rs/package-template` 看看它是如何工作的。

## 开发要求

- 安装最新版 `Rust`
- 安装完全支持 `Node-API` 的 `Node.js@10+`
- 安装 `yarn@1.x`

## 本地测试

- yarn
- yarn build
- yarn test

您将看到：

```bash
$ ava --verbose

  ✔ sync function from native code
  ✔ sleep function from native code (201ms)
  ─

  2 tests passed
✨  Done in 1.12s.
```

## 发布包

确保您已在 `GitHub` 项目设置中设置了 **NPM_TOKEN**。

在 `Settings -> Secrets` 中添加 **NPM_TOKEN**。

当您想要发布包时：

```bash
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

git push
```

GitHub actions 会为您完成其余工作。

> 警告：不要手动运行 `npm publish`。

## 📃 关于 README

✨ 本 README 使用 GitHub Copilot 生成 ✨
