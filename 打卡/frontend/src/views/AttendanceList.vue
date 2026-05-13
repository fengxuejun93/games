<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="filter-bar animate-slideIn">
        <el-select v-model="viewType" placeholder="查看类型" class="filter-select">
          <el-option label="个人考勤" value="personal" />
          <el-option label="部门考勤" value="department" />
          <el-option label="全员考勤" value="all" />
        </el-select>
        
        <el-date-picker 
          v-model="dateRange" 
          type="daterange" 
          range-separator="至" 
          start-placeholder="开始日期" 
          end-placeholder="结束日期"
          class="filter-date"
        />
        
        <el-select v-model="statusFilter" placeholder="状态筛选" class="filter-select">
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="迟到" value="late" />
          <el-option label="早退" value="early_leave" />
          <el-option label="旷工" value="absent" />
          <el-option label="请假" value="leave" />
        </el-select>
        
        <el-button type="primary" class="filter-btn" @click="search">查询</el-button>
        <el-button type="secondary" class="filter-btn" @click="exportData">导出 Excel</el-button>
      </div>
      
      <div class="stats-summary-card animate-fadeIn">
        <div class="summary-item">
          <span class="summary-value">{{ totalRecords }}</span>
          <span class="summary-label">总记录</span>
        </div>
        <div class="summary-item">
          <span class="summary-value normal">{{ normalCount }}</span>
          <span class="summary-label">正常</span>
        </div>
        <div class="summary-item">
          <span class="summary-value late">{{ lateCount }}</span>
          <span class="summary-label">迟到</span>
        </div>
        <div class="summary-item">
          <span class="summary-value early">{{ earlyCount }}</span>
          <span class="summary-label">早退</span>
        </div>
        <div class="summary-item">
          <span class="summary-value absent">{{ absentCount }}</span>
          <span class="summary-label">旷工</span>
        </div>
      </div>
      
      <div class="table-card animate-fadeIn">
        <div class="table-header">
          <h3 class="table-title">考勤明细</h3>
          <span class="table-count">共 {{ filteredRecords.length }} 条记录</span>
        </div>
        
        <el-table :data="filteredRecords" border class="attendance-table">
          <el-table-column prop="employee_name" label="员工" width="120" />
          <el-table-column prop="department_name" label="部门" width="120" />
          <el-table-column prop="check_in_time" label="日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.check_in_time) }}</template>
          </el-table-column>
          <el-table-column prop="check_in_time" label="上班" width="100">
            <template #default="scope">{{ formatTime(scope.row.check_in_time) }}</template>
          </el-table-column>
          <el-table-column prop="check_out_time" label="下班" width="100">
            <template #default="scope">{{ scope.row.check_out_time ? formatTime(scope.row.check_out_time) : '-' }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <span class="status-tag" :class="scope.row.status">
                {{ statusMap[scope.row.status] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <button class="action-btn" @click="showDetail(scope.row)">详情</button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="filteredRecords.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>暂无考勤记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { getUser, isAdmin } from '../store'
import { attendanceAPI, exportAPI } from '../api'

const user = getUser()
const viewType = ref('personal')
const dateRange = ref([])
const statusFilter = ref('')
const attendanceList = ref([])

const statusMap = {
  normal: '正常',
  late: '迟到',
  early_leave: '早退',
  absent: '旷工',
  leave: '请假'
}

const filteredRecords = computed(() => {
  let records = [...attendanceList.value]
  
  if (statusFilter.value) {
    records = records.filter(r => r.status === statusFilter.value)
  }
  
  return records
})

const totalRecords = computed(() => attendanceList.value.length)

const normalCount = computed(() => attendanceList.value.filter(r => r.status === 'normal').length)
const lateCount = computed(() => attendanceList.value.filter(r => r.status === 'late').length)
const earlyCount = computed(() => attendanceList.value.filter(r => r.status === 'early_leave').length)
const absentCount = computed(() => attendanceList.value.filter(r => r.status === 'absent').length)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const search = async () => {
  await loadAttendance()
}

const loadAttendance = async () => {
  try {
    const params = {
      employee_id: viewType.value === 'personal' ? user.id : undefined,
      department_id: viewType.value === 'department' ? user.department_id : undefined,
      start_date: dateRange.value[0]?.toISOString().split('T')[0],
      end_date: dateRange.value[1]?.toISOString().split('T')[0]
    }
    const response = await attendanceAPI.getList(params)
    attendanceList.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const showDetail = (row) => {
  const details = [
    `员工: ${row.employee_name}`,
    `部门: ${row.department_name || '-'}`,
    `日期: ${formatDate(row.check_in_time)}`,
    `上班: ${formatTime(row.check_in_time)}`,
    `下班: ${formatTime(row.check_out_time)}`,
    `状态: ${statusMap[row.status]}`
  ]
  alert(details.join('\n'))
}

const exportData = async () => {
  try {
    const params = {
      employee_id: viewType.value === 'personal' ? user.id : undefined,
      department_id: viewType.value === 'department' ? user.department_id : undefined,
      start_date: dateRange.value[0]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      end_date: dateRange.value[1]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }
    const response = await exportAPI.attendance(params)
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadAttendance()
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
  width: 260px;
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.stats-summary-card {
  display: flex;
  gap: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md);
  background: var(--bg-gray);
  border-radius: var(--radius-md);
}

.summary-value {
  display: block;
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--dark);
  margin-bottom: var(--spacing-xs);
  
  &.normal {
    color: var(--status-normal);
  }
  
  &.late {
    color: var(--status-late);
  }
  
  &.early {
    color: var(--status-early);
  }
  
  &.absent {
    color: var(--status-absent);
  }
}

.summary-label {
  font-size: var(--font-xs);
  color: var(--gray);
}

.table-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.table-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--dark);
}

.table-count {
  font-size: var(--font-sm);
  color: var(--gray);
}

.attendance-table {
  :deep(.el-table__header-wrapper) {
    background: var(--bg-gray);
  }
  
  :deep(.el-table__header-row) {
    th {
      background: transparent;
      font-weight: 600;
      color: var(--dark);
    }
  }
  
  :deep(.el-table__body-row) {
    &:hover {
      background: rgba(59, 130, 246, 0.05);
    }
  }
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

.action-btn {
  padding: 4px 12px;
  background: var(--bg-gray);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  color: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray);
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }
}
</style>