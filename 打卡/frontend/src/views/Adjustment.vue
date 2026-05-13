<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="申请补卡" name="apply">
            <div class="form-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">补卡申请</h3>
              </div>
              
              <el-form :model="form" label-width="120px" class="adjustment-form">
                <el-form-item label="补卡日期">
                  <el-date-picker v-model="form.apply_date" type="date" class="form-input" />
                </el-form-item>
                
                <el-form-item label="上班时间">
                  <el-time-picker v-model="form.check_in_time" format="HH:mm" class="form-input" />
                </el-form-item>
                
                <el-form-item label="下班时间">
                  <el-time-picker v-model="form.check_out_time" format="HH:mm" class="form-input" />
                </el-form-item>
                
                <el-form-item label="原因">
                  <el-textarea v-model="form.reason" rows="3" placeholder="请填写补卡原因" class="form-textarea" />
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
                <h3 class="card-title">我的补卡记录</h3>
              </div>
              
              <el-table :data="myApplications" border class="applications-table">
                <el-table-column prop="apply_date" label="补卡日期" width="120" />
                <el-table-column prop="check_in_time" label="上班时间" width="100" />
                <el-table-column prop="check_out_time" label="下班时间" width="100" />
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
                <span class="empty-icon">📋</span>
                <p>暂无补卡申请记录</p>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="审批管理" name="manage" v-if="isAdmin">
            <div class="list-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">待审批补卡</h3>
                <span class="pending-count">{{ pendingApplications.length }} 条待处理</span>
              </div>
              
              <el-table :data="pendingApplications" border class="applications-table">
                <el-table-column prop="employee_name" label="申请人" width="120" />
                <el-table-column prop="apply_date" label="补卡日期" width="120" />
                <el-table-column prop="check_in_time" label="上班时间" width="100" />
                <el-table-column prop="check_out_time" label="下班时间" width="100" />
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
                <p>暂无待审批的补卡申请</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { getUser, isAdmin } from '../store'
import { adjustmentAPI } from '../api'

const user = getUser()
const activeTab = ref('apply')
const form = ref({
  apply_date: new Date(),
  check_in_time: '',
  check_out_time: '',
  reason: ''
})
const applications = ref([])

const statusMap = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝'
}

const myApplications = computed(() => {
  return applications.value.filter(a => a.employee_id === user.id)
})

const pendingApplications = computed(() => {
  return applications.value.filter(a => a.status === 'pending')
})

const submitApply = async () => {
  if (!form.value.apply_date) {
    alert('请选择补卡日期')
    return
  }
  if (!form.value.check_in_time && !form.value.check_out_time) {
    alert('请至少填写上班时间或下班时间')
    return
  }
  
  try {
    await adjustmentAPI.apply({
      employee_id: user.id,
      apply_date: form.value.apply_date.toISOString().split('T')[0],
      check_in_time: form.value.check_in_time,
      check_out_time: form.value.check_out_time,
      reason: form.value.reason
    })
    alert('补卡申请提交成功')
    form.value = { apply_date: new Date(), check_in_time: '', check_out_time: '', reason: '' }
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '提交失败')
  }
}

const approve = async (row) => {
  try {
    await adjustmentAPI.approve({ id: row.id })
    alert('审批通过')
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '审批失败')
  }
}

const reject = async (row) => {
  try {
    await adjustmentAPI.reject({ id: row.id })
    alert('已拒绝')
    loadData()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

const loadData = async () => {
  try {
    const params = isAdmin ? {} : { employee_id: user.id }
    const response = await adjustmentAPI.getList(params)
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

.adjustment-form {
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