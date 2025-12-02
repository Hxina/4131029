<script setup>
import axios from 'axios'
import { spawnStardust } from '../utils/stardust'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const router = useRouter()
const likedStories = ref(new Set())

const props = defineProps({
  story: Object,
  position: Object
})

const displayQuote = computed(() => {
  if (props.story?.quote) {
    return props.story.quote
  }
  if (props.story?.story) {
    const snippet = props.story.story.substring(0, 45)
    return props.story.story.length > 45 ? snippet + '...' : snippet
  }
})

const cardPosition = computed(() => {
  const cardWidth = 300
  const cardHeight = 150
  const margin = 20
  
  let x = props.position.x
  let y = props.position.y
  
  if (x + cardWidth / 2 > window.innerWidth - margin) {
    x = window.innerWidth - margin - cardWidth / 2
  }
  
  if (x - cardWidth / 2 < margin) {
    x = cardWidth / 2 + margin
  }
  
  if (y - cardHeight - margin < margin) {
    y = y + cardHeight + margin
  }
  
  if (y > window.innerHeight - margin) {
    y = window.innerHeight - margin
  }
  
  return { x, y }
})

const loadLikes = () => {
  const stored = localStorage.getItem('likedStories')
  if (stored) {
    likedStories.value = new Set(JSON.parse(stored))
  }
}

const isLiked = () => likedStories.value.has(props.story.love_code)

onMounted(() => {
  loadLikes()
})

const handleLike = async (e) => {
  e.stopPropagation()
  spawnStardust(e.clientX, e.clientY)
  
  const action = isLiked() ? 'unlike' : 'like'
  
  try {
    const res = await axios.post('http://localhost:8000/api/stories/like', {
      love_code: props.story.love_code,
      action: action
    })
    props.story.like_count = res.data.like_count
    
    if (action === 'like') {
      likedStories.value.add(props.story.love_code)
    } else {
      likedStories.value.delete(props.story.love_code)
    }
    localStorage.setItem('likedStories', JSON.stringify([...likedStories.value]))
    likedStories.value = new Set(likedStories.value)
  } catch (e) {
    console.error(e)
  }
}

const handleQuoteClick = () => {
  router.push({ name: 'story', params: { loveCode: props.story.love_code.toLowerCase() } })
}

const formattedDate = () => {
  if (!props.story.created_at) return ''
  const dateStr = props.story.created_at
  return dateStr.split(' ')[0].split('T')[0]
}
</script>

<template>
  <div class="preview-card" :style="{ top: cardPosition.y + 'px', left: cardPosition.x + 'px' }">
    <div class="quote" @click="handleQuoteClick">{{ displayQuote }}</div>
    <div class="meta">
      <span class="date">{{ formattedDate() }}</span>
      <span 
        class="likes" 
        @click="handleLike" 
        :class="{ liked: isLiked() }"
        style="cursor: pointer; pointer-events: auto;"
      >
        {{ isLiked() ? '❤️' : '🤍' }}
        <span v-if="story.like_count > 0" class="like-count">
          {{ story.like_count }}
        </span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.preview-card {
  position: fixed;
  transform: translate(-50%, -110%);
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  pointer-events: auto;
  z-index: 150;
  min-width: 240px;
  max-width: 300px;
  text-align: left;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: fadeIn 0.2s ease;
}

.quote {
  position: relative;
  padding: 1rem; 
  font-style: italic;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #f8f8f8;
  line-height: 1.6;
  cursor: pointer;
  transition: color 0.2s;
}

.quote:hover {
  color: #ff9a9e;
}

.quote::before, .quote::after {
  position: absolute;
  font-style: normal;
  font-size: 2rem;
  line-height: 1;
  color: #f1d3d3;
  opacity: 0.3;
}

.quote::before {
  content: '◜';
  top: -5px;
  left: 0;
}

.quote::after {
  content: '◞';
  bottom: -5px;
  right: 0;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #aaa;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 8px;
}

.likes {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
  color: #aaa;
}

.likes.liked {
  color: #ff9a9e;
}

.likes:hover {
  color: #ff9a9e;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -100%); }
  to { opacity: 1; transform: translate(-50%, -110%); }
}
</style>