<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="checkin-card animate-fadeIn">
        <div class="time-display">
          <span class="time-value">{{ currentTime }}</span>
          <span class="date-value">{{ currentDate }}</span>
        </div>
        
        <div class="status-section" v-if="attendance">
          <div class="status-header">
            <h3 class="status-title">今日打卡记录</h3>
            <span class="status-tag" :class="attendance.status">
              {{ statusMap[attendance.status] || '未知' }}
            </span>
          </div>
          
          <div class="record-list">
            <div class="record-item">
              <span class="record-label">上班时间</span>
              <span class="record-value">{{ formatTime(attendance.check_in_time) }}</span>
            </div>
            <div class="record-item" v-if="attendance.check_out_time">
              <span class="record-label">下班时间</span>
              <span class="record-value">{{ formatTime(attendance.check_out_time) }}</span>
            </div>
            <div class="record-item" v-if="workHours">
              <span class="record-label">工作时长</span>
              <span class="record-value highlight">{{ workHours }}</span>
            </div>
          </div>
        </div>
        
        <div class="action-section">
          <button 
            v-if="!attendance?.check_in_time" 
            class="checkin-btn primary"
            @click="handleCheckIn"
          >
            <span class="btn-icon">✏️</span>
            <span class="btn-text">打卡上班</span>
          </button>
          
          <button 
            v-else-if="!attendance?.check_out_time" 
            class="checkin-btn success"
            @click="handleCheckOut"
          >
            <span class="btn-icon">✅</span>
            <span class="btn-text">打卡下班</span>
          </button>
          
          <div v-else class="completed-section">
            <div class="completed-icon">🎉</div>
            <span class="completed-text">今日打卡已完成</span>
          </div>
        </div>
        
        <div class="tips-section">
          <p class="tip-text">⏰ 上班时间: 09:00 - 09:30 弹性打卡</p>
          <p class="tip-text">🏁 下班时间: 17:30 - 18:00 弹性打卡</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { getUser } from '../store'
import { attendanceAPI } from '../api'

const user = getUser()
const attendance = ref({})
const currentTime = ref('')
const currentDate = ref('')

let timer = null

const statusMap = {
  normal: '正常',
  late: '迟到',
  early_leave: '早退',
  absent: '旷工',
  leave: '请假'
}

const workHours = computed(() => {
  if (!attendance.value.check_in_time || !attendance.value.check_out_time) return null
  
  const checkIn = new Date(attendance.value.check_in_time)
  const checkOut = new Date(attendance.value.check_out_time)
  const diff = checkOut - checkIn
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}小时${minutes}分钟`
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const handleCheckIn = async () => {
  try {
    await attendanceAPI.checkIn({ employee_id: user.id })
    alert('上班打卡成功')
    await loadAttendance()
  } catch (error) {
    alert(error.response?.data?.error || '打卡失败')
  }
}

const handleCheckOut = async () => {
  try {
    await attendanceAPI.checkOut({ employee_id: user.id })
    alert('下班打卡成功')
    await loadAttendance()
  } catch (error) {
    alert(error.response?.data?.error || '打卡失败')
  }
}

const loadAttendance = async () => {
  try {
    const response = await attendanceAPI.getDaily({ employee_id: user.id })
    attendance.value = response.data || {}
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadAttendance()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.checkin-card {
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xl);
}

.time-display {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.time-value {
  display: block;
  font-size: 56px;
  font-weight: 700;
  color: var(--dark);
  font-family: 'SF Mono', Monaco, monospace;
  letter-spacing: 2px;
}

.date-value {
  display: block;
  font-size: var(--font-sm);
  color: var(--gray);
  margin-top: var(--spacing-sm);
}

.status-section {
  background: var(--bg-gray);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.status-title {
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--dark);
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-xs);
  font-weight: 500;
  
  &.normal {
    background: rgba(16, 185, 129, 0.1);
    color: var(--status-normal);
  }
  
  &.late {
    background: rgba(245, 158, 11, 0.1);
    color: var(--status-late);
  }
  
  &.early_leave {
    background: rgba(239, 68, 68, 0.1);
    color: var(--status-early);
  }
  
  &.absent {
    background: rgba(220, 38, 38, 0.1);
    color: var(--status-absent);
  }
  
  &.leave {
    background: rgba(99, 102, 241, 0.1);
    color: var(--status-leave);
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.record-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-gray);
  
  &:last-child {
    border-bottom: none;
  }
}

.record-label {
  font-size: var(--font-sm);
  color: var(--gray);
}

.record-value {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--dark);
  
  &.highlight {
    color: var(--primary-color);
  }
}

.action-section {
  margin-bottom: var(--spacing-xl);
}

.checkin-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  font-size: var(--font-lg);
  font-weight: 600;
  transition: all var(--transition-normal);
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    color: white;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-xl);
    }
  }
  
  &.success {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-xl);
    }
  }
}

.btn-icon {
  font-size: 24px;
}

.btn-text {
  font-weight: 600;
}

.completed-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  background: rgba(16, 185, 129, 0.05);
  border-radius: var(--radius-lg);
}

.completed-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.completed-text {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--status-normal);
}

.tips-section {
  background: var(--bg-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.tip-text {
  font-size: var(--font-xs);
  color: var(--gray);
  margin: 4px 0;
}
</style>