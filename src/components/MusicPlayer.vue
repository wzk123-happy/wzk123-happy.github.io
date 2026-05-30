<template>
  <div class="music-player">
    <h3 class="music-title">🎵 音乐盒子</h3>

    <!-- 搜索框 -->
    <div class="music-search">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索歌曲…"
        class="music-input"
        @keyup.enter="searchMusic"
      />
      <button class="music-btn" @click="searchMusic" :disabled="searching">
        {{ searching ? '搜索中…' : '搜索' }}
      </button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="songList.length > 0" class="song-list">
      <div
        v-for="(song, i) in songList"
        :key="i"
        class="song-item"
        :class="{ active: currentIndex === i }"
        @click="playSong(song, i)"
      >
        <span class="song-name">{{ song.name }}</span>
        <span class="song-artist">— {{ song.artist }}</span>
        <span class="song-play-icon">{{ currentIndex === i && playing ? '🔊' : '▶️' }}</span>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="searched && songList.length === 0 && !searching" class="music-empty">
      未找到歌曲，换个关键词试试 🎶
    </div>

    <!-- 正在播放 -->
    <div v-if="currentSong" class="now-playing">
      <div class="now-info">
        <span class="now-title">{{ currentSong.name }}</span>
        <span class="now-artist">{{ currentSong.artist }}</span>
      </div>
      <div class="now-controls">
        <button class="ctrl-btn" @click="togglePlay">
          {{ playing ? '⏸️' : '▶️' }}
        </button>
        <button class="ctrl-btn" @click="stopMusic">⏹️</button>
      </div>
    </div>

    <!-- 音乐"小楼梯"可视化 -->
    <div v-if="currentSong" class="visualizer">
      <div
        v-for="n in 32"
        :key="n"
        class="bar"
        :class="{ active: playing }"
        :style="{
          height: playing ? barHeights[n - 1] + 'px' : '4px',
          animationDelay: (n * 0.06) + 's'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const keyword = ref('')
const searching = ref(false)
const searched = ref(false)
const songList = ref([])
const currentSong = ref(null)
const currentIndex = ref(-1)
const playing = ref(false)
const barHeights = ref(new Array(32).fill(4))

let audio = null
let visualTimer = null

// 多个 Meting API 镜像，一个挂了就换下一个
const API_MIRRORS = [
  'https://api.mzzsm.com/meting/',
  'https://meting.qjqq.cn/',
  'https://api.injahow.cn/meting/',
]

// 搜索音乐
async function searchMusic() {
  const kw = keyword.value.trim()
  if (!kw) return

  searching.value = true
  searched.value = true
  songList.value = []

  for (const mirror of API_MIRRORS) {
    try {
      const res = await fetch(
        `${mirror}?server=netease&type=search&id=${encodeURIComponent(kw)}`,
        { signal: AbortSignal.timeout(5000) }
      )
      const data = await res.json()

      if (data && Array.isArray(data) && data.length > 0) {
        songList.value = data.slice(0, 20).map(s => ({
          name: s.name || s.title || '未知歌曲',
          artist: s.artist || s.author || '未知歌手',
          url: s.url || '',
          id: s.id || '',
        }))
        break
      }
    } catch (err) {
      console.warn(`API ${mirror} 失败:`, err.message)
    }
  }

  searching.value = false
}

// 播放歌曲
async function playSong(song, index) {
  stopVisualizer()
  stopAudio()

  currentSong.value = song
  currentIndex.value = index

  // 获取歌曲真实播放地址
  let playUrl = song.url
  if (!playUrl) {
    for (const mirror of API_MIRRORS) {
      try {
        const res = await fetch(
          `${mirror}?server=netease&type=url&id=${song.id}`,
          { signal: AbortSignal.timeout(5000) }
        )
        const data = await res.json()
        if (data && data.url) {
          playUrl = data.url
          break
        }
      } catch (e) {
        console.warn(`获取播放地址失败 (${mirror}):`, e.message)
      }
    }
  }

  if (!playUrl) {
    console.error('无法获取播放地址')
    return
  }

  audio = new Audio(playUrl)
  audio.crossOrigin = 'anonymous'
  audio.volume = 0.6
  audio.play().then(() => {
    playing.value = true
    startVisualizer()
  }).catch(err => {
    console.error('播放失败:', err)
    playing.value = false
  })

  audio.onended = () => {
    playing.value = false
    stopVisualizer()
  }
}

function togglePlay() {
  if (!audio) return
  if (playing.value) {
    audio.pause()
    playing.value = false
    stopVisualizer()
  } else {
    audio.play().then(() => {
      playing.value = true
      startVisualizer()
    }).catch(() => {
      playing.value = false
    })
  }
}

function stopMusic() {
  stopVisualizer()
  stopAudio()
  currentSong.value = null
  currentIndex.value = -1
  playing.value = false
}

function stopAudio() {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
}

// 可视化动画（模拟音频频谱）
function startVisualizer() {
  stopVisualizer()
  // 生成一组随机基准高度，模拟不同频段
  const baseHeights = new Array(32).fill(0).map(() => Math.random() * 40 + 4)

  function animate() {
    if (!playing.value) return
    for (let i = 0; i < 32; i++) {
      // 以基准高度为中心 ±15px 随机波动，模拟音乐节奏
      const variance = Math.random() * 30 - 15
      barHeights.value[i] = Math.max(4, Math.min(60, baseHeights[i] + variance))
    }
    visualTimer = requestAnimationFrame(animate)
  }
  animate()
}

function stopVisualizer() {
  if (visualTimer) {
    cancelAnimationFrame(visualTimer)
    visualTimer = null
  }
  barHeights.value = new Array(32).fill(4)
}

onBeforeUnmount(() => {
  stopMusic()
})
</script>

<style scoped>
.music-player {
  width: 100%;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(10px);
}

.music-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}

/* 搜索 */
.music-search {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.music-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #ddd;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
}

.music-input:focus {
  border-color: rgba(100, 180, 246, 0.5);
}

.music-input::placeholder {
  color: #777;
}

.music-btn {
  padding: 0.55rem 1.2rem;
  background: #64b5f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.2s;
}

.music-btn:hover:not(:disabled) {
  background: #90caf9;
}

.music-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 歌曲列表 */
.song-list {
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.song-list::-webkit-scrollbar {
  width: 4px;
}

.song-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 0.4rem;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.song-item.active {
  background: rgba(100, 180, 246, 0.15);
}

.song-name {
  color: #eee;
  font-size: 0.9rem;
  font-weight: 500;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  color: #999;
  font-size: 0.8rem;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-play-icon {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.music-empty {
  text-align: center;
  color: #777;
  padding: 1.5rem;
  font-size: 0.9rem;
}

/* 正在播放 */
.now-playing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.now-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.now-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.now-artist {
  color: #999;
  font-size: 0.8rem;
}

.now-controls {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.ctrl-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* 可视化小楼梯 */
.visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 64px;
  padding: 0 0.25rem;
}

.bar {
  flex: 1;
  min-width: 2px;
  background: linear-gradient(180deg, #64b5f6, #ce93d8);
  border-radius: 2px 2px 0 0;
  height: 4px;
  transition: height 0.15s ease;
}

.bar.active {
  animation: pulse 0.3s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

@media (max-width: 480px) {
  .visualizer {
    gap: 2px;
    height: 48px;
  }
}
</style>
