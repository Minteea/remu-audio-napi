# 播放器测试文档

## 测试说明

`index.spec.ts` 是一个完整的播放器功能测试套件，测试了播放器的所有核心功能和事件监听。

## 测试的功能

### 1. 播放控制

- ✅ 加载音频文件
- ✅ 播放/暂停
- ✅ 进度跳转
- ✅ 音量调节
- ✅ 静音/取消静音
- ✅ 资源清理

### 2. 事件监听

#### 播放控制事件

- `play` - 播放开始
- `pause` - 播放暂停
- `playing` - 正在播放
- `waiting` - 等待数据
- `ended` - 播放结束
- `emptied` - 媒体资源被清空

#### 加载事件

- `loadstart` - 开始加载
- `loadeddata` - 数据加载完成
- `loadedmetadata` - 元数据加载完成
- `completed` - 加载器完成
- `aborted` - 加载被中止

#### 播放进度事件

- `timeupdate` - 播放进度更新（每 200ms）
- `durationchange` - 时长变化

#### 跳转事件

- `seeking` - 开始跳转
- `seeked` - 跳转完成

#### 音量事件

- `volumechange` - 音量变化

#### 错误事件

- `error` - 播放错误

## 测试流程

1. **加载音频** - 测试异步加载功能
2. **开始播放** - 测试播放功能和进度监控
3. **跳转到 10 秒** - 测试 seek 功能
4. **调整音量** - 测试音量调节
5. **静音** - 测试静音功能
6. **取消静音** - 测试取消静音
7. **暂停播放** - 测试暂停功能
8. **继续播放** - 测试恢复播放
9. **获取播放器状态** - 测试所有属性读取
10. **清理资源** - 测试 dispose 方法

## 重要特性

### 异步加载

```typescript
// 必须使用 await 等待加载完成
await player.load('./audio.mp3')
```

### 资源清理

```typescript
// 测试结束后必须调用 dispose 释放资源
player.dispose()
```

这确保了：

- 停止所有音频播放
- 清理所有定时器
- 释放底层音频资源
- 程序能够正常退出

## 运行测试

```bash
# 构建项目
yarn build

# 运行测试
tsx __test__/index.spec.ts
```

## 常见问题

### Q: 为什么 position 一直为 0？

A: 需要等待 `load()` 方法完成后再调用 `play()`。使用 `await player.load(src)` 确保文件加载完成。

### Q: 为什么测试不退出？

A: 需要在测试结束时调用 `player.dispose()` 来释放所有资源和定时器。

### Q: 如何监听播放进度？

A: 监听 `timeupdate` 事件，它会每 200ms 触发一次。

```typescript
player.addEventListener('timeupdate', () => {
  console.log(player.currentTime, player.duration)
})
```
