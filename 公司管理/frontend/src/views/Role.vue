<template>
  <div class="page-container">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.name" 
        placeholder="请输入角色名称" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="code" label="角色编码" />
      <el-table-column prop="description" label="角色描述" />
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
          <el-button size="small" @click="handleAssignPermissions(scope.row)">分配权限</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'" 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.companyId === null">删除</el-button>
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
    
    <el-dialog :title="editForm.id ? '编辑角色' : '新增角色'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="editForm.code" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input type="textarea" v-model="editForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="分配权限" :visible.sync="showPermissionModal" width="600px">
      <el-tree
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="permissionForm.permissionIds"
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <el-button @click="showPermissionModal = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { roleApi, permissionApi } from '@/api'
import { useCompanyStore } from '@/store'

const companyStore = useCompanyStore()

const tableData = ref([])
const permissions = ref([])
const permissionTree = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddModal = ref(false)
const showPermissionModal = ref(false)
const currentRoleId = ref(null)

const searchForm = reactive({
  name: ''
})

const editForm = reactive({
  id: null,
  name: '',
  code: '',
  description: ''
})

const permissionForm = reactive({
  permissionIds: []
})

onMounted(() => {
  fetchData()
  fetchPermissions()
})

watch(() => companyStore.currentCompanyId, () => {
  fetchData()
})

async function fetchData() {
  const res = await roleApi.list(companyStore.currentCompanyId, pageNum.value, pageSize.value, searchForm.name)
  if (res.code === 200) {
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

async function fetchPermissions() {
  const res = await permissionApi.getAll()
  if (res.code === 200) {
    permissions.value = res.data
    buildPermissionTree()
  }
}

function buildPermissionTree() {
  const tree = []
  const map = {}
  
  permissions.value.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  
  permissions.value.forEach(item => {
    if (item.parentId === 0) {
      tree.push(map[item.id])
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    }
  })
  
  permissionTree.value = tree
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
  editForm.description = ''
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.name = row.name
  editForm.code = row.code
  editForm.description = row.description
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.name || !editForm.code) {
    ElMessage.warning('请填写角色名称和编码')
    return
  }
  
  let res
  if (editForm.id) {
    res = await roleApi.update(editForm.id, editForm)
  } else {
    res = await roleApi.create({ ...editForm, companyId: companyStore.currentCompanyId })
  }
  
  if (res.code === 200) {
    ElMessage.success(res.message)
    showAddModal.value = false
    fetchData()
  } else {
    ElMessage.error(res.message)
  }
}

function handleAssignPermissions(row) {
  currentRoleId.value = row.id
  permissionForm.permissionIds = []
  
  roleApi.getPermissions(row.id).then(res => {
    if (res.code === 200) {
      permissionForm.permissionIds = res.data
    }
  })
  
  showPermissionModal.value = true
}

async function handleSavePermissions() {
  const res = await roleApi.update(currentRoleId.value, { permissionIds: permissionForm.permissionIds })
  if (res.code === 200) {
    ElMessage.success('权限分配成功')
    showPermissionModal.value = false
  } else {
    ElMessage.error(res.message)
  }
}

async function handleToggleStatus(row) {
  const res = await roleApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('状态已更新')
  } else {
    ElMessage.error(res.message)
  }
}

async function handleDelete(row) {
  if (row.companyId === null) {
    ElMessage.warning('系统角色不能删除')
    return
  }
  
  const confirm = await ElMessage.confirm('确定要删除该角色吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await roleApi.delete(row.id)
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