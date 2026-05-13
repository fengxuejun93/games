<template>
  <div class="page-container">
    <nav-bar />
    
    <div class="main-content">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="员工管理" name="employees">
            <div class="page-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">员工管理</h3>
                <el-button type="primary" class="add-btn" @click="showAddEmployee">添加员工</el-button>
              </div>
              
              <el-table :data="employees" border class="admin-table">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="department_name" label="部门" width="120" />
                <el-table-column prop="position" label="职位" width="120" />
                <el-table-column prop="phone" label="电话" width="120" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="role" label="角色" width="100">
                  <template #default="scope">
                    <span class="role-tag" :class="scope.row.role">
                      {{ scope.row.role === 'admin' ? '管理员' : '员工' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                  <template #default="scope">
                    <button class="action-btn edit" @click="editEmployee(scope.row)">编辑</button>
                    <button class="action-btn delete" @click="deleteEmployee(scope.row)">删除</button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="部门管理" name="departments">
            <div class="page-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">部门管理</h3>
                <el-button type="primary" class="add-btn" @click="showAddDepartment">添加部门</el-button>
              </div>
              
              <el-table :data="departments" border class="admin-table">
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="employeeCount" label="人数" width="80">
                  <template #default="scope">{{ getDeptEmployeeCount(scope.row.id) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                  <template #default="scope">
                    <button class="action-btn edit" @click="editDepartment(scope.row)">编辑</button>
                    <button class="action-btn delete" @click="deleteDepartment(scope.row)">删除</button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="迟到超标" name="lateExceeded">
            <div class="page-card animate-fadeIn">
              <div class="card-header">
                <h3 class="card-title">迟到超标人员</h3>
                <span class="exceeded-count">{{ exceededEmployees.length }} 人超标</span>
              </div>
              
              <div class="filter-bar">
                <el-select v-model="selectedDepartment" placeholder="选择部门" class="filter-select">
                  <el-option label="全部部门" value="" />
                  <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
                </el-select>
                <el-input v-model="threshold" type="number" placeholder="迟到阈值" class="threshold-input" />
                <el-button type="primary" class="filter-btn" @click="loadExceededEmployees">查询</el-button>
              </div>
              
              <el-table :data="filteredExceededEmployees" border class="admin-table exceeded-table">
                <el-table-column prop="employee_name" label="员工姓名" width="120" />
                <el-table-column prop="department_name" label="所属部门" width="150" />
                <el-table-column prop="late_count" label="迟到次数" width="100">
                  <template #default="scope">
                    <span class="late-count" :class="{ exceeded: scope.row.late_count > (threshold || 3) }">
                      {{ scope.row.late_count }}次
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="超标情况" width="120">
                  <template #default="scope">
                    <span class="exceeded-status">
                      超出 {{ scope.row.late_count - (threshold || 3) }} 次
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              
              <div v-if="filteredExceededEmployees.length === 0" class="empty-state">
                <span class="empty-icon">✅</span>
                <p>暂无迟到超标人员</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <el-dialog :visible.sync="showEmployeeModal" title="员工信息" class="custom-dialog">
      <el-form :model="employeeForm" label-width="100px" class="modal-form">
        <el-form-item label="姓名">
          <el-input v-model="employeeForm.name" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="employeeForm.department_id">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="employeeForm.position" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="employeeForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="employeeForm.email" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="employeeForm.password" type="password" placeholder="不填则保持不变" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="employeeForm.role">
            <el-option label="员工" value="employee" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmployeeModal = false">取消</el-button>
        <el-button type="primary" @click="saveEmployee">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog :visible.sync="showDepartmentModal" title="部门信息" class="custom-dialog">
      <el-form :model="departmentForm" label-width="100px" class="modal-form">
        <el-form-item label="名称">
          <el-input v-model="departmentForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-textarea v-model="departmentForm.description" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDepartmentModal = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { employeeAPI, departmentAPI, authAPI, lateAPI } from '../api'

const activeTab = ref('employees')
const employees = ref([])
const departments = ref([])
const exceededEmployees = ref([])
const selectedDepartment = ref('')
const threshold = ref(3)
const showEmployeeModal = ref(false)
const showDepartmentModal = ref(false)
const employeeForm = ref({
  name: '',
  department_id: '',
  position: '',
  phone: '',
  email: '',
  password: '',
  role: 'employee'
})
const departmentForm = ref({
  name: '',
  description: ''
})
const editingEmployeeId = ref(null)
const editingDepartmentId = ref(null)

const getDeptEmployeeCount = (deptId) => {
  return employees.value.filter(e => e.department_id === deptId).length
}

const filteredExceededEmployees = computed(() => {
  let result = [...exceededEmployees.value]
  
  if (selectedDepartment.value) {
    result = result.filter(e => e.department_id === parseInt(selectedDepartment.value))
  }
  
  return result
})

const loadExceededEmployees = async () => {
  try {
    const params = {
      department_id: selectedDepartment.value || undefined,
      threshold: threshold.value
    }
    const response = await lateAPI.getExceeded(params)
    exceededEmployees.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const loadEmployees = async () => {
  try {
    const response = await employeeAPI.getAll()
    employees.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const loadDepartments = async () => {
  try {
    const response = await departmentAPI.getAll()
    departments.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const showAddEmployee = () => {
  employeeForm.value = { name: '', department_id: '', position: '', phone: '', email: '', password: '', role: 'employee' }
  editingEmployeeId.value = null
  showEmployeeModal.value = true
}

const editEmployee = (row) => {
  employeeForm.value = {
    name: row.name,
    department_id: row.department_id,
    position: row.position,
    phone: row.phone,
    email: row.email,
    password: '',
    role: row.role
  }
  editingEmployeeId.value = row.id
  showEmployeeModal.value = true
}

const saveEmployee = async () => {
  try {
    if (editingEmployeeId.value) {
      const data = { ...employeeForm.value }
      delete data.password
      await employeeAPI.update(editingEmployeeId.value, data)
    } else {
      if (!employeeForm.value.password) {
        alert('请设置初始密码')
        return
      }
      await authAPI.register(employeeForm.value)
    }
    showEmployeeModal.value = false
    loadEmployees()
    alert('保存成功')
  } catch (error) {
    alert(error.response?.data?.error || '保存失败')
  }
}

const deleteEmployee = async (row) => {
  if (!confirm(`确定要删除员工 ${row.name} 吗？`)) return
  try {
    await employeeAPI.delete(row.id)
    loadEmployees()
    alert('删除成功')
  } catch (error) {
    alert(error.response?.data?.error || '删除失败')
  }
}

const showAddDepartment = () => {
  departmentForm.value = { name: '', description: '' }
  editingDepartmentId.value = null
  showDepartmentModal.value = true
}

const editDepartment = (row) => {
  departmentForm.value = { name: row.name, description: row.description }
  editingDepartmentId.value = row.id
  showDepartmentModal.value = true
}

const saveDepartment = async () => {
  try {
    if (editingDepartmentId.value) {
      await departmentAPI.update(editingDepartmentId.value, departmentForm.value)
    } else {
      await departmentAPI.create(departmentForm.value)
    }
    showDepartmentModal.value = false
    loadDepartments()
    loadEmployees()
    alert('保存成功')
  } catch (error) {
    alert(error.response?.data?.error || '保存失败')
  }
}

const deleteDepartment = async (row) => {
  if (getDeptEmployeeCount(row.id) > 0) {
    alert('该部门下还有员工，请先转移或删除员工')
    return
  }
  if (!confirm(`确定要删除部门 ${row.name} 吗？`)) return
  try {
    await departmentAPI.delete(row.id)
    loadDepartments()
    alert('删除成功')
  } catch (error) {
    alert(error.response?.data?.error || '删除失败')
  }
}

onMounted(() => {
  loadEmployees()
  loadDepartments()
  loadExceededEmployees()
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

.page-card {
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

.add-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.admin-table {
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

.role-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-xs);
  font-weight: 500;
  
  &.admin {
    background: rgba(245, 158, 11, 0.1);
    color: var(--status-late);
  }
  
  &.employee {
    background: rgba(16, 185, 129, 0.1);
    color: var(--status-normal);
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
  
  &.edit {
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary-color);
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
    }
  }
  
  &.delete {
    background: rgba(239, 68, 68, 0.1);
    color: var(--status-early);
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}

.custom-dialog {
  :deep(.el-dialog) {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
  }
  
  :deep(.el-dialog__header) {
    background: var(--bg-gray);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  :deep(.el-dialog__body) {
    padding: var(--spacing-lg);
  }
}

.modal-form {
  :deep(.el-form-item) {
    margin-bottom: var(--spacing-md);
  }
}

.exceeded-count {
  font-size: var(--font-xs);
  padding: 4px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-absent);
  border-radius: 20px;
}

.filter-bar {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-select {
  width: 180px;
}

.threshold-input {
  width: 120px;
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.exceeded-table {
  :deep(.el-table__body-row) {
    &:hover {
      background: rgba(239, 68, 68, 0.03);
    }
  }
}

.late-count {
  font-weight: 600;
  color: var(--status-late);
  
  &.exceeded {
    color: var(--status-absent);
  }
}

.exceeded-status {
  font-size: var(--font-sm);
  color: var(--status-absent);
  font-weight: 500;
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