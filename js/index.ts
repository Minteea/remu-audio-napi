import { BindingPlayer, JsPlayerEventData } from '../binding.cjs'

export class Player extends EventTarget {
  #binding: BindingPlayer
  #src: string = ''

  #volume: number = 0.7
  #muted: boolean = false

  #timeoutHandle: NodeJS.Timeout | number = 0
  #monitorDisabled = true

  constructor() {
    super()
    this.#binding = new BindingPlayer()
    this.#setupEventListener()

    this.#binding.setVolume(this.#volume)
  }

  #setupEventListener() {
    this.#binding.setCallback((err, data: JsPlayerEventData) => {
      if (err) {
        console.error('Player callback error:', err)
        return
      }

      const eventType = data.eventType

      // 触发事件
      this.dispatchEvent(new CustomEvent(eventType, { detail: { message: data.message } }))

      switch (eventType) {
        case 'play':
        case 'playing':
          this.#startMonitor()
          break
        case 'pause':
        case 'ended':
          this.#stopMonitor()
          break
        case 'seeking':
          this.dispatchEvent(new CustomEvent('timeupdate', { detail: { message: null } }))
          break
      }
    })
  }

  #startMonitor() {
    if (this.#monitorDisabled) {
      this.#monitorDisabled = false
      this.#monitorLoop()
    }
  }

  #monitorLoop() {
    clearTimeout(this.#timeoutHandle)
    this.#timeoutHandle = setTimeout(() => {
      if (!this.#monitorDisabled) {
        this.dispatchEvent(new CustomEvent('timeupdate', { detail: { message: null } }))
        this.#monitorLoop()
      }
    }, 200)
  }

  #stopMonitor() {
    if (!this.#monitorDisabled) {
      this.dispatchEvent(new CustomEvent('timeupdate', { detail: { message: null } }))
    }
    this.#monitorDisabled = true
    this.#timeoutHandle = 0
  }

  // ============ 核心播放控制方法 ============

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.#binding.play()
        console.log('成功播放')
        resolve()
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  pause(): void {
    this.#binding.pause()
  }

  async load(src: string): Promise<void> {
    this.#src = src
    if (src) {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        await this.#binding.loadUrl(src)
      } else {
        await this.#binding.loadFile(src)
      }
    }
  }

  // ============ 属性: src ============

  get src(): string {
    return this.#src
  }

  // ============ 属性: currentTime ============

  get currentTime(): number {
    return this.#binding.position
  }

  seek(value: number) {
    if (value < 0) value = 0
    const duration = this.duration
    if (duration && value > duration) value = duration

    try {
      this.#binding.seek(value)
    } catch (error) {
      console.error('Seek error:', error)
    }
  }

  // ============ 属性: duration ============

  get duration(): number {
    return this.#binding.duration ?? NaN
  }

  // ============ 属性: paused ============

  get paused(): boolean {
    return this.#binding.paused
  }

  // ============ 属性: ended ============

  get ended(): boolean {
    return this.#binding.ended
  }

  // ============ 属性: volume ============

  get volume(): number {
    return this.#muted ? this.#volume : this.#binding.volume
  }

  setVolume(value: number) {
    if (value < 0) value = 0
    if (value > 1) value = 1

    this.#binding.setVolume(value)

    if (value > 0 && this.#muted) {
      this.#muted = false
    }
  }

  // ============ 属性: muted ============

  get muted(): boolean {
    return this.#muted
  }

  setMuted(value: boolean) {
    this.#muted = value
    if (value == true) {
      this.#binding.setVolume(0)
    } else {
      this.#binding.setVolume(this.#volume)
    }
    this.dispatchEvent(new Event('volumechange'))
  }

  stop() {
    this.#binding.stop()
    this.#stopMonitor()
  }

  // ============ 清理资源 ============

  /**
   * 释放播放器资源，停止播放并清理所有定时器和监听器
   * 调用此方法后，播放器将无法再使用
   */
  dispose() {
    // 停止播放
    this.pause()
    this.#stopMonitor()

    // 清理定时器
    if (this.#timeoutHandle) {
      clearTimeout(this.#timeoutHandle)
      this.#timeoutHandle = 0
    }

    // 停止并释放底层资源
    this.#binding.stop()

    console.log('Player disposed')
  }

  // ============ 只读属性 ============

  get seeking(): boolean {
    throw new Error('[player.seeking] 暂不支持')
  }

  get readyState(): number {
    throw new Error('[player.readyState] 暂不支持')
  }

  get networkState(): number {
    throw new Error('[player.networkState] 暂不支持')
  }

  get error(): Error {
    throw new Error('[player.error] 暂不支持')
  }
}
