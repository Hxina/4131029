<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { spawnStardust } from '../utils/stardust'

const emit = defineEmits(['close', 'submit-success'])

const form = ref({
  author: '',
  beloved: '',
  meet_date: '',
  meet_place: '',
  quote: '',
  story: '',
  images: []
})

const year = ref('')
const month = ref('')
const day = ref('')

const yearInput = ref(null)
const monthInput = ref(null)
const dayInput = ref(null)

const isSubmitting = ref(false)
const hasUserInteracted = ref(false)
const focusedField = ref(null) 

const wordCount = computed(() => form.value.story.length)

const isValid = computed(() => {
  return form.value.author && form.value.meet_date && form.value.story.length >= 50
})

watch([year, month, day], ([y, m, d]) => {
  if (y && y.length === 4 && m && d) {
    const formattedMonth = m.padStart(2, '0')
    const formattedDay = d.padStart(2, '0')
    form.value.meet_date = `${y}-${formattedMonth}-${formattedDay}`
  } else {
    form.value.meet_date = ''
  }
})

const handleYearInput = () => {
  year.value = year.value.replace(/\D/g, '')
  if (year.value.length === 4) {
    monthInput.value?.focus()
  }
}

const handleMonthInput = () => {
  month.value = month.value.replace(/\D/g, '')
  
  if (month.value) {
    let m = parseInt(month.value)
    if (m > 12) {
      month.value = '12'
    } else if (m === 0) {
      month.value = ''
    }
  }

  if (month.value.length === 2) {
    dayInput.value?.focus()
  }
}

const handleDayInput = () => {
  day.value = day.value.replace(/\D/g, '')
  
  if (day.value) {
    let d = parseInt(day.value)
    if (d > 31) {
      day.value = '31'
    } else if (d === 0) {
      day.value = ''
    }
  }
}

const handleDateKeydown = (e, type) => {
  if (e.key === 'ArrowRight') {
    if (type === 'year' && e.target.selectionStart === year.value.length) {
      monthInput.value?.focus()
    } else if (type === 'month' && e.target.selectionStart === month.value.length) {
      dayInput.value?.focus()
    }
  } else if (e.key === 'ArrowLeft') {
    if (type === 'month' && e.target.selectionStart === 0) {
      yearInput.value?.focus()
    } else if (type === 'day' && e.target.selectionStart === 0) {
      monthInput.value?.focus()
    }
  } else if (e.key === 'Backspace') {
    if (type === 'month' && month.value === '') {
      yearInput.value?.focus()
    } else if (type === 'day' && day.value === '') {
      monthInput.value?.focus()
    }
  }
}

const validationMessage = computed(() => {
  if (!form.value.author) {
    return '请填写你的名字'
  }
  if (!form.value.meet_date) {
    return '请填写完整的相遇日期'
  }
  if (form.value.story.length < 50) {
    const remaining = 50 - form.value.story.length;
    return `故事内容还差 ${remaining} 字`
  }
  return ''
})

const buttonText = computed(() => {
  if (isSubmitting.value) {
    return '正在点亮星空...'
  }
  if (isValid.value) {
    return '点亮星空'
  }
  if (focusedField.value) {
    return `正在填写${focusedField.value}...`
  }
  if (hasUserInteracted.value) {
    return validationMessage.value
  }
  return '请填写所有必填项'
})

