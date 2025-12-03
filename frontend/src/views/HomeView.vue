<script setup>
import { ref, onMounted, watch } from 'vue'
import Starfield from '../components/Starfield.vue'
import StoryFormModal from '../components/StoryFormModal.vue'
import StoryPreviewCard from '../components/StoryPreviewCard.vue'
import gsap from 'gsap'
import axios from 'axios'
import { spawnStardust } from '../utils/stardust'

const showIntro = ref(true)
const showForm = ref(false)
const newStory = ref(null)
const stories = ref([])
const hoveredStarPos = ref({ x: 0, y: 0 })
const hoveredStory = ref(null)
const starfieldRef = ref(null)
const isHoveringStar = ref(false)
const isHoveringCard = ref(false)
const hideTimer = ref(null)

watch([isHoveringStar, isHoveringCard], ([starHover, cardHover]) => {
  clearTimeout(hideTimer.value)
  if (!starHover && !cardHover) {
    hideTimer.value = setTimeout(() => {
      hoveredStory.value = null
    }, 300)
  }
})

const handleHover = (story, mousePos) => {
  if (story) {
    isHoveringStar.value = true
    hoveredStory.value = story
    if (mousePos) {
      hoveredStarPos.value = mousePos
    }
  } else {
    isHoveringStar.value = false
  }
}

const handleCardEnter = () => {
  isHoveringCard.value = true
}

const handleCardLeave = () => {
  isHoveringCard.value = false
}

const fetchStories = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stories/sample`)
    stories.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const handleFormSuccess = (story) => {
  showForm.value = false
  newStory.value = story
  story.isNew = true
  stories.value = [...stories.value, story]
}

onMounted(async () => {
  await fetchStories()
  const introShown = sessionStorage.getItem('introShown')
  if (introShown) {
    showIntro.value = false
    return
  }
  const tl = gsap.timeline({
    onComplete: () => {
      showIntro.value = false
      sessionStorage.setItem('introShown', 'true')
    }
  })
  
  tl.fromTo('.love-number', 
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 2, ease: 'back.out(1.7)' }
  )
  .fromTo('.intro-subtitle', 
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
    "-=1.5"
  )
  .to('.love-number', {
    scale: 1.05,
    duration: 0.6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 5,
  }, "<") 
  .fromTo('.intro-subtext', 
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
    "<+=0.3"
  )
  .to('.intro-text', { 
    opacity: 0, 
    scale: 2.5,
    duration: 1.5, 
    ease: 'power2.in' 
  });
})
</script>

<template>
  <div class="home">
    <Starfield ref="starfieldRef" :stories="stories" @hover-story="handleHover" />
    
    <div v-if="showIntro" class="intro-overlay">
      <div class="intro-text">
        <h1 class="love-number">4131029</h1>
        <p class="intro-subtitle">当你倒着念出这串数字</p>
        <p class="intro-subtext">便是我对你一生一世的告白</p>
      </div>
    </div>
    <div v-else class="main-ui">
      <button class="share-btn" @click="(e) => { 
        showForm = true; 
        spawnStardust(e.clientX, e.clientY) 
      }">分享我们的故事</button>
    </div>
    <Transition name="modal-fade">
      <StoryFormModal v-if="showForm" @close="showForm = false" @submit-success="handleFormSuccess" />
    </Transition>
    <StoryPreviewCard 
      v-if="hoveredStory" 
      :story="hoveredStory" 
      :position="hoveredStarPos" 
      @mouseenter="handleCardEnter"
      @mouseleave="handleCardLeave"
    />
  </div>
</template>

<style scoped>
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.8);
  z-index: 100;
  pointer-events: none;
}

.intro-text {
  text-align: center;
}

.love-number {
  font-size: 5rem;
  margin: 0;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(45deg, #ff9a9e, #fad0c4, #ff9a9e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0;
  text-shadow: 0 0 20px rgba(255, 154, 158, 0.2);
}

.intro-subtitle {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  margin: 1.5rem 0 0;
  letter-spacing: 0.1rem;
  opacity: 0;
  background: linear-gradient(
    90deg,
    #fff 0%,
    #fff 30%,
    #ffe5f0 40%,
    #ffd4e5 50%,
    #ffe5f0 60%,
    #fff 70%,
    #fff 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px rgba(255, 154, 158, 0.6));
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: 2s;
}

.intro-subtext {
  font-family: 'Dancing Script', cursive;
  font-size: 3rem;
  margin: 0.75rem 0 0;
  letter-spacing: 0.1rem;
  opacity: 0;
  background: linear-gradient(
    90deg,
    #fff 0%,
    #fff 30%,
    #ffe5f0 40%,
    #ffd4e5 50%,
    #ffe5f0 60%,
    #fff 70%,
    #fff 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px rgba(255, 154, 158, 0.6));
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: 2.3s;
}

.main-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  animation: fadeIn 2s ease;
}

.share-btn {
  position: absolute;
  bottom: 40px;
  right: 40px;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #c89999;
  border-radius: 30px;
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(1px);
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.01);
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
  transform: scale(1.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>