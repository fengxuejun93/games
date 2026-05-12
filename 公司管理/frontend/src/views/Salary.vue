<template>
  <div class="page-container">
    <div class="page-header">
      <h2>薪资管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增薪资</el-button>
        <el-button type="success" @click="handleExport">导出Excel</el-button>
        <el-button type="warning" @click="handlePay">批量发放</el-button>
      </div>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.employeeName" 
        placeholder="请输入员工姓名" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-input 
        v-model="searchForm.salaryMonth" 
        placeholder="薪资月份（YYYY-MM）" 
        class="search-input"
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="employeeName" label="员工姓名" />
      <el-table-column prop="salaryMonth" label="薪资月份" />
      <el-table-column prop="basicSalary" label="基本工资" />
      <el-table-column prop="bonus" label="奖金" />
      <el-table-column prop="allowance" label="津贴" />
      <el-table-column prop="deduction" label="扣款" />
      <el-table-column prop="totalSalary" label="实发工资" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'warning' : 'success'">
            {{ scope.row.status === 1 ? '未发放' : '已发放' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="handleSinglePay(scope.row)"
            :disabled="scope.row.status === 2"
          >
            发放
          </el-button>
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
    
    <el-dialog :title="editForm.id ? '编辑薪资' : '新增薪资'" :visible.sync="showAddModal">
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
        <el-form-item label="薪资月份">
          <el-input v-model="editForm.salaryMonth" placeholder="格式：YYYY-MM" />
        </el-form-item>
        <el-form-item label="基本工资">
          <el-input type="number" v-model="editForm.basicSalary" />
        </el-form-item>
        <el-form-item label="奖金">
          <el-input type="number" v-model="editForm.bonus" />
        </el-form-item>
        <el-form-item label="津贴">
          <el-input type="number" v-model="editForm.allowance" />
        </el-form-item>
        <el-form-item label="扣款">
          <el-input type="number" v-model="editForm.deduction" />
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
import { salaryApi, employeeApi } from '@/api'
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
  salaryMonth: ''
})

const editForm = reactive({
  id: null,
  employeeId: null,
  salaryMonth: '',
  basicSalary: 0,
  bonus: 0,
  allowance: 0,
  deduction: 0,
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
  const res = await salaryApi.list(companyStore.currentCompanyId, pageNum.value, pageSize.value, 
    searchForm.salaryMonth)
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
  searchForm.salaryMonth = ''
  handleSearch()
}

function handlePageChange(val) {
  pageNum.value = val
  fetchData()
}

function handleAdd() {
  editForm.id = null
  editForm.employeeId = null
  editForm.salaryMonth = ''
  editForm.basicSalary = 0
  editForm.bonus = 0
  editForm.allowance = 0
  editForm.deduction = 0
  editForm.remark = ''
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.employeeId = row.employeeId
  editForm.salaryMonth = row.salaryMonth
  editForm.basicSalary = row.basicSalary
  editForm.bonus = row.bonus
  editForm.allowance = row.allowance
  editForm.deduction = row.deduction
  editForm.remark = row.remark
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.employeeId || !editForm.salaryMonth) {
    ElMessage.warning('请选择员工和薪资月份')
    return
  }
  
  const data = { ...editForm, companyId: companyStore.currentCompanyId }
  
  let res
  if (editForm.id) {
    res = await salaryApi.update(editForm.id, data)
  } else {
    res = await salaryApi.create(data)
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
  const confirm = await ElMessage.confirm('确定要删除该薪资记录吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await salaryApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }
}

async function handleSinglePay(row) {
  const confirm = await ElMessage.confirm(`确定要发放 ${row.employeeName} 的薪资吗？`, '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await salaryApi.update(row.id, { status: 2 })
    if (res.code === 200) {
      row.status = 2
      ElMessage.success('薪资发放成功')
    } else {
      ElMessage.error(res.message)
    }
  }
}

async function handlePay() {
  const month = searchForm.salaryMonth || new Date().toISOString().substring(0, 7)
  const confirm = await ElMessage.confirm(`确定要发放 ${month} 月份的所有薪资吗？`, '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await salaryApi.pay(companyStore.currentCompanyId, month)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }
}

async function handleExport() {
  const res = await salaryApi.export(companyStore.currentCompanyId, searchForm.salaryMonth)
  downloadFile(res, '薪资记录.xlsx')
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