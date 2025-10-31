import { Player } from '../index.js'

async function main() {
  // 创建播放器实例
  const player = new Player()

  // 设置播放器事件监听
  player.setCallback((event) => {
    console.log('Player Event:', event.eventType)
    if (event.message) {
      console.log('Message:', event.message)
    }
  })

  // 设置加载器事件监听（用于网络加载）
  player.setLoaderCallback((event) => {
    console.log('Loader Event:', event.eventType)
  })

  // 加载本地音频文件
  console.log('Loading local file...')
  await player.loadFile('./test.mp3')

  // 或者加载网络音频
  // await player.loadUrl('https://example.com/audio.mp3');

  // 播放
  console.log('Playing...')
  player.play()

  // 设置音量为50%
  player.setVolume(0.5)
  console.log('Volume:', player.volume)

  // 等待一段时间
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 暂停
  console.log('Pausing...')
  player.pause()
  console.log('Is paused:', player.paused)
  console.log('Current position:', player.position, 'seconds')
  console.log('Duration:', player.duration, 'seconds')

  // 跳转到10秒处
  console.log('Seeking to 10s...')
  player.seek(10)

  // 继续播放
  console.log('Resuming...')
  player.play()

  // 等待播放完成
  await new Promise((resolve) => setTimeout(resolve, 5000))

  // 停止并清空
  console.log('Stopping...')
  player.stop()
}

main().catch(console.error)
