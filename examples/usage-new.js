import { Player } from '../index.js'

// ============ 创建播放器实例 ============
const player = new Player()

console.log('=== RemuPlayer 使用示例 (HTMLAudioElement 风格) ===\n')

// ============ 方式 1: 使用 addEventListener ============
console.log('设置事件监听器...')
player.addEventListener('play', () => {
  console.log('▶️  播放开始')
})

player.addEventListener('pause', () => {
  console.log('⏸️  播放暂停')
})

player.addEventListener('ended', () => {
  console.log('⏹️  播放结束')
  if (player.loop) {
    console.log('🔁 循环播放...')
  }
})

player.addEventListener('loadstart', () => {
  console.log('📥 开始加载音频...')
})

player.addEventListener('loadedmetadata', () => {
  console.log(`📊 元数据加载完成 - 时长: ${player.duration}s`)
})

player.addEventListener('loadeddata', () => {
  console.log('✅ 音频数据加载完成')
})

player.addEventListener('durationchange', () => {
  console.log(`⏱️  时长变化: ${player.duration}s`)
})

player.addEventListener('volumechange', () => {
  console.log(`🔊 音量变化: ${Math.round(player.volume * 100)}%`)
})

player.addEventListener('seeking', () => {
  console.log('⏩ 正在寻址...')
})

player.addEventListener('seeked', () => {
  console.log(`✅ 寻址完成 - 当前位置: ${player.currentTime}s`)
})

player.addEventListener('error', () => {
  console.error('❌ 播放错误:', player.error?.message)
})

// ============ 方式 2: 使用 on* 事件处理器（更像 HTMLAudioElement）============
console.log('\n也可以使用 on* 风格的事件处理器:')

// 取消注释以使用 on* 风格
// player.onplay = () => {
//   console.log('播放开始 (via onplay)')
// }
//
// player.onpause = () => {
//   console.log('播放暂停 (via onpause)')
// }

// ============ 加载和播放音频 ============
async function demo() {
  try {
    console.log('\n=== 开始演示 ===\n')

    // 设置音频源
    player.src = './test.mp3' // 或者网络 URL: 'https://example.com/audio.mp3'

    // 设置属性
    player.volume = 0.8
    console.log(`设置音量: ${Math.round(player.volume * 100)}%`)

    // 等待加载
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 播放
    console.log('\n开始播放...')
    await player.play()

    // 等待 3 秒
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 查看状态
    console.log('\n=== 当前状态 ===')
    console.log(`是否暂停: ${player.paused}`)
    console.log(`当前时间: ${player.currentTime.toFixed(2)}s`)
    console.log(`总时长: ${player.duration}s`)
    console.log(`音量: ${Math.round(player.volume * 100)}%`)
    console.log(`是否静音: ${player.muted}`)
    console.log(`播放速率: ${player.playbackRate}x`)

    // 暂停
    console.log('\n暂停播放...')
    player.pause()

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 跳转
    console.log('\n跳转到 5 秒处...')
    player.currentTime = 5.0

    await new Promise((resolve) => setTimeout(resolve, 500))

    // 继续播放
    console.log('\n继续播放...')
    await player.play()

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 调整音量
    console.log('\n降低音量...')
    player.volume = 0.3

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 静音
    console.log('\n静音...')
    player.muted = true

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 取消静音
    console.log('\n取消静音...')
    player.muted = false

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 使用便利方法
    console.log('\n使用便利方法:')
    console.log('切换播放/暂停...')
    player.togglePlay()

    await new Promise((resolve) => setTimeout(resolve, 1000))

    player.togglePlay()

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 停止
    console.log('\n停止播放...')
    player.stop()

    console.log('\n=== 演示完成 ===')
  } catch (error) {
    console.error('演示过程中出错:', error)
  }
}

// 运行演示
demo()

// ============ 其他用法示例 ============

// 循环播放
// player.loop = true

// 自动播放
// player.autoplay = true

// 预加载设置
// player.preload = 'auto' // 'none' | 'metadata' | 'auto'

// 直接加载文件或 URL
// player.loadFile('C:/Music/song.mp3')
// player.loadUrl('https://example.com/audio.mp3')

// 播放速率控制（需要 Rust 层支持）
// player.playbackRate = 1.5 // 1.5 倍速播放
