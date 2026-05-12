<template>
  <div class="page-container">
    <div class="page-header">
      <h2>权限管理</h2>
      <el-button type="primary" @click="handleAdd">新增权限</el-button>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.name" 
        placeholder="请输入权限名称" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="权限名称" />
      <el-table-column prop="code" label="权限编码" />
      <el-table-column prop="parentName" label="上级权限" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'primary' : 'info'">
            {{ scope.row.type === 1 ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="菜单路径" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="180">
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
    
    <el-dialog :title="editForm.id ? '编辑权限' : '新增权限'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="权限名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input v-model="editForm.code" />
        </el-form-item>
        <el-form-item label="上级权限">
          <el-select v-model="editForm.parentId" placeholder="请选择上级权限">
            <el-option :label="'- 无 -'" :value="0" />
            <el-option 
              v-for="item in parentPermissions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
              :disabled="editForm.id === item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="editForm.type">
            <el-option :label="'菜单'" :value="1" />
            <el-option :label="'按钮'" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="editForm.path" placeholder="菜单类型权限需填写路径" />
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-input v-model="editForm.icon" placeholder="可选" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input type="number" v-model="editForm.sort" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { permissionApi } from '@/api'

const tableData = ref([])
const permissions = ref([])
const parentPermissions = ref([])
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
  code: '',
  parentId: 0,
  type: 1,
  path: '',
  icon: '',
  sort: 0
})

onMounted(() => {
  fetchData()
})

async function fetchData() {
  const res = await permissionApi.list(pageNum.value, pageSize.value, searchForm.name)
  if (res.code === 200) {
    tableData.value = res.data.records.map(item => ({
      ...item,
      parentName: ''
    }))
    total.value = res.data.total
  }
  
  const allRes = await permissionApi.getAll()
  if (allRes.code === 200) {
    permissions.value = allRes.data
    parentPermissions.value = permissions.value.filter(p => p.type === 1)
    tableData.value.forEach(item => {
      const parent = permissions.value.find(p => p.id === item.parentId)
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
  editForm.code = ''
  editForm.parentId = 0
  editForm.type = 1
  editForm.path = ''
  editForm.icon = ''
  editForm.sort = 0
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.name = row.name
  editForm.code = row.code
  editForm.parentId = row.parentId || 0
  editForm.type = row.type || 1
  editForm.path = row.path || ''
  editForm.icon = row.icon || ''
  editForm.sort = row.sort || 0
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.name || !editForm.code) {
    ElMessage.warning('请填写权限名称和编码')
    return
  }
  
  let res
  if (editForm.id) {
    res = await permissionApi.update(editForm.id, editForm)
  } else {
    res = await permissionApi.create(editForm)
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
  const res = await permissionApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('状态已更新')
  } else {
    ElMessage.error(res.message)
  }
}

async function handleDelete(row) {
  const hasChildren = permissions.value.some(p => p.parentId === row.id)
  if (hasChildren) {
    ElMessage.warning('存在子权限，无法删除')
    return
  }
  
  const confirm = await ElMessage.confirm('确定要删除该权限吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await permissionApi.delete(row.id)
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