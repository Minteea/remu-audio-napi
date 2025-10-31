import test from 'ava'

import { Player } from '..'

const wait = (time: number) =>
  new Promise<void>((res) => {
    let t = setTimeout(() => {
      res()
      clearTimeout(t)
    }, time)
  })

let player: Player = new Player()

// ============ 播放控制事件 ============
player.addEventListener('play', () => {
  console.log('[@play] 播放开始')
})

player.addEventListener('pause', () => {
  console.log('[@pause] 播放暂停')
})

player.addEventListener('playing', () => {
  console.log('[@playing] 正在播放')
})

player.addEventListener('waiting', () => {
  console.log('[@waiting] 等待数据')
})

player.addEventListener('ended', () => {
  console.log('[@ended] 播放结束')
})

player.addEventListener('emptied', () => {
  console.log('[@emptied] 媒体资源被清空')
})

// ============ 加载事件 ============
player.addEventListener('loadstart', () => {
  console.log('[@loadstart] 开始加载')
})

player.addEventListener('loadeddata', () => {
  console.log('[@loadeddata] 数据加载完成')
})

player.addEventListener('loadedmetadata', () => {
  console.log('[@loadedmetadata] 元数据加载完成', {
    duration: player.duration.toFixed(2) + 's',
  })
})

player.addEventListener('completed', () => {
  console.log('[@completed] 加载器完成')
})

player.addEventListener('aborted', () => {
  console.log('[@aborted] 加载被中止')
})

// ============ 播放进度事件 ============
player.addEventListener('timeupdate', () => {
  console.log(`[@timeupdate] 播放进度: ${player.currentTime.toFixed(2)}s / ${player.duration.toFixed(2)}s`)
})

player.addEventListener('durationchange', () => {
  console.log('[@durationchange] 时长变化:', player.duration.toFixed(2) + 's')
})

// ============ 跳转事件 ============
player.addEventListener('seeking', () => {
  console.log('[@seeking] 开始跳转到:', player.currentTime.toFixed(2) + 's')
})

player.addEventListener('seeked', () => {
  console.log('[@seeked] 跳转完成到:', player.currentTime.toFixed(2) + 's')
})

// ============ 音量事件 ============
player.addEventListener('volumechange', () => {
  console.log('[@volumechange] 音量变化:', {
    volume: player.volume,
    muted: player.muted,
  })
})

// ============ 错误事件 ============
player.addEventListener('error', (event: any) => {
  console.error('[@error] 播放错误:', event.detail?.message)
})

// ============ 测试流程 ============
await Promise.resolve()
  .then(async () => {
    console.log('\n========== 步骤 1: 加载音频 ==========')
    await player.load('./audio-example/ARForest - Art for Rest.mp3')
    console.log('✓ 音频加载完成\n')
  })
  .then(() => wait(1000))
  .then(() => {
    console.log('========== 步骤 2: 开始播放 ==========')
    player.play()
  })
  .then(() => wait(3000))
  .then(() => {
    console.log('\n========== 步骤 3: 跳转到 10 秒 ==========')
    player.seek(10)
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 步骤 4: 调整音量 ==========')
    console.log('当前音量:', player.volume)
    player.setVolume(0.5)
    console.log('设置音量为 0.5')
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 步骤 5: 静音 ==========')
    player.setMuted(true)
    console.log('已静音')
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 步骤 6: 取消静音 ==========')
    player.setMuted(false)
    console.log('取消静音')
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 步骤 7: 暂停播放 ==========')
    player.pause()
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 步骤 8: 继续播放 ==========')
    player.play()
  })
  .then(() => wait(3000))
  .then(() => {
    console.log('\n========== 步骤 9: 获取播放器状态 ==========')
    console.log('播放器状态:', {
      src: player.src,
      currentTime: player.currentTime.toFixed(2) + 's',
      duration: player.duration.toFixed(2) + 's',
      paused: player.paused,
      ended: player.ended,
      volume: player.volume,
      muted: player.muted,
    })
  })
  .then(() => wait(2000))
  .then(() => {
    console.log('\n========== 测试完成 ==========')
    player.pause()
    console.log('✓ 所有测试步骤执行完毕')
  })
  .then(() => wait(500))
  .then(() => {
    console.log('\n========== 清理资源 ==========')
    player.dispose()
    console.log('✓ 播放器资源已释放\n')
  })
  .catch((error) => {
    console.error('测试出错:', error)
  })
  .finally(() => {
    // 确保程序能够退出
    process.exit(0)
  })
