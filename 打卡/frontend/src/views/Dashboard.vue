<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="greeting-section animate-fadeIn">
        <h2 class="greeting-title">您好, {{ user?.name }}</h2>
        <p class="greeting-date">{{ currentDate }}</p>
      </div>
      
      <div v-if="showLateWarning" class="late-warning-modal animate-fadeIn">
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <h3 class="modal-title">迟到次数超标提醒</h3>
          <p class="modal-message">
            您本月已迟到 <span class="highlight">{{ lateStatus?.late_count }}</span> 次，
            已超过公司规定的每月 <span class="highlight">{{ lateStatus?.threshold }}</span> 次上限。
            请遵守公司考勤制度，按时打卡上班。
          </p>
          <button class="modal-close-btn" @click="closeWarning">我知道了</button>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card animate-fadeIn" :style="{ animationDelay: '0.1s' }">
          <div class="stat-icon-wrap" :class="attendanceStatus?.status">
            <span class="stat-icon">{{ statusIcon }}</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statusText }}</span>
            <span class="stat-label">今日状态</span>
          </div>
          <div class="stat-detail">
            <span v-if="attendanceStatus?.check_in_time">上班: {{ formatTime(attendanceStatus.check_in_time) }}</span>
            <span v-if="attendanceStatus?.check_out_time">下班: {{ formatTime(attendanceStatus.check_out_time) }}</span>
          </div>
        </div>
        
        <div class="stat-card animate-fadeIn" :style="{ animationDelay: '0.2s' }">
          <div class="stat-icon-wrap normal">
            <span class="stat-icon">✓</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ monthlyStats?.normal_days || 0 }}</span>
            <span class="stat-label">本月正常</span>
          </div>
        </div>
        
        <div class="stat-card animate-fadeIn late-stat" :class="{ exceeded: lateStatus?.exceeded }" :style="{ animationDelay: '0.3s' }">
          <div class="stat-icon-wrap late">
            <span class="stat-icon">!</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ lateStatus?.late_count || 0 }}<span class="threshold-text">/{{ lateStatus?.threshold || 3 }}次</span></span>
            <span class="stat-label">本月迟到</span>
          </div>
          <div v-if="lateStatus?.remaining !== undefined" class="late-warning">
            <span v-if="lateStatus.exceeded" class="warning-text">⚠️ 已超标!</span>
            <span v-else class="remaining-text">剩余 {{ lateStatus.remaining }} 次</span>
          </div>
        </div>
        
        <div class="stat-card animate-fadeIn" :style="{ animationDelay: '0.4s' }">
          <div class="stat-icon-wrap leave">
            <span class="stat-icon">📝</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingLeaves }}</span>
            <span class="stat-label">待审批请假</span>
          </div>
        </div>
      </div>
      
      <div class="action-section animate-slideIn">
        <div class="action-card">
          <div class="action-header">
            <h3 class="action-title">快捷操作</h3>
          </div>
          <div class="action-buttons">
            <button 
              v-if="!attendanceStatus?.check_in_time" 
              class="action-btn primary"
              @click="goToCheckIn"
            >
              <span class="btn-icon">✏️</span>
              <span class="btn-text">打卡上班</span>
            </button>
            <button 
              v-else-if="!attendanceStatus?.check_out_time" 
              class="action-btn success"
              @click="goToCheckOut"
            >
              <span class="btn-icon">✅</span>
              <span class="btn-text">打卡下班</span>
            </button>
            <button 
              v-else 
              class="action-btn secondary"
              @click="goToAdjustment"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">申请补卡</span>
            </button>
            <button class="action-btn secondary" @click="goToLeave">
              <span class="btn-icon">🏥</span>
              <span class="btn-text">申请请假</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="section-grid">
        <div class="section-card animate-fadeIn" :style="{ animationDelay: '0.5s' }">
          <div class="card-header">
            <h3 class="card-title">本周出勤趋势</h3>
          </div>
          <div class="chart-container">
            <div class="mini-chart">
              <div v-for="(item, index) in weeklyTrend" :key="index" class="chart-bar-wrap">
                <div 
                  class="chart-bar" 
                  :class="item.status"
                  :style="{ height: item.height + '%' }"
                  :title="item.label"
                ></div>
                <span class="chart-label">{{ item.day }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-card animate-fadeIn" :style="{ animationDelay: '0.6s' }">
          <div class="card-header">
            <h3 class="card-title">本月统计概览</h3>
          </div>
          <div class="stats-summary">
            <div class="summary-item">
              <span class="summary-label">出勤天数</span>
              <span class="summary-value">{{ monthlyStats?.total_days || 0 }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">出勤率</span>
              <span class="summary-value highlight">{{ attendanceRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">早退</span>
              <span class="summary-value">{{ monthlyStats?.early_leave_days || 0 }}天</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">旷工</span>
              <span class="summary-value">{{ monthlyStats?.absent_days || 0 }}天</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { getUser } from '../store'
import { attendanceAPI, adjustmentAPI, leaveAPI, lateAPI } from '../api'

const router = useRouter()
const user = ref(getUser())
const attendanceStatus = ref({})
const monthlyStats = ref({})
const pendingLeaves = ref(0)
const lateStatus = ref({})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  })
})

const statusIcon = computed(() => {
  if (!attendanceStatus.value.check_in_time) return '⏰'
  if (!attendanceStatus.value.check_out_time) return '👔'
  return '✅'
})

