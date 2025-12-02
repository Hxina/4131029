<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({ total_stories: 0, total_word_count: 0 })

const fetchStats = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/stories/stats')
    stats.value = res.data
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="about">
    <h1>关于 4131029</h1>
    <p>这是一个献给爱情的数字情诗。</p>
    <p>在这里，每一份爱都化作一颗星，永远闪耀在夜空。</p>

    <div class="site-stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_stories }}</span>
        <span class="stat-label">篇故事</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_word_count }}</span>
        <span class="stat-label">个字</span>
      </div>
    </div>

    <div class="actions">
      <router-link to="/" class="action-btn">返回星空</router-link>
      <a href="https://github.com/Hxina/4131029" target="_blank" rel="noopener noreferrer" class="action-btn">查看源码</a>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000;
  color: #fff;
  text-align: center;
  padding: 2rem;
}

h1 { 
  color: #d5afc2; 
  margin-bottom: 2rem; 
}

p { 
  margin-bottom: 1rem; 
  color: #ccc; 
  max-width: 500px;
}

.site-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem 3rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 0.2rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
}

.actions {
  display: flex;
  gap: 2.5rem;
  margin-top: 3rem;
}

.action-btn {
  color: #888;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #d5afc2;
  text-decoration: underline;
}
</style>