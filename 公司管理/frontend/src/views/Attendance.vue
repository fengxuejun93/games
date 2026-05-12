<template>
  <div class="page-container">
    <div class="page-header">
      <h2>考勤管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增考勤</el-button>
        <el-button type="success" @click="handleExport">导出Excel</el-button>
      </div>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.employeeName" 
        placeholder="请输入员工姓名" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-date-picker 
        v-model="searchForm.startDate" 
        type="date" 
        placeholder="开始日期" 
      />
      <el-date-picker 
        v-model="searchForm.endDate" 
        type="date" 
        placeholder="结束日期" 
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="employeeName" label="员工姓名" />
      <el-table-column prop="attendanceDate" label="考勤日期" />
      <el-table-column prop="checkInTime" label="上班时间" />
      <el-table-column prop="checkOutTime" label="下班时间" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        :current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
    
    <el-dialog :title="editForm.id ? '编辑考勤' : '新增考勤'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="员工">
          <el-select v-model="editForm.employeeId" placeholder="请选择员工">
            <el-option 
              v-for="item in employees" 
              :key="item.id" 
              :label="item.realName" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤日期">
          <el-date-picker v-model="editForm.attendanceDate" type="date" />
        </el-form-item>
        <el-form-item label="上班时间">
          <el-time-picker v-model="editForm.checkInTime" />
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker v-model="editForm.checkOutTime" />
        </el-form-item>
        <el-form-item label="考勤状态">
          <el-select v-model="editForm.status">
            <el-option :label="'正常'" :value="1" />
            <el-option :label="'迟到'" :value="2" />
            <el-option :label="'早退'" :value="3" />
            <el-option :label="'旷工'" :value="4" />
            <el-option :label="'请假'" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="editForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { attendanceApi, employeeApi } from '@/api'
import { useCompanyStore } from '@/store'

const companyStore = useCompanyStore()

const tableData = ref([])
const employees = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddModal = ref(false)

const searchForm = reactive({
  employeeName: '',
  startDate: '',
  endDate: ''
})

const editForm = reactive({
  id: null,
  employeeId: null,
  attendanceDate: '',
  checkInTime: '',
  checkOutTime: '',
  status: 1,
  remark: ''
})

onMounted(() => {
  fetchData()
  fetchEmployees()
})

watch(() => companyStore.currentCompanyId, () => {
  fetchData()
  fetchEmployees()
})

async function fetchData() {
  const res = await attendanceApi.list(companyStore.currentCompanyId, pageNum.value, pageSize.value, 
    searchForm.startDate, searchForm.endDate)
  if (res.code === 200) {
    tableData.value = res.data.records.map(item => ({
      ...item,
      employeeName: ''
    }))
    total.value = res.data.total
    updateEmployeeNames()
  }
}

async function fetchEmployees() {
  const res = await employeeApi.list(companyStore.currentCompanyId, 1, 1000)
  if (res.code === 200) {
    employees.value = res.data.records
    updateEmployeeNames()
  }
}

function updateEmployeeNames() {
  tableData.value.forEach(item => {
    const emp = employees.value.find(e => e.id === item.employeeId)
    item.employeeName = emp ? emp.realName : ''
  })
}

function handleSearch() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  searchForm.employeeName = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  handleSearch()
}

function handlePageChange(val) {
  pageNum.value = val
  fetchData()
}

function handleAdd() {
  editForm.id = null
  editForm.employeeId = null
  editForm.attendanceDate = ''
  editForm.checkInTime = ''
  editForm.checkOutTime = ''
  editForm.status = 1
  editForm.remark = ''
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.employeeId = row.employeeId
  editForm.attendanceDate = row.attendanceDate
  editForm.checkInTime = row.checkInTime
  editForm.checkOutTime = row.checkOutTime
  editForm.status = row.status
  editForm.remark = row.remark
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.employeeId || !editForm.attendanceDate) {
    ElMessage.warning('请选择员工和考勤日期')
    return
  }
  
  const data = { ...editForm, companyId: companyStore.currentCompanyId }
  
  let res
  if (editForm.id) {
    res = await attendanceApi.update(editForm.id, data)
  } else {
    res = await attendanceApi.create(data)
  }
  
  if (res.code === 200) {
    ElMessage.success(res.message)
    showAddModal.value = false
    fetchData()
  } else {
    ElMessage.error(res.message)
  }
}

async function handleDelete(row) {
  const confirm = await ElMessage.confirm('确定要删除该考勤记录吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await attendanceApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }
}

async function handleExport() {
  const res = await attendanceApi.export(companyStore.currentCompanyId, searchForm.startDate, searchForm.endDate)
  downloadFile(res, '考勤记录.xlsx')
}

function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function getStatusType(status) {
  return {
    1: 'success',
    2: 'warning',
    3: 'warning',
    4: 'danger',
    5: 'info'
  }[status] || 'default'
}

function getStatusText(status) {
  return {
    1: '正常',
    2: '迟到',
    3: '早退',
    4: '旷工',
    5: '请假'
  }[status] || '未知'
}
</script>

<style scoped>
.page-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>