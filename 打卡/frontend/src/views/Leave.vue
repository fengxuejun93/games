<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="申请请假" name="apply">
            <div class="form-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">请假申请</h3>
              </div>
              
              <el-form :model="form" label-width="120px" class="leave-form">
                <el-form-item label="开始日期">
                  <el-date-picker v-model="form.start_date" type="date" class="form-input" />
                </el-form-item>
                
                <el-form-item label="结束日期">
                  <el-date-picker v-model="form.end_date" type="date" class="form-input" />
                </el-form-item>
                
                <el-form-item label="请假类型">
                  <el-select v-model="form.type" class="form-input">
                    <el-option label="病假" value="sick" />
                    <el-option label="事假" value="personal" />
                    <el-option label="年假" value="annual" />
                    <el-option label="产假" value="maternity" />
                    <el-option label="陪产假" value="paternity" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="请假天数">
                  <el-input v-model="days" disabled class="form-input" />
                </el-form-item>
                
                <el-form-item label="原因">
                  <el-textarea v-model="form.reason" rows="3" placeholder="请填写请假原因" class="form-textarea" />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" class="submit-btn" @click="submitApply">提交申请</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="我的申请" name="my">
            <div class="list-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">我的请假记录</h3>
              </div>
              
              <el-table :data="myApplications" border class="applications-table">
                <el-table-column prop="start_date" label="开始日期" width="120" />
                <el-table-column prop="end_date" label="结束日期" width="120" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="scope">{{ typeMap[scope.row.type] }}</template>
                </el-table-column>
                <el-table-column prop="reason" label="原因" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <span class="status-tag" :class="scope.row.status">
                      {{ statusMap[scope.row.status] }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" />
              </el-table>
              
              <div v-if="myApplications.length === 0" class="empty-state">
                <span class="empty-icon">🏥</span>
                <p>暂无请假记录</p>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="审批管理" name="manage" v-if="isAdmin">
            <div class="list-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">待审批请假</h3>
                <span class="pending-count">{{ pendingApplications.length }} 条待处理</span>
              </div>
              
              <el-table :data="pendingApplications" border class="applications-table">
                <el-table-column prop="employee_name" label="申请人" width="120" />
                <el-table-column prop="department_name" label="部门" width="120" />
                <el-table-column prop="start_date" label="开始日期" width="120" />
                <el-table-column prop="end_date" label="结束日期" width="120" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="scope">{{ typeMap[scope.row.type] }}</template>
                </el-table-column>
                <el-table-column prop="reason" label="原因" />
                <el-table-column label="操作" width="160">
                  <template #default="scope">
                    <button class="action-btn approve" @click="approve(scope.row)">通过</button>
                    <button class="action-btn reject" @click="reject(scope.row)">拒绝</button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div v-if="pendingApplications.length === 0" class="empty-state">
                <span class="empty-icon">✅</span>
                <p>暂无待审批的请假申请</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import NavBar from '../components/NavBar.vue'
import { getUser, isAdmin } from '../store'
import { leaveAPI } from '../api'

const user = getUser()
const activeTab = ref('apply')
const form = ref({
  start_date: new Date(),
  end_date: new Date(),
  type: 'personal',
  reason: ''
})
const applications = ref([])

const typeMap = {
  sick: '病假',
  personal: '事假',
  annual: '年假',
  maternity: '产假',
  paternity: '陪产假'
}

const statusMap = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝'
}

const days = computed(() => {
  if (!form.value.start_date || !form.value.end_date) return '0'
  const start = new Date(form.value.start_date)
  const end = new Date(form.value.end_date)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
})

watch([() => form.value.start_date, () => form.value.end_date], () => {
  if (form.value.start_date && form.value.end_date && form.value.start_date > form.value.end_date) {
    form.value.end_date = form.value.start_date
  }
})

const myApplications = computed(() => {
  return applications.value.filter(a => a.employee_id === user.id)
})

const pendingApplications = computed(() => {
  return applications.value.filter(a => a.status === 'pending')
})

const submitApply = async () => {
  if (!form.value.start_date) {
    alert('请选择开始日期')
    return
  }
  if (!form.value.end_date) {
    alert('请选择结束日期')
    return
  }
  
  try {
    await leaveAPI.apply({
      employee_id: user.id,
      start_date: form.value.start_date.toISOString().split('T')[0],
      end_date: form.value.end_date.toISOString().split('T')[0],
      type: form.value.type,
      reason: form.value.reason
    })
    alert('请假申请提交成功')
    form.value = { start_date: new Date(), end_date: new Date(), type: 'personal', reason: '' }
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '提交失败')
  }
}

const approve = async (row) => {
  try {
    await leaveAPI.approve({ id: row.id })
    alert('审批通过')
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '审批失败')
  }
}

const reject = async (row) => {
  try {
    await leaveAPI.reject({ id: row.id })
    alert('已拒绝')
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

const loadData = async () => {
  try {
    const params = isAdmin ? {} : { employee_id: user.id }
    const response = await leaveAPI.getList(params)
    applications.value = response.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.tabs-container {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.custom-tabs {
  :deep(.el-tabs__header) {
    background: var(--bg-gray);
    border-bottom: none;
  }
  
  :deep(.el-tabs__nav) {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  :deep(.el-tabs__item) {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    margin-right: var(--spacing-sm);
    font-size: var(--font-sm);
    font-weight: 500;
    
    &.is-active {
      background: var(--bg-white);
      color: var(--primary-color);
      box-shadow: var(--shadow-sm);
    }
  }
}

.form-card {
  padding: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.card-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--dark);
}

.pending-count {
  font-size: var(--font-xs);
  padding: 4px 12px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--status-late);
  border-radius: 20px;
}

.leave-form {
  :deep(.el-form-item) {
    margin-bottom: var(--spacing-md);
  }
}

.form-input {
  width: 100%;
  max-width: 280px;
}

.form-textarea {
  width: 100%;
  max-width: 400px;
}

.submit-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-md);
}

.list-card {
  padding: var(--spacing-lg);
}

.applications-table {
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
  
  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: var(--status-late);
  }
  
  &.approved {
    background: rgba(16, 185, 129, 0.1);
    color: var(--status-normal);
  }
  
  &.rejected {
    background: rgba(239, 68, 68, 0.1);
    color: var(--status-early);
  }
}

.action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-right: var(--spacing-xs);
  
  &.approve {
    background: rgba(16, 185, 129, 0.1);
    color: var(--status-normal);
    
    &:hover {
      background: rgba(16, 185, 129, 0.2);
    }
  }
  
  &.reject {
    background: rgba(239, 68, 68, 0.1);
    color: var(--status-early);
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
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