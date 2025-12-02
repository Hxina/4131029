<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { spawnStardust } from '../utils/stardust'

const canvasRef = ref(null)
let animationFrame = null
const route = useRoute()
const story = ref(null)
const loading = ref(true)
const error = ref(null)
const likedStories = ref(new Set())
const isCodeCopied = ref(false)

const formatDateToChinese = (dateString) => {
  const datePart = dateString.split(' ')[0].split('T')[0];
  const parts = datePart.split('-');

  if (parts.length === 3) {
    return `${parts[0]} 年 ${parts[1]} 月 ${parts[2]} 日`;
  }

  return dateString;
}

const copyLoveCode = async () => {
  if (!story.value?.love_code || isCodeCopied.value) return;

  try {
    const urlToCopy = `https://4131029.xyz/love/${story.value.love_code.toLowerCase()}`;
    
    await navigator.clipboard.writeText(urlToCopy);

    isCodeCopied.value = true;
    setTimeout(() => {
      isCodeCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('无法复制专属链接: ', err);
  }
}

const loadLikes = () => {
  const stored = localStorage.getItem('likedStories')
  if (stored) {
    likedStories.value = new Set(JSON.parse(stored))
  }
}

const isLiked = () => likedStories.value.has(story.value?.love_code)

const fetchStory = async () => {
  try {
    const res = await axios.get(`http://localhost:8000/api/stories/${route.params.loveCode}`)
    story.value = res.data
    loadLikes()
  } catch (e) {
    error.value = "未找到该故事，或者它已迷失在星空中。"
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (!story.value) return
  
  const action = isLiked() ? 'unlike' : 'like'
  
  try {
    const res = await axios.post('http://localhost:8000/api/stories/like', {
      love_code: story.value.love_code,
      action: action
    })
    story.value.like_count = res.data.like_count
    if (action === 'like') {
      likedStories.value.add(story.value.love_code)
    } else {
      likedStories.value.delete(story.value.love_code)
    }
    localStorage.setItem('likedStories', JSON.stringify([...likedStories.value]))
    likedStories.value = new Set(likedStories.value)
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await fetchStory()
  initCanvas()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

const initCanvas = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  
  const stars = []
  const colors = ['#ff9a9e', '#fad0c4', '#ffd1ff', '#ffffff']
  
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      opacity: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    stars.forEach(star => {
      star.y += star.speed
      if (star.y > canvas.height) {
        star.y = 0
        star.x = Math.random() * canvas.width
      }
      
      ctx.globalAlpha = star.opacity
      ctx.fillStyle = star.color
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })
    
    animationFrame = requestAnimationFrame(animate)
  }
  
  animate()
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
}
</script>

<template>
  <div class="story-page">
    <canvas ref="canvasRef" class="background-canvas"></canvas>
    <div v-if="loading" class="loading">正在寻找我们的故事...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="content">
      <div class="header">
        <p class="pre-quote">亲爱的，我想对你说</p>
        <div class="quote">{{ story.quote || '我们的故事' }}</div>
        <div class="meta">
          <span>{{ story.author }} & {{ story.beloved }}</span>
          <span class="divider">🩷</span>
          <span>{{ formatDateToChinese(story.meet_date) }}相识于·{{ story.meet_place || '相遇之地' }}</span>
        </div>
      </div>
      
      <div class="body">
        <p>{{ story.story }}</p>
      </div>
      <div class="gallery" v-if="story.images && story.images.length">
        <img v-for="img in story.images" :key="img.id" :src="img.url" />
      </div>

      <div class="footer">
        <div class="stats">
          <span>共 {{ story.word_count }} 字，浏览 {{ story.view_count }} 次</span>
          <button 
            @click="(e) => { handleLike(); spawnStardust(e.clientX, e.clientY) }" 
            class="like-btn"
            :class="{ liked: isLiked() }"
          >
            {{ isLiked() ? '❤️' : '🤍' }}
            <span v-if="story.like_count > 0">{{ story.like_count }}</span>
          </button>
        </div>

        <div class="love-code-footer" @click="copyLoveCode">
          <span v-if="!isCodeCopied">{{ story.love_code }}</span>
          <span v-else class="copied-success">专属页面链接已复制</span>
        </div>

        <div class="timestamp">发布于 {{ story.created_at }}</div>
      </div>
    </div>
    
    <footer class="site-footer">
      <span>&copy; {{ new Date().getFullYear() }} 4131029.xyz</span>
      <router-link to="/about">&nbsp;&nbsp;&nbsp;&nbsp;关于本站</router-link>
    </footer>
  </div>
</template>

<style scoped>
.story-page {
  height: 100vh;
  background: #0f0c29;
  color: #fff;
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.content {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  animation: fadeIn 1s ease;
  position: relative;
  z-index: 1;
  padding: 4rem 2rem;
  flex: 1;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.pre-quote {
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.5rem;
  color: #e0e0e0;
  margin: 0 0 1rem 0;
}

.quote {
  font-family: 'Dancing Script', 'Noto Serif SC', serif;
  font-size: 2rem;
  font-weight: 700;
  font-style: normal;
  line-height: 1.4;
  letter-spacing: 0.05em;
  margin: 0 0 20px 0;
  color: #d3a5a5;
  position: relative;
  display: inline-block;
  padding: 0 20px;
}

.meta {
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #a694ae;
  font-size: 0.9rem;
}

.divider { 
  margin: 0 10px;
  animation: heartbeat 1.5s infinite ease-in-out;
  display: inline-block;
}

.body {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  white-space: pre-wrap;
  text-align: left;
  background: rgba(255,255,255,0.01);
  padding: 25px;
  border-radius: 10px;
  backdrop-filter: blur(1px);
  color: #e0e0e0;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
  padding: 10px;
}

.gallery img {
  width: 100%;
  border-radius: 5px;
  transition: none;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 105, 180, 0.1);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #82829c;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #82829c;
}

.love-code-footer {
  font-size: 0.8rem;
  color: #d2afb5;
  letter-spacing: 3px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.love-code-footer:hover {
  background-color: rgba(255, 105, 180, 0.15);
  color: #ad9eb5;
}

.copied-success {
  color: #d0aae0;
}

.like-btn {
  background: none;
  border: none;
  color: #82829c;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.like-btn.liked {
  color: #ff69b4;
}

.like-btn:hover {
  background: rgba(255, 105, 180, 0.2);
  color: #ff69b4;
}

.loading, .error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: #82829c;
  text-align: center;
  width: 100%;
}

.site-footer {
  text-align: center;
  padding: 1.2rem;
  color: #82829c;
  font-size: 0.8rem;
  background: rgba(15, 12, 41, 0.8);
  backdrop-filter: blur(5px);
  z-index: 2;
  margin-top: auto;
}

.site-footer a {
  color: #82829c;
  transition: color 0.3s;
}

.site-footer a:hover {
  color: #d3a5a5;
}

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}
</style>