<template>
  <div class="page-container">
    <div class="page-header">
      <h2>部门管理</h2>
      <el-button type="primary" @click="handleAdd">新增部门</el-button>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.name" 
        placeholder="请输入部门名称" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="部门名称" />
      <el-table-column prop="parentName" label="上级部门" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'" 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
    
    <el-dialog :title="editForm.id ? '编辑部门' : '新增部门'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="部门名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-select v-model="editForm.parentId" placeholder="请选择上级部门">
            <el-option :label="'- 无 -'" :value="0" />
            <el-option 
              v-for="item in departments" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
              :disabled="editForm.id === item.id"
            />
          </el-select>
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
import { departmentApi } from '@/api'
import { useCompanyStore } from '@/store'

const companyStore = useCompanyStore()

const tableData = ref([])
const departments = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddModal = ref(false)

const searchForm = reactive({
  name: ''
})

const editForm = reactive({
  id: null,
  name: '',
  parentId: 0
})

onMounted(() => {
  fetchData()
})

watch(() => companyStore.currentCompanyId, () => {
  fetchData()
})

async function fetchData() {
  const res = await departmentApi.list(companyStore.currentCompanyId, pageNum.value, pageSize.value, searchForm.name)
  if (res.code === 200) {
    tableData.value = res.data.records.map(item => ({
      ...item,
      parentName: ''
    }))
    total.value = res.data.total
  }
  
  const deptRes = await departmentApi.getByCompanyId(companyStore.currentCompanyId)
  if (deptRes.code === 200) {
    departments.value = deptRes.data
    tableData.value.forEach(item => {
      const parent = departments.value.find(d => d.id === item.parentId)
      item.parentName = parent ? parent.name : ''
    })
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  searchForm.name = ''
  handleSearch()
}

function handlePageChange(val) {
  pageNum.value = val
  fetchData()
}

function handleAdd() {
  editForm.id = null
  editForm.name = ''
  editForm.parentId = 0
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.name = row.name
  editForm.parentId = row.parentId || 0
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.name) {
    ElMessage.warning('请输入部门名称')
    return
  }
  
  let res
  if (editForm.id) {
    res = await departmentApi.update(editForm.id, editForm)
  } else {
    res = await departmentApi.create({ ...editForm, companyId: companyStore.currentCompanyId })
  }
  
  if (res.code === 200) {
    ElMessage.success(res.message)
    showAddModal.value = false
    fetchData()
  } else {
    ElMessage.error(res.message)
  }
}

async function handleToggleStatus(row) {
  const res = await departmentApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('状态已更新')
  } else {
    ElMessage.error(res.message)
  }
}

async function handleDelete(row) {
  const confirm = await ElMessage.confirm('确定要删除该部门吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await departmentApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }
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

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>