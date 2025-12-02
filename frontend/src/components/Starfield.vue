<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasRef = ref(null)
let ctx = null
let animationFrame = null
let storyStars = []
let bgStars = []
let width = 0
let height = 0
let mouseX = 0
let mouseY = 0
const longPressTimer = ref(null)
const isMouseDown = ref(false)
const mouseDownPos = ref({ x: 0, y: 0 })
const LONG_PRESS_DURATION = 300
const DRAG_THRESHOLD = 10

const props = defineProps({
  stories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['hover-story'])

watch(() => props.stories, () => {
  initStars()
}, { deep: false })

class Star {
  constructor(storyData, x, y, isNew = false) {
    this.x = x
    this.y = y
    this.size = isNew ? 0 : Math.random() * 5 + 10
    this.targetSize = isNew ? Math.random() * 10 + 25 : Math.random() * 5 + 10
    this.storyData = storyData
    this.color = isNew 
      ? ['#ff1493', '#ff4500', '#ffd700', '#ff69b4'][Math.floor(Math.random() * 4)]
      : [
          '#ffd700', '#ff69b4', '#ffb7b2', '#ff1493', '#e6e6fa', '#da70d6', 
          '#9370db', '#ff4500', '#ff6347', '#ffdab9', '#ffffff', '#f0f8ff', 
          '#e0ffff', '#87ceeb', '#98fb98', '#ffb6c1', '#dda0dd', '#f08080',
          '#ffa07a', '#20b2aa', '#87cefa', '#778899', '#b0c4de', '#ffffe0'
        ][Math.floor(Math.random() * 24)]
    this.phase = Math.random() * Math.PI * 2
    this.speed = Math.random() * 0.02 + 0.01
    this.glow = isNew ? 80 : Math.random() * 15 + 10
    this.isNew = isNew
    this.birthProgress = 0
  }
}

const initStars = () => {
  if (bgStars.length === 0) {
    const colors = ['#ffffff', '#a2d9ff', '#ff9a9e', '#ffd700']
    for (let i = 0; i < 300; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        opacity: 0,
        targetOpacity: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        state: 'in',
        timer: 0,
        life: Math.random() * 200 + 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
  }
  
  const minDistance = 75
  const maxAttempts = 20

  const existingCodes = new Set(storyStars.map(s => s.storyData.love_code))
  const newStories = props.stories.filter(s => !existingCodes.has(s.love_code))

  newStories.forEach(story => {
    let bestX, bestY;
    let placementFound = false;

    if (story.isNew) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidateX = width / 2 + (Math.random() - 0.5) * width * 0.1;
        const candidateY = height / 2 + (Math.random() - 0.5) * height * 0.1;
        let hasCollision = false;

        for (const existingStar of storyStars) {
          if (Math.hypot(candidateX - existingStar.x, candidateY - existingStar.y) < minDistance) {
            hasCollision = true;
            break;
          }
        }

        if (!hasCollision) {
          bestX = candidateX;
          bestY = candidateY;
          placementFound = true;
          break;
        }
      }
    }

    if (!placementFound) {
      for (let i = 0; i < maxAttempts; i++) {
        let isValid = true;
        const candidateX = width * 0.15 + Math.random() * width * 0.7;
        const candidateY = height * 0.15 + Math.random() * height * 0.7;

        for (const existingStar of storyStars) {
          if (Math.hypot(candidateX - existingStar.x, candidateY - existingStar.y) < minDistance) {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          bestX = candidateX;
          bestY = candidateY;
          break;
        }
        
        if (i === maxAttempts - 1) {
          bestX = candidateX;
          bestY = candidateY;
        }
      }
    }
    
    storyStars.push(new Star(story, bestX, bestY, story.isNew))
  })
}

const animate = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#05040a')
  gradient.addColorStop(0.33, '#1a152e')
  gradient.addColorStop(0.66, '#10101c')
  gradient.addColorStop(1, '#000000')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  bgStars.forEach(s => {
    s.x += s.vx
    s.y += s.vy
    
    if (s.state === 'in') {
      s.opacity += 0.01
      if (s.opacity >= s.targetOpacity) {
        s.opacity = s.targetOpacity
        s.state = 'wait'
        s.timer = s.life
      }
    } else if (s.state === 'wait') {
      s.timer--
      if (s.timer <= 0) s.state = 'out'
    } else if (s.state === 'out') {
      s.opacity -= 0.01
      if (s.opacity <= 0) {
        s.opacity = 0
        s.state = 'in'
        s.x = Math.random() * width
        s.y = Math.random() * height
        s.life = Math.random() * 200 + 100
      }
    }
    ctx.fillStyle = s.color
    ctx.globalAlpha = s.opacity
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  })
  
  ctx.globalAlpha = 1
  storyStars.forEach(s => {
    s.phase += s.speed

    if (s.isNew && s.birthProgress < 1) {
      s.birthProgress += 0.02
      s.size = s.targetSize * Math.min(s.birthProgress, 1)
    } else if (!s.isNew && s.size !== s.targetSize) {
       s.size = s.targetSize
    }

    let scale = 1 + Math.sin(s.phase) * 0.3
    if (s.isNew) {
      scale = 1 + Math.sin(s.phase * 3) * 0.5
    }
    
    ctx.globalAlpha = 1
    ctx.shadowBlur = s.glow * scale
    ctx.shadowColor = s.color
    ctx.fillStyle = "#fff"
    
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.scale(scale, scale)
    
    ctx.beginPath()
    ctx.moveTo(0, -s.size)
    ctx.quadraticCurveTo(1, -1, s.size, 0)
    ctx.quadraticCurveTo(1, 1, 0, s.size)
    ctx.quadraticCurveTo(-1, 1, -s.size, 0)
    ctx.quadraticCurveTo(-1, -1, 0, -s.size)
    ctx.fill()
    
    ctx.restore()
    
    ctx.shadowBlur = 0
    s.currentSize = s.size * scale * 2
  })
  animationFrame = requestAnimationFrame(animate)
}

