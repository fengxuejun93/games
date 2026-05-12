<template>
  <div class="page-container">
    <div class="page-header">
      <h2>员工管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增员工</el-button>
        <el-button type="success" @click="handleExport">导出Excel</el-button>
      </div>
    </div>
    
    <div class="search-bar">
      <el-input 
        v-model="searchForm.realName" 
        placeholder="请输入员工姓名" 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-button type="default" @click="handleSearch">搜索</el-button>
      <el-button type="default" @click="handleReset">重置</el-button>
    </div>
    
    <el-table :data="tableData" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="avatar" label="头像" width="100">
        <template #default="scope">
          <img 
            v-if="scope.row.avatar" 
            :src="scope.row.avatar" 
            class="avatar" 
            alt="头像"
          />
          <span v-else class="no-avatar">{{ scope.row.realName?.charAt(0) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="departmentName" label="所属部门" />
      <el-table-column prop="positionName" label="岗位" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" @click="handleUploadAvatar(scope.row)">上传头像</el-button>
          <el-button size="small" @click="handleAssignRoles(scope.row)">分配角色</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'" 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '离职' : '复职' }}
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
    
    <el-dialog :title="editForm.id ? '编辑员工' : '新增员工'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <template v-if="!editForm.id">
          <el-form-item label="密码">
            <el-input type="password" v-model="editForm.password" />
          </el-form-item>
        </template>
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="editForm.departmentId" placeholder="请选择部门">
            <el-option :label="'- 无 -'" :value="0" />
            <el-option 
              v-for="item in departments" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="editForm.positionId" placeholder="请选择岗位">
            <el-option :label="'- 无 -'" :value="0" />
            <el-option 
              v-for="item in positions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="分配角色" :visible.sync="showRoleModal">
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="roleForm.roleIds">
            <el-checkbox 
              v-for="item in roles" 
              :key="item.id" 
              :label="item.id" 
              :value="item.id"
            >
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoleModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRoles">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="上传头像" :visible.sync="showAvatarModal">
      <el-form :model="avatarForm" label-width="100px">
        <el-form-item label="选择图片">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarUploadSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img 
              v-if="avatarForm.imageUrl" 
              :src="avatarForm.imageUrl" 
              class="avatar-preview"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAvatarModal = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { employeeApi, departmentApi, positionApi, roleApi, fileApi } from '@/api'
import { useCompanyStore } from '@/store'

const companyStore = useCompanyStore()

const tableData = ref([])
const departments = ref([])
const positions = ref([])
const roles = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddModal = ref(false)
const showRoleModal = ref(false)
const showAvatarModal = ref(false)
const currentEmployeeId = ref(null)

const searchForm = reactive({
  realName: ''
})

const editForm = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  departmentId: 0,
  positionId: 0,
  phone: '',
  email: ''
})

const roleForm = reactive({
  roleIds: []
})

const avatarForm = reactive({
  imageUrl: ''
})

const uploadUrl = '/api/files/avatar'
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
}

onMounted(() => {
  fetchData()
  fetchDepartments()
  fetchPositions()
  fetchRoles()
})

watch(() => companyStore.currentCompanyId, () => {
  fetchData()
  fetchDepartments()
  fetchPositions()
  fetchRoles()
})

async function fetchData() {
  const res = await employeeApi.list(companyStore.currentCompanyId, pageNum.value, pageSize.value, searchForm.realName)
  if (res.code === 200) {
    tableData.value = res.data.records.map(item => ({
      ...item,
      departmentName: '',
      positionName: ''
    }))
    total.value = res.data.total
    updateDepartmentAndPositionNames()
  }
}

async function fetchDepartments() {
  const res = await departmentApi.getByCompanyId(companyStore.currentCompanyId)
  if (res.code === 200) {
    departments.value = res.data
    updateDepartmentAndPositionNames()
  }
}

async function fetchPositions() {
  const res = await positionApi.getByCompanyId(companyStore.currentCompanyId)
  if (res.code === 200) {
    positions.value = res.data
    updateDepartmentAndPositionNames()
  }
}

