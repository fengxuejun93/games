<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="filter-bar animate-slideIn">
        <el-select v-model="viewType" placeholder="查看类型" class="filter-select">
          <el-option label="个人统计" value="personal" />
          <el-option label="部门统计" value="department" />
          <el-option label="全员统计" value="all" />
        </el-select>
        
        <el-select v-model="period" placeholder="选择周期" class="filter-select">
          <el-option label="日" value="day" />
          <el-option label="周" value="week" />
          <el-option label="月" value="month" />
          <el-option label="季度" value="quarter" />
          <el-option label="年度" value="year" />
        </el-select>
        
        <el-date-picker v-model="date" type="date" class="filter-date" />
        
        <el-button type="primary" class="filter-btn" @click="loadStats">查询</el-button>
      </div>
      
      <div class="stats-header animate-fadeIn">
        <h3 class="stats-title">考勤统计报表</h3>
        <span class="stats-period">{{ stats?.start_date }} 至 {{ stats?.end_date }}</span>
      </div>
      
      <div class="stats-cards-grid animate-fadeIn">
        <div class="stat-card">
          <div class="stat-icon normal">✓</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats?.normal_days || 0 }}</span>
            <span class="stat-label">正常出勤</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon late">!</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats?.late_days || 0 }}</span>
            <span class="stat-label">迟到</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon early">←</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats?.early_leave_days || 0 }}</span>
            <span class="stat-label">早退</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon absent">✕</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats?.absent_days || 0 }}</span>
            <span class="stat-label">旷工</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon leave">休</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats?.leave_days || 0 }}</span>
            <span class="stat-label">请假</span>
          </div>
        </div>
      </div>
      
      <div class="charts-grid">
        <div class="chart-card animate-fadeIn">
          <div class="card-header">
            <h4 class="card-title">出勤状态分布</h4>
          </div>
          <div class="pie-chart">
            <div class="pie-container">
              <svg viewBox="0 0 100 100" class="pie-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" stroke-width="20" />
                <circle 
                  v-for="(segment, index) in pieSegments" 
                  :key="index"
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  :stroke="segment.color" 
                  stroke-width="20"
                  :stroke-dasharray="segment.dashArray"
                  :stroke-dashoffset="segment.offset"
                  stroke-linecap="round"
                  :style="{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }"
                />
              </svg>
              <div class="pie-center">
                <span class="pie-value">{{ attendanceRate }}%</span>
                <span class="pie-label">出勤率</span>
              </div>
            </div>
            <div class="pie-legend">
              <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
                <span class="legend-color" :style="{ background: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-card animate-fadeIn">
          <div class="card-header">
            <h4 class="card-title">出勤概览</h4>
          </div>
          <div class="summary-grid">
            <div class="summary-box">
              <span class="summary-value">{{ stats?.total_days || 0 }}</span>
              <span class="summary-label">出勤总天数</span>
            </div>
            <div class="summary-box highlight">
              <span class="summary-value">{{ attendanceRate }}%</span>
              <span class="summary-label">出勤率</span>
            </div>
            <div class="summary-box">
              <span class="summary-value">{{ abnormalRate }}%</span>
              <span class="summary-label">异常率</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { getUser } from '../store'
import { attendanceAPI } from '../api'

const user = getUser()
const viewType = ref('personal')
const period = ref('month')
const date = ref(new Date())
const stats = ref({})

const attendanceRate = computed(() => {
  const total = stats.value.total_days || 0
  const normal = stats.value.normal_days || 0
  const late = stats.value.late_days || 0
  if (total === 0) return 0
  return Math.round(((normal + late) / total) * 100)
})

const abnormalRate = computed(() => {
  return Math.max(0, 100 - attendanceRate.value)
})

const pieSegments = computed(() => {
  const total = stats.value.total_days || 1
  const values = [
    { value: stats.value.normal_days || 0, color: '#10b981' },
    { value: stats.value.late_days || 0, color: '#f59e0b' },
    { value: stats.value.early_leave_days || 0, color: '#ef4444' },
    { value: stats.value.absent_days || 0, color: '#dc2626' },
    { value: stats.value.leave_days || 0, color: '#6366f1' }
  ]
  
  const circumference = 2 * Math.PI * 40
  let offset = 0
  
  return values.map(item => {
    const dashArray = `${(item.value / total) * circumference} ${circumference}`
    const segment = { color: item.color, dashArray, offset: -offset }
    offset += (item.value / total) * circumference
    return segment
  }).filter(item => item.dashArray !== '0 251.2')
})

const legendItems = computed(() => [
  { label: '正常', value: stats.value.normal_days || 0, color: '#10b981' },
  { label: '迟到', value: stats.value.late_days || 0, color: '#f59e0b' },
  { label: '早退', value: stats.value.early_leave_days || 0, color: '#ef4444' },
  { label: '旷工', value: stats.value.absent_days || 0, color: '#dc2626' },
  { label: '请假', value: stats.value.leave_days || 0, color: '#6366f1' }
])

const loadStats = async () => {
  try {
    const params = {
      employee_id: viewType.value === 'personal' ? user.id : undefined,
      department_id: viewType.value === 'department' ? user.department_id : undefined,
      period: period.value,
      date: date.value?.toISOString().split('T')[0]
    }
    const response = await attendanceAPI.getStatistics(params)
    stats.value = response.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-select {
  width: 160px;
}

.filter-date {
  width: 180px;
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.stats-title {
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--dark);
}

.stats-period {
  font-size: var(--font-sm);
  color: var(--gray);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-gray);
  border-radius: var(--radius-md);
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  
  &.normal {
    background: rgba(16, 185, 129, 0.1);
    color: var(--status-normal);
  }
  
  &.late {
    background: rgba(245, 158, 11, 0.1);
    color: var(--status-late);
  }
  
  &.early {
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

.chart-card {
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

.pie-chart {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.pie-container {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-value {
  display: block;
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--dark);
}

.pie-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--gray);
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  flex: 1;
  font-size: var(--font-sm);
  color: var(--dark);
}

.legend-value {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--gray);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.summary-box {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-gray);
  border-radius: var(--radius-md);
  
  &.highlight {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    
    .summary-value {
      color: var(--primary-color);
    }
  }
}

.summary-value {
  display: block;
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--dark);
  margin-bottom: var(--spacing-xs);
}

.summary-label {
  font-size: var(--font-xs);
  color: var(--gray);
}
</style>