const handleResize = () => {
  width = window.innerWidth
  height = window.innerHeight
  if (canvasRef.value) {
    canvasRef.value.width = width
    canvasRef.value.height = height
  }
  initStars()
}

const handleMouseMove = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY

  if (isMouseDown.value) {
    const dist = Math.hypot(mouseX - mouseDownPos.value.x, mouseY - mouseDownPos.value.y)
    if (dist > DRAG_THRESHOLD) {
      clearTimeout(longPressTimer.value)
    }
  }
  
  let hovered = null
  for (const star of storyStars) {
    const dist = Math.hypot(mouseX - star.x, mouseY - star.y)
    if (dist < star.size + 10) {
      hovered = star.storyData
      break
    }
  }
  emit('hover-story', hovered, { x: mouseX, y: mouseY })
}

const handleClick = (e) => {
  const clickX = e.clientX
  const clickY = e.clientY
  
  for (const star of storyStars) {
    const dist = Math.hypot(clickX - star.x, clickY - star.y)
    if (dist < star.size + 10) {
      router.push({ name: 'story', params: { loveCode: star.storyData.love_code.toLowerCase() } })
      break
    }
  }
}

const handleMouseDown = (e) => {
  isMouseDown.value = true
  mouseDownPos.value = { x: e.clientX, y: e.clientY }

  for (const star of storyStars) {
    const dist = Math.hypot(e.clientX - star.x, e.clientY - star.y)
    if (dist < star.size + 10) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = setTimeout(() => {
        if (isMouseDown.value) {
          emit('hover-story', star.storyData, { x: e.clientX, y: e.clientY })
        }
      }, LONG_PRESS_DURATION)
      break
    }
  }
}

const handleMouseUp = (e) => {
  isMouseDown.value = false
  clearTimeout(longPressTimer.value)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleClick)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('click', handleClick)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  cancelAnimationFrame(animationFrame)
})

defineExpose({
  storyStars
})
</script>

<template>
  <canvas ref="canvasRef" class="starfield"></canvas>
</template>

<style scoped>
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>