const handleSubmit = async () => {
  if (!isValid.value) return
  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      images: form.value.images.map((img, idx) => ({ url: img, upload_order: idx }))
    }
    
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/stories`, payload)
    emit('submit-success', res.data)
  } catch (e) {
    console.error(e)
    console.error(e)
    alert('发布失败: ' + (e.response?.data?.detail || e.message))
  } finally {
    isSubmitting.value = false
  }
}

const handleFileUpload = (e) => {
  const files = e.target.files
  if (!files) return
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.images.push(e.target.result)
    }
    reader.readAsDataURL(files[i])
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>我们的故事</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>我的名字（必填）</label>
          <input v-model="form.author" placeholder="如何称呼你？" 
                 @focus="focusedField = '我的名字'" 
                 @blur="focusedField = null"
                 @input="hasUserInteracted = true" />
        </div>
        <div class="form-group">
          <label>心上人的名字</label>
          <input v-model="form.beloved" placeholder="如何称呼你的心上人？" 
                 @focus="focusedField = '心上人的名字'" 
                 @blur="focusedField = null"
                 @input="hasUserInteracted = true" />
        </div>
        <div class="form-group">
          <label>相遇日期（必填）</label>
          <div class="date-input-group" @focusin="focusedField = '相遇日期'" @focusout="focusedField = null">
            <input type="text" inputmode="numeric" v-model="year" ref="yearInput" placeholder="YYYY" maxlength="4" class="input-year" 
                   @input="handleYearInput(); hasUserInteracted = true" 
                   @keydown="(e) => handleDateKeydown(e, 'year')" />
            <span>年</span>
            <input type="text" inputmode="numeric" v-model="month" ref="monthInput" placeholder="MM" maxlength="2" class="input-month" 
                   @input="handleMonthInput(); hasUserInteracted = true" 
                   @keydown="(e) => handleDateKeydown(e, 'month')" />
            <span>月</span>
            <input type="text" inputmode="numeric" v-model="day" ref="dayInput" placeholder="DD" maxlength="2" class="input-day" 
                   @input="handleDayInput(); hasUserInteracted = true" 
                   @keydown="(e) => handleDateKeydown(e, 'day')" />
            <span>日</span>
          </div>
        </div>
        <div class="form-group">
          <label>相遇地点</label>
          <input v-model="form.meet_place" placeholder="哪里是你们初次相遇的地方？"
                 @focus="focusedField = '相遇地点'" 
                 @blur="focusedField = null"
                 @input="hasUserInteracted = true" />
        </div>
      </div>
      <div class="form-group">
        <label>最想说的话<span class="count">{{ form.quote.length }}/45</span></label>
        <input v-model="form.quote" maxlength="45" placeholder="用一句话表达你的爱意吧~"
               @focus="focusedField = '最想说的话'" 
               @blur="focusedField = null"
               @input="hasUserInteracted = true" />
      </div>
      <div class="form-group">
        <label>我们的故事（必填）<span class="count">{{ wordCount }} (至少 50 字)</span></label>
        <textarea v-model="form.story" rows="5" placeholder="心动 · 相爱 · 永恒&#10;&#10;从怦然心动说起，聊聊相爱的日子，许下美好的未来~&#10;&#10;时光会泛黄，但文字能让爱意永存~"
                  @focus="focusedField = '我们的故事'" 
                  @blur="focusedField = null"
                  @input="hasUserInteracted = true"></textarea>
      </div>
      <div class="form-group">
        <label>上传照片</label>
        <div class="upload-area">
          <input type="file" multiple @change="handleFileUpload" accept="image/*" />
          <p>点击或拖拽上传图片</p>
        </div>
        <div class="preview-list">
          <img v-for="(img, idx) in form.images" :key="idx" :src="img" class="preview-img" />
        </div>
      </div>
      <button class="submit-btn" :disabled="!isValid || isSubmitting" @click="(e) => { handleSubmit(); spawnStardust(e.clientX, e.clientY) }">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center;
  z-index: 200;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: rgba(16, 16, 28, 0.7);
  padding: 2rem;
  border-radius: 15px;
  width: 90%; max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
  color: #fff;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(15px);
}

h2 {
  text-align: center;
  color: #e88999;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-family: 'Noto Serif SC', serif;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-grid .form-group {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 5px;
  padding: 0 10px;
  transition: all 0.3s ease;
}

.date-input-group:focus-within {
  border-color: #a2d9ff;
  background: rgba(255,255,255,0.01);
}

.date-input-group input {
  background: transparent;
  border: none;
  padding: 10px 0;
  text-align: center;
}

.input-year {
  width: 60px;
}

.input-month, .input-day {
  width: 40px;
}

.date-input-group input:focus {
  outline: none;
}

.date-input-group span {
  color: #888;
  flex-shrink: 0;
}

.count {
  float: right;
  font-size: 0.8rem;
  color: #888;
}

input, textarea {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 5px;
  color: #fff;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #a2d9ff;
  background: rgba(255,255,255,0.01);
}

textarea {
  resize: vertical;
  min-height: 100px;
  max-height: 300px;
}

p {
  color: #ccc;
}

.upload-area {
  border: 2px dashed rgba(255,255,255,0.2);
  padding: 20px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
}

.upload-area input {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}

.preview-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  overflow-x: auto;
}

.preview-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #e88999cc;
  color: #ccc;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  background: #404040;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background: #d17b8a;
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: all 0.4s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.3) translateY(20px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  textarea {
    min-height: 160px;
  }
}
</style>