const statusText = computed(() => {
  if (!attendanceStatus.value.check_in_time) return '待打卡'
  if (!attendanceStatus.value.check_out_time) return '在岗中'
  const statusMap = { 
    normal: '正常出勤', 
    late: '迟到', 
    early_leave: '早退', 
    absent: '旷工', 
    leave: '请假' 
  }
  return statusMap[attendanceStatus.value.status] || '未知'
})

const attendanceRate = computed(() => {
  const total = monthlyStats.value.total_days || 0
  const normal = monthlyStats.value.normal_days || 0
  const late = monthlyStats.value.late_days || 0
  if (total === 0) return 0
  return Math.round(((normal + late) / total) * 100)
})

const weeklyTrend = computed(() => {
  const days = ['一', '二', '三', '四', '五', '六', '日']
  return days.map((day, index) => ({
    day,
    height: 40 + Math.random() * 50,
    status: ['normal', 'normal', 'late', 'normal', 'leave', 'normal', 'normal'][index],
    label: ['正常', '正常', '迟到', '正常', '请假', '正常', '正常'][index]
  }))
})

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const goToCheckIn = () => router.push('/checkin')
const goToCheckOut = () => router.push('/checkin')
const goToAdjustment = () => router.push('/adjustment')
const goToLeave = () => router.push('/leave')

const showLateWarning = ref(false)

watch(() => lateStatus.value.exceeded, (newVal) => {
  if (newVal) {
    showLateWarning.value = true
  }
})

const closeWarning = () => {
  showLateWarning.value = false
}

onMounted(async () => {
  try {
    const [attendanceRes, statsRes, leaveRes, lateRes] = await Promise.all([
      attendanceAPI.getDaily({ employee_id: user.value.id }),
      attendanceAPI.getStatistics({ employee_id: user.value.id, period: 'month' }),
      leaveAPI.getList({ employee_id: user.value.id }),
      lateAPI.getStatus({ employee_id: user.value.id })
    ])
    
    attendanceStatus.value = attendanceRes.data || {}
    monthlyStats.value = statsRes.data || {}
    pendingLeaves.value = leaveRes.data.filter(l => l.status === 'pending').length
    lateStatus.value = lateRes.data || {}
    
    if (lateStatus.value.exceeded) {
      setTimeout(() => {
        showLateWarning.value = true
      }, 500)
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.late-warning-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.modal-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.modal-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--status-absent);
  margin-bottom: var(--spacing-md);
}

.modal-message {
  font-size: var(--font-base);
  color: var(--dark);
  line-height: 1.6;
  
  .highlight {
    color: var(--status-absent);
    font-weight: 600;
  }
}

.modal-close-btn {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.greeting-section {
  margin-bottom: var(--spacing-lg);
}

.greeting-title {
  font-size: var(--font-2xl);
  font-weight: 600;
  color: var(--dark);
  margin-bottom: var(--spacing-xs);
}

.greeting-date {
  font-size: var(--font-sm);
  color: var(--gray);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.normal {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
    color: var(--status-normal);
  }
  
  &.late {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
    color: var(--status-late);
  }
  
  &.early_leave, &.absent {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
    color: var(--status-absent);
  }
  
  &.leave {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
    color: var(--status-leave);
  }
}

.stat-icon {
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--dark);
}

.stat-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--gray);
}

.stat-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--font-xs);
  color: var(--light-gray);
}

.threshold-text {
  font-size: var(--font-sm);
  color: var(--gray);
  font-weight: 400;
}

.late-stat {
  &.exceeded {
    border: 2px solid var(--status-absent);
    background: rgba(239, 68, 68, 0.03);
    
    .stat-icon-wrap.late {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
      color: var(--status-absent);
    }
    
    .stat-value {
      color: var(--status-absent);
    }
  }
}

.late-warning {
  margin-top: var(--spacing-xs);
  
  .warning-text {
    font-size: var(--font-xs);
    color: var(--status-absent);
    font-weight: 500;
  }
  
  .remaining-text {
    font-size: var(--font-xs);
    color: var(--gray);
  }
}

.action-section {
  margin-bottom: var(--spacing-lg);
}

.action-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

.action-header {
  margin-bottom: var(--spacing-md);
}

.action-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--dark);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
  
  &.success {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
  
  &.secondary {
    background: var(--bg-gray);
    color: var(--dark);
    
    &:hover {
      background: var(--border-gray);
      transform: translateY(-1px);
    }
  }
}

.btn-icon {
  font-size: var(--font-base);
}

.btn-text {
  font-weight: 500;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

.section-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--dark);
}

.chart-container {
  padding: var(--spacing-md) 0;
}

.mini-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  padding: 0 var(--spacing-sm);
}

.chart-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.chart-bar {
  width: 32px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast);
  
  &:hover {
    opacity: 0.8;
  }
  
  &.normal {
    background: linear-gradient(180deg, var(--status-normal) 0%, rgba(16, 185, 129, 0.5) 100%);
  }
  
  &.late {
    background: linear-gradient(180deg, var(--status-late) 0%, rgba(245, 158, 11, 0.5) 100%);
  }
  
  &.leave {
    background: linear-gradient(180deg, var(--status-leave) 0%, rgba(99, 102, 241, 0.5) 100%);
  }
}

.chart-label {
  font-size: var(--font-xs);
  color: var(--gray);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.summary-item {
  padding: var(--spacing-md);
  background: var(--bg-gray);
  border-radius: var(--radius-md);
  text-align: center;
}

.summary-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--gray);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  display: block;
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--dark);
  
  &.highlight {
    color: var(--primary-color);
  }
}
</style>