async function fetchRoles() {
  const res = await roleApi.getByCompanyId(companyStore.currentCompanyId)
  if (res.code === 200) {
    roles.value = res.data
  }
}

function updateDepartmentAndPositionNames() {
  tableData.value.forEach(item => {
    const dept = departments.value.find(d => d.id === item.departmentId)
    item.departmentName = dept ? dept.name : ''
    
    const pos = positions.value.find(p => p.id === item.positionId)
    item.positionName = pos ? pos.name : ''
  })
}

function handleSearch() {
  pageNum.value = 1
  fetchData()
}

function handleReset() {
  searchForm.realName = ''
  handleSearch()
}

function handlePageChange(val) {
  pageNum.value = val
  fetchData()
}

function handleAdd() {
  editForm.id = null
  editForm.username = ''
  editForm.password = ''
  editForm.realName = ''
  editForm.departmentId = 0
  editForm.positionId = 0
  editForm.phone = ''
  editForm.email = ''
  showAddModal.value = true
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.username = row.username
  editForm.password = ''
  editForm.realName = row.realName
  editForm.departmentId = row.departmentId || 0
  editForm.positionId = row.positionId || 0
  editForm.phone = row.phone
  editForm.email = row.email
  showAddModal.value = true
}

async function handleSave() {
  if (!editForm.username || !editForm.realName) {
    ElMessage.warning('请填写用户名和真实姓名')
    return
  }
  
  if (!editForm.id && !editForm.password) {
    ElMessage.warning('请设置初始密码')
    return
  }
  
  const data = { ...editForm }
  if (data.departmentId === 0) data.departmentId = null
  if (data.positionId === 0) data.positionId = null
  
  let res
  if (editForm.id) {
    res = await employeeApi.update(editForm.id, data)
  } else {
    res = await employeeApi.create({ ...data, companyId: companyStore.currentCompanyId })
  }
  
  if (res.code === 200) {
    ElMessage.success(res.message)
    showAddModal.value = false
    fetchData()
  } else {
    ElMessage.error(res.message)
  }
}

function handleAssignRoles(row) {
  currentEmployeeId.value = row.id
  roleForm.roleIds = []
  
  employeeApi.getRoles(row.id).then(res => {
    if (res.code === 200) {
      roleForm.roleIds = res.data.map(r => r.id)
    }
  })
  
  showRoleModal.value = true
}

async function handleSaveRoles() {
  const res = await employeeApi.assignRoles(currentEmployeeId.value, roleForm.roleIds)
  if (res.code === 200) {
    ElMessage.success(res.message)
    showRoleModal.value = false
  } else {
    ElMessage.error(res.message)
  }
}

function handleUploadAvatar(row) {
  currentEmployeeId.value = row.id
  avatarForm.imageUrl = row.avatar || ''
  showAvatarModal.value = true
}

async function handleAvatarUploadSuccess(response) {
  if (response.code === 200) {
    const avatarUrl = response.data.url
    await employeeApi.update(currentEmployeeId.value, { avatar: avatarUrl })
    ElMessage.success('头像上传成功')
    
    const employee = tableData.value.find(e => e.id === currentEmployeeId.value)
    if (employee) {
      employee.avatar = avatarUrl
    }
    
    showAvatarModal.value = false
  } else {
    ElMessage.error(response.message)
  }
}

function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

async function handleToggleStatus(row) {
  const res = await employeeApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('状态已更新')
  } else {
    ElMessage.error(res.message)
  }
}

async function handleDelete(row) {
  const confirm = await ElMessage.confirm('确定要删除该员工吗？', '提示', {
    type: 'warning'
  })
  if (confirm) {
    const res = await employeeApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchData()
    } else {
      ElMessage.error(res.message)
    }
  }
}

async function handleExport() {
  const res = await employeeApi.export(companyStore.currentCompanyId)
  downloadFile(res, '员工列表.xlsx')
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
}

.search-input {
  width: 300px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.no-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f4fd;
  color: #1890ff;
  font-size: 16px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #1890ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c8c8c;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar-preview {
  width: 178px;
  height: 178px;
  display: block;
}
</style>