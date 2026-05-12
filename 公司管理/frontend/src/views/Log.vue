<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统日志</h2>
      <div class="header-actions">
        <el-button type="success" @click="handleExport">导出Excel</el-button>
      </div>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.module" 
        placeholder="请输入操作模块" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-input 
        v-model="searchForm.employeeName" 
        placeholder="请输入操作人" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-date-picker 
        v-model="searchForm.startTime" 
        type="datetime" 
        placeholder="开始时间" 
      />
      <el-date-picker 
        v-model="searchForm.endTime" 
        type="datetime" 
        placeholder="结束时间" 
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="employeeName" label="操作人" />
      <el-table-column prop="module" label="操作模块" />
      <el-table-column prop="operation" label="操作内容" />
      <el-table-column prop="ip" label="操作IP" />
      <el-table-column prop="status" label="操作状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="errorMsg" label="错误信息" />
      <el-table-column prop="createdAt" label="操作时间" width="180" />
    </el-table>
    
    <div class="pagination">
      <el-pagination
        :current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { logApi } from '@/api'
import { useCompanyStore, useAuthStore } from '@/store'

const companyStore = useCompanyStore()
const authStore = useAuthStore()

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

const searchForm = reactive({
  module: '',
  employeeName: '',
  startTime: '',
  endTime: ''
})

onMounted(() => {
  fetchData()
})

watch(() => companyStore.currentCompanyId, () => {
  fetchData()
})

async function fetchData() {
  const companyId = authStore.isSuperAdmin ? companyStore.currentCompanyId : null
  const res = await logApi.list(companyId, pageNum.value, pageSize.value, 
    searchForm.startTime, searchForm.endTime, searchForm.module)
  if (res.code === 200) {
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  searchForm.module = ''
  searchForm.employeeName = ''
  searchForm.startTime = ''
  searchForm.endTime = ''
  handleSearch()
}

function handlePageChange(val) {
  pageNum.value = val
  fetchData()
}

async function handleExport() {
  const companyId = authStore.isSuperAdmin ? companyStore.currentCompanyId : null
  const res = await logApi.export(companyId, searchForm.startTime, searchForm.endTime)
  downloadFile(res, '系统日志.xlsx')
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