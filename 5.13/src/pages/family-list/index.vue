<template>
  <view class="page-container">
    <view class="main-header">
      <view class="header-content">
        <view class="title-wrapper">
          <text class="title-icon">👨‍👩‍👧‍👦</text>
          <text class="page-title">家庭成员管理</text>
        </view>
        <view class="header-actions">
          <view class="export-btn" @click="showExportModal = true">
            <text class="export-icon">📊</text>
            <text class="export-text">导出Excel</text>
          </view>
          <view class="add-btn" @click="showAddModal = true">
            <text class="add-icon">+</text>
            <text class="add-text">新增成员</text>
          </view>
        </view>
      </view>
    </view>

    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索姓名、身份证号、电话" 
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
      </view>
      <view class="filter-picker">
        <picker mode="selector" :range="headOptions" :range-key="'label'" @change="handleListHeadChange">
          <view class="picker-content">
            <text class="picker-label">{{ selectedHeadName || '选择户主' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <text class="section-title">🏠 家庭分组</text>
        <text class="section-desc">共 {{ familyGroups.length }} 户</text>
      </view>
      <view class="family-grid">
        <view class="family-card" v-for="group in familyGroups" :key="group.head.id">
          <view class="card-header-gradient">
            <view class="head-avatar">
              <text class="avatar-text">{{ group.head.name.charAt(0) }}</text>
            </view>
            <view class="head-meta">
              <text class="head-name">{{ group.head.name }}</text>
              <text class="head-role">户主</text>
            </view>
            <view class="member-count">
              <text class="count-number">{{ group.members.length }}</text>
              <text class="count-label">人</text>
            </view>
          </view>
          <view class="card-body">
            <view class="member-item" v-for="member in group.members" :key="member.id">
              <view class="member-info">
                <text class="member-name">{{ member.name }}</text>
                <text class="member-detail">{{ getGenderLabel(member.gender) }} · {{ member.age }}岁</text>
              </view>
              <view class="member-actions">
                <view class="action-btn edit" @click="handleEdit(member.id)">
                  <text class="btn-text">编辑</text>
                </view>
                <view class="action-btn delete" @click="handleDelete(member.id, member.name)">
                  <text class="btn-text">删除</text>
                </view>
              </view>
            </view>
          </view>
          <view class="card-footer">
            <view class="add-member-btn" @click="handleAddWithHead(group.head.id)">
              <text class="add-member-icon">+</text>
              <text class="add-member-text">添加成员</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <text class="section-title">📋 成员列表</text>
        <text class="section-desc">共 {{ total }} 人</text>
      </view>
      <view class="data-table">
        <view class="table-header">
          <view class="th">姓名</view>
          <view class="th">性别</view>
          <view class="th">年龄</view>
          <view class="th">关系</view>
          <view class="th">电话</view>
          <view class="th th-actions">操作</view>
        </view>
        <view class="table-body">
          <view class="table-row" v-for="member in currentList" :key="member.id">
            <view class="td">
              <text class="cell-text">{{ member.name }}</text>
              <text v-if="member.isHead === 1" class="head-tag">户主</text>
            </view>
            <view class="td">{{ getGenderLabel(member.gender) }}</view>
            <view class="td">{{ member.age }}</view>
            <view class="td">{{ getRelationLabel(member.relation) }}</view>
            <view class="td">{{ member.phone || '-' }}</view>
            <view class="td td-actions">
              <view class="table-action-btn edit" @click="handleEdit(member.id)">编辑</view>
              <view class="table-action-btn delete" @click="handleDelete(member.id, member.name)">删除</view>
            </view>
          </view>
        </view>
        <view v-if="currentList.length === 0" class="empty-state">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无数据</text>
        </view>
      </view>
    </view>

    <view class="pagination-bar" v-if="total > pageSize">
      <view class="pagination-btn" :class="{ disabled: pageNum <= 1 }" @click="handlePrev">
        <text class="pagination-icon">←</text>
        <text class="pagination-text">上一页</text>
      </view>
      <view class="pagination-info">
        <text class="current-page">{{ pageNum }}</text>
        <text class="page-separator">/</text>
        <text class="total-pages">{{ totalPages }}</text>
      </view>
      <view class="pagination-btn" :class="{ disabled: pageNum >= totalPages }" @click="handleNext">
        <text class="pagination-text">下一页</text>
        <text class="pagination-icon">→</text>
      </view>
    </view>

    <view v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
      <view class="modal-container export-modal" @click.stop>
        <view class="modal-header">
          <view class="modal-title-wrapper">
            <text class="modal-icon">📊</text>
            <text class="modal-title">导出Excel</text>
          </view>
          <view class="modal-close-btn" @click="closeExportModal">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body export-body">
          <view class="export-options">
            <view class="export-option" @click="handleExport('current')">
              <view class="option-icon">📄</view>
              <view class="option-content">
                <text class="option-title">导出当前页</text>
                <text class="option-desc">导出当前分页显示的 {{ currentList.length }} 条数据</text>
              </view>
              <view class="option-arrow">→</view>
            </view>
            <view class="export-option" @click="handleExport('all')">
              <view class="option-icon">📋</view>
              <view class="option-content">
                <text class="option-title">导出全部</text>
                <text class="option-desc">导出全部 {{ total }} 条数据</text>
              </view>
              <view class="option-arrow">→</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeExportModal">取消</view>
        </view>
      </view>
    </view>

    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <view class="modal-title-wrapper">
            <text class="modal-icon">{{ isEdit ? '✏️' : '➕' }}</text>
            <text class="modal-title">{{ isEdit ? '编辑成员' : '新增成员' }}</text>
          </view>
          <view class="modal-close-btn" @click="closeModal">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="form-group">
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">姓名</text>
                <text class="required-mark">*</text>
              </view>
              <input 
                class="form-input" 
                placeholder="请输入姓名" 
                v-model="form.name"
                :class="{ error: errors.name }"
              />
              <view v-if="errors.name" class="error-message">{{ errors.name }}</view>
            </view>

            <view class="form-row">
              <view class="form-item half">
                <view class="form-label">
                  <text class="label-text">性别</text>
                  <text class="required-mark">*</text>
                </view>
                <picker mode="selector" :range="genderOptions" @change="handleGenderChange">
                  <view class="form-picker" :class="{ error: errors.gender }">
                    <text class="picker-value">{{ getGenderLabel(form.gender) || '请选择' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
                <view v-if="errors.gender" class="error-message">{{ errors.gender }}</view>
              </view>
              <view class="form-item half">
                <view class="form-label">
                  <text class="label-text">年龄</text>
                  <text class="required-mark">*</text>
                </view>
                <input 
                  class="form-input" 
                  type="number"
                  placeholder="请输入年龄" 
                  v-model="form.age"
                  :class="{ error: errors.age }"
                />
                <view v-if="errors.age" class="error-message">{{ errors.age }}</view>
              </view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">身份证号</text>
                <text class="required-mark">*</text>
              </view>
              <input 
                class="form-input" 
                placeholder="请输入18位身份证号" 
                v-model="form.idCard"
                :class="{ error: errors.idCard }"
              />
              <view v-if="errors.idCard" class="error-message">{{ errors.idCard }}</view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">联系电话</text>
                <text class="required-mark">*</text>
              </view>
              <input 
                class="form-input" 
                type="number"
                placeholder="请输入11位手机号" 
                v-model="form.phone"
                :class="{ error: errors.phone }"
              />
              <view v-if="errors.phone" class="error-message">{{ errors.phone }}</view>
            </view>

            <view class="form-row">
              <view class="form-item half">
                <view class="form-label">
                  <text class="label-text">民族</text>
                  <text class="required-mark">*</text>
                </view>
                <picker mode="selector" :range="nationOptions" :range-key="'label'" @change="handleNationChange">
                  <view class="form-picker" :class="{ error: errors.nation }">
                    <text class="picker-value">{{ getNationLabel(form.nation) || '请选择' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
                <view v-if="errors.nation" class="error-message">{{ errors.nation }}</view>
              </view>
              <view class="form-item half">
                <view class="form-label">
                  <text class="label-text">婚姻状况</text>
                  <text class="required-mark">*</text>
                </view>
                <picker mode="selector" :range="maritalOptions" :range-key="'label'" @change="handleMaritalChange">
                  <view class="form-picker" :class="{ error: errors.maritalStatus }">
                    <text class="picker-value">{{ getMaritalStatusLabel(form.maritalStatus) || '请选择' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
                <view v-if="errors.maritalStatus" class="error-message">{{ errors.maritalStatus }}</view>
              </view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">出生日期</text>
                <text class="required-mark">*</text>
              </view>
              <picker mode="date" :value="form.birthDate" @change="handleBirthDateChange">
                <view class="form-picker" :class="{ error: errors.birthDate }">
                  <text class="picker-value">{{ form.birthDate || '请选择日期' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
              <view v-if="errors.birthDate" class="error-message">{{ errors.birthDate }}</view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">与户主关系</text>
                <text class="required-mark">*</text>
              </view>
              <picker mode="selector" :range="relationOptions" :range-key="'label'" @change="handleRelationChange">
                <view class="form-picker" :class="{ error: errors.relation }">
                  <text class="picker-value">{{ getRelationLabel(form.relation) || '请选择' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
              <view v-if="errors.relation" class="error-message">{{ errors.relation }}</view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">关联户主</text>
              </view>
              <picker mode="selector" :range="headOptionsForModal" :range-key="'label'" @change="handleHeadChange">
                <view class="form-picker">
                  <text class="picker-value">{{ selectedHeadNameInForm || '无（作为新户主）' }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">是否户主</text>
              </view>
              <view class="switch-group">
                <view 
                  class="switch-option" 
                  :class="{ active: form.isHead === 1 }"
                  @click="form.isHead = 1"
                >
                  <text class="switch-text">是</text>
                </view>
                <view 
                  class="switch-option" 
                  :class="{ active: form.isHead === 0 }"
                  @click="form.isHead = 0"
                >
                  <text class="switch-text">否</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <view class="form-label">
                <text class="label-text">住址</text>
                <text class="required-mark">*</text>
              </view>
              <textarea 
                class="form-textarea" 
                placeholder="请输入详细住址" 
                v-model="form.address"
                :class="{ error: errors.address }"
              />
              <view v-if="errors.address" class="error-message">{{ errors.address }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeModal">取消</view>
          <view class="modal-btn confirm" @click="handleSave">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '../../stores/family'
import { 
  type Gender, 
  type MaritalStatus, 
  type Relation, 
  type Nation,
  type FamilyMemberForm,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
  NATION_OPTIONS,
  getGenderLabel,
  getMaritalStatusLabel,
  getRelationLabel,
  getNationLabel,
  validateIdCard,
  validatePhone
} from '../../types/family'

const familyStore = useFamilyStore()

const searchKeyword = ref('')
const selectedHeadId = ref<string | undefined>()
const pageNum = ref(1)
const pageSize = ref(10)

const showModal = ref(false)
const isEdit = ref(false)
const showExportModal = ref(false)

const form = ref<FamilyMemberForm>({
  name: '',
  gender: 1,
  age: 0,
  idCard: '',
  relation: 'self',
  phone: '',
  nation: 'han',
  address: '',
  birthDate: '',
  maritalStatus: 1,
  headId: null,
  isHead: 0
})

const errors = ref<Record<string, string>>({})

const genderOptions = ['男', '女']
const maritalOptions = computed(() => MARITAL_STATUS_OPTIONS)
const relationOptions = computed(() => RELATION_OPTIONS)
const nationOptions = computed(() => NATION_OPTIONS)

const headOptions = computed(() => {
  return [{ id: '', label: '选择户主' }, ...familyStore.heads.map(h => ({ id: h.id, label: h.name }))]
})

const headOptionsForModal = computed(() => {
  return [{ id: '', label: '无（作为新户主）' }, ...familyStore.heads.map(h => ({ id: h.id, label: h.name }))]
})

const selectedHeadName = computed(() => {
  if (!selectedHeadId.value) return ''
  const head = familyStore.heads.find(h => h.id === selectedHeadId.value)
  return head?.name || ''
})

const selectedHeadNameInForm = computed(() => {
  if (!form.value.headId) return ''
  const head = familyStore.heads.find(h => h.id === form.value.headId)
  return head?.name || ''
})

const familyGroups = computed(() => familyStore.familyGroups)

const currentList = computed(() => {
  return familyStore.list({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value,
    headId: selectedHeadId.value
  }).list
})

const total = computed(() => familyStore.total)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

function handleSearch() {
  pageNum.value = 1
}

function handleHeadChange(e: { detail: { value: number } }) {
  const selected = headOptionsForModal.value[e.detail.value]
  form.value.headId = selected.id || null
  if (form.value.headId) {
    form.value.isHead = 0
  }
}

function handleListHeadChange(e: { detail: { value: number } }) {
  const index = e.detail.value
  const selected = headOptions.value[index]
  selectedHeadId.value = selected.id || undefined
  pageNum.value = 1
}

function handlePrev() {
  if (pageNum.value > 1) {
    pageNum.value--
  }
}

function handleNext() {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
  }
}

function resetForm() {
  form.value = {
    name: '',
    gender: 1,
    age: 0,
    idCard: '',
    relation: 'self',
    phone: '',
    nation: 'han',
    address: '',
    birthDate: '',
    maritalStatus: 1,
    headId: null,
    isHead: 0
  }
  errors.value = {}
}

function handleAddWithHead(headId: string) {
  resetForm()
  form.value.headId = headId
  form.value.isHead = 0
  isEdit.value = false
  showModal.value = true
}

function handleEdit(id: string) {
  resetForm()
  const member = familyStore.getById(id)
  if (member) {
    form.value = {
      id: member.id,
      name: member.name,
      gender: member.gender,
      age: member.age,
      idCard: member.idCard,
      relation: member.relation,
      phone: member.phone,
      nation: member.nation,
      address: member.address,
      birthDate: member.birthDate,
      maritalStatus: member.maritalStatus,
      headId: member.headId,
      isHead: member.isHead
    }
  }
  isEdit.value = true
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function closeExportModal() {
  showExportModal.value = false
}

function handleExport(type: 'current' | 'all') {
  closeExportModal()
  uni.showLoading({ title: '导出中...' })
  
  const params: Record<string, string | number> = {
    keyword: searchKeyword.value || '',
    headId: selectedHeadId.value || ''
  }
  
  if (type === 'current') {
    params.pageNum = pageNum.value
    params.pageSize = pageSize.value
  }
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: type === 'current' ? '当前页导出成功' : '全部导出成功',
      icon: 'success'
    })
  }, 1500)
}

function handleGenderChange(e: { detail: { value: number } }) {
  form.value.gender = (e.detail.value + 1) as Gender
}

function handleMaritalChange(e: { detail: { value: number } }) {
  form.value.maritalStatus = (e.detail.value + 1) as MaritalStatus
}

function handleRelationChange(e: { detail: { value: number } }) {
  form.value.relation = RELATION_OPTIONS[e.detail.value].value
}

function handleNationChange(e: { detail: { value: number } }) {
  form.value.nation = NATION_OPTIONS[e.detail.value].value
}

function handleBirthDateChange(e: { detail: { value: string } }) {
  form.value.birthDate = e.detail.value
}

function validate(): boolean {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = '请输入姓名'
  }
  
  if (!form.value.gender || (form.value.gender !== 1 && form.value.gender !== 2)) {
    errors.value.gender = '请选择性别'
  }
  
  if (!form.value.age || form.value.age < 1 || form.value.age > 150) {
    errors.value.age = '年龄必须在1-150之间'
  }
  
  if (!form.value.idCard.trim()) {
    errors.value.idCard = '请输入身份证号'
  } else if (!validateIdCard(form.value.idCard)) {
    errors.value.idCard = '请输入有效的身份证号'
  }
  
  if (!form.value.phone.trim()) {
    errors.value.phone = '请输入联系电话'
  } else if (!validatePhone(form.value.phone)) {
    errors.value.phone = '请输入有效的手机号'
  }
  
  if (!form.value.nation) {
    errors.value.nation = '请选择民族'
  }
  
  if (!form.value.maritalStatus || form.value.maritalStatus < 1 || form.value.maritalStatus > 4) {
    errors.value.maritalStatus = '请选择婚姻状况'
  }
  
  if (!form.value.birthDate) {
    errors.value.birthDate = '请选择出生日期'
  }
  
  if (!form.value.relation) {
    errors.value.relation = '请选择与户主关系'
  }
  
  if (!form.value.address.trim()) {
    errors.value.address = '请输入住址'
  }
  
  if (form.value.isHead === 1) {
    form.value.headId = null
    form.value.relation = 'self'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSave() {
  if (!validate()) {
    return
  }
  
  try {
    familyStore.save(form.value)
    uni.showToast({ 
      title: isEdit.value ? '修改成功' : '添加成功', 
      icon: 'success' 
    })
    closeModal()
    pageNum.value = 1
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}

function handleDelete(id: string, name: string) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除成员「${name}」吗？`,
    success: (res) => {
      if (res.confirm) {
        familyStore.deleteById(id)
        uni.showToast({ title: '删除成功', icon: 'success' })
        if (currentList.value.length === 0 && pageNum.value > 1) {
          pageNum.value--
        }
      }
    }
  })
}

onMounted(() => {
  familyStore.list({ pageNum: 1, pageSize: 10 })
})
</script>

<style lang="scss">
:root {
  --primary-color: #4f6dff;
  --primary-light: #e8edff;
  --primary-dark: #3d5ae8;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --danger-color: #ff4d4f;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border-color: #e5e7eb;
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --bg-page: #f9fafb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 8rpx;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding-bottom: 60rpx;
}

.main-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 40rpx 32rpx;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-lg);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .title-wrapper {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .title-icon {
    font-size: 44rpx;
  }
  
  .page-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #ffffff;
  }
  
  .header-actions {
    display: flex;
    gap: 16rpx;
  }
  
  .export-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 16rpx 24rpx;
    border-radius: var(--radius-lg);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    
    &:active {
      background-color: rgba(255, 255, 255, 0.25);
      transform: scale(0.98);
    }
    
    .export-icon {
      font-size: 28rpx;
    }
    
    .export-text {
      font-size: 26rpx;
      color: #ffffff;
      font-weight: 500;
    }
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 16rpx 28rpx;
    border-radius: var(--radius-lg);
    transition: all 0.3s ease;
    
    &:active {
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(0.98);
    }
    
    .add-icon {
      font-size: 32rpx;
      color: #ffffff;
      font-weight: 600;
    }
    
    .add-text {
      font-size: 28rpx;
      color: #ffffff;
      font-weight: 500;
    }
  }
}

.search-bar {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  margin-top: -30rpx;
  
  .search-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: var(--bg-primary);
    padding: 0 24rpx;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    
    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: var(--text-primary);
    }
  }
  
  .filter-picker {
    background-color: var(--bg-primary);
    padding: 0 24rpx;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    height: 80rpx;
    display: flex;
    align-items: center;
    min-width: 180rpx;
    
    .picker-content {
      display: flex;
      align-items: center;
      gap: 8rpx;
    }
    
    .picker-label {
      font-size: 28rpx;
      color: var(--text-secondary);
    }
    
    .picker-arrow {
      font-size: 20rpx;
      color: var(--text-muted);
    }
  }
}

.section-card {
  margin: 24rpx 32rpx;
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 28rpx;
    border-bottom: 1rpx solid var(--border-color);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .section-desc {
      font-size: 24rpx;
      color: var(--text-muted);
    }
  }
}

.family-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.family-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  
  .card-header-gradient {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .head-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
      
      .avatar-text {
        font-size: 32rpx;
        color: #ffffff;
        font-weight: 700;
      }
    }
    
    .head-meta {
      flex: 1;
      
      .head-name {
        display: block;
        font-size: 30rpx;
        color: #ffffff;
        font-weight: 600;
      }
      
      .head-role {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .member-count {
      text-align: center;
      
      .count-number {
        display: block;
        font-size: 36rpx;
        color: #ffffff;
        font-weight: 700;
      }
      
      .count-label {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  .card-body {
    padding: 16rpx 24rpx;
  }
  
  .member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
    
    &:last-child {
      border-bottom: none;
    }
    
    .member-info {
      .member-name {
        display: block;
        font-size: 28rpx;
        color: var(--text-primary);
        font-weight: 500;
      }
      
      .member-detail {
        font-size: 22rpx;
        color: var(--text-muted);
        margin-top: 4rpx;
      }
    }
    
    .member-actions {
      display: flex;
      gap: 12rpx;
    }
    
    .action-btn {
      padding: 8rpx 20rpx;
      border-radius: var(--radius-sm);
      font-size: 22rpx;
      
      &.edit {
        background-color: var(--primary-light);
        color: var(--primary-color);
      }
      
      &.delete {
        background-color: rgba(255, 77, 79, 0.1);
        color: var(--danger-color);
      }
    }
  }
  
  .card-footer {
    padding: 16rpx 24rpx;
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    
    .add-member-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 16rpx;
      background-color: var(--bg-primary);
      border-radius: var(--radius-md);
      
      .add-member-icon {
        font-size: 28rpx;
        color: var(--primary-color);
      }
      
      .add-member-text {
        font-size: 26rpx;
        color: var(--text-secondary);
      }
    }
  }
}

.data-table {
  overflow: hidden;
  
  .table-header {
    display: flex;
    background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
    padding: 20rpx 24rpx;
    
    .th {
      flex: 1;
      font-size: 24rpx;
      color: var(--text-muted);
      text-align: center;
      font-weight: 500;
      
      &.th-actions {
        flex: 1.5;
      }
    }
  }
  
  .table-body {
    .table-row {
      display: flex;
      align-items: center;
      padding: 20rpx 24rpx;
      border-bottom: 1rpx solid var(--border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background-color: var(--bg-secondary);
      }
      
      .td {
        flex: 1;
        font-size: 26rpx;
        color: var(--text-primary);
        text-align: center;
        position: relative;
        
        &.td-actions {
          flex: 1.5;
          display: flex;
          justify-content: center;
          gap: 16rpx;
        }
        
        .cell-text {
          display: inline-block;
          max-width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .head-tag {
          position: absolute;
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--danger-color);
          color: #ffffff;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: var(--radius-sm);
        }
      }
    }
  }
  
  .table-action-btn {
    padding: 8rpx 20rpx;
    border-radius: var(--radius-sm);
    font-size: 22rpx;
    
    &.edit {
      background-color: var(--primary-light);
      color: var(--primary-color);
    }
    
    &.delete {
      background-color: rgba(255, 77, 79, 0.1);
      color: var(--danger-color);
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx;
    
    .empty-icon {
      font-size: 64rpx;
      margin-bottom: 16rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: var(--text-muted);
    }
  }
}

.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  padding: 32rpx;
  
  .pagination-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 28rpx;
    background-color: var(--bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    
    &:active:not(.disabled) {
      transform: scale(0.96);
      background-color: var(--bg-secondary);
    }
    
    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    
    .pagination-icon {
      font-size: 24rpx;
      color: var(--text-secondary);
    }
    
    .pagination-text {
      font-size: 26rpx;
      color: var(--text-secondary);
    }
  }
  
  .pagination-info {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    
    .current-page {
      font-size: 32rpx;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .page-separator {
      font-size: 24rpx;
      color: var(--text-muted);
    }
    
    .total-pages {
      font-size: 24rpx;
      color: var(--text-muted);
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 700rpx;
  max-height: 90vh;
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--border-color);
  
  .modal-title-wrapper {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .modal-icon {
    font-size: 32rpx;
  }
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .modal-close-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--bg-secondary);
    
    &:active {
      background-color: var(--border-color);
    }
    
    .close-icon {
      font-size: 28rpx;
      color: var(--text-muted);
    }
  }
}

.modal-body {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.export-modal {
  max-width: 600rpx;
}

.export-body {
  padding: 32rpx;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.export-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  
  &:active {
    background-color: var(--border-color);
    transform: scale(0.98);
  }
  
  .option-icon {
    font-size: 40rpx;
    margin-right: 20rpx;
  }
  
  .option-content {
    flex: 1;
    
    .option-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .option-desc {
      font-size: 24rpx;
      color: var(--text-muted);
      margin-top: 6rpx;
    }
  }
  
  .option-arrow {
    font-size: 28rpx;
    color: var(--text-muted);
  }
}

.form-group {
  .form-item {
    margin-bottom: 28rpx;
    
    &.half {
      flex: 1;
    }
  }
  
  .form-row {
    display: flex;
    gap: 20rpx;
  }
  
  .form-label {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    
    .label-text {
      font-size: 28rpx;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .required-mark {
      font-size: 24rpx;
      color: var(--danger-color);
      margin-left: 8rpx;
    }
  }
  
  .form-input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    border: 2rpx solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 28rpx;
    background-color: var(--bg-primary);
    transition: all 0.2s ease;
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4rpx var(--primary-light);
    }
    
    &.error {
      border-color: var(--danger-color);
    }
  }
  
  .form-textarea {
    width: 100%;
    height: 160rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 28rpx;
    background-color: var(--bg-primary);
    transition: all 0.2s ease;
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4rpx var(--primary-light);
    }
    
    &.error {
      border-color: var(--danger-color);
    }
  }
  
  .form-picker {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    border: 2rpx solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 28rpx;
    background-color: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
    
    &:active {
      border-color: var(--primary-color);
    }
    
    &.error {
      border-color: var(--danger-color);
    }
    
    .picker-value {
      color: var(--text-primary);
    }
    
    .picker-arrow {
      font-size: 20rpx;
      color: var(--text-muted);
    }
  }
  
  .error-message {
    font-size: 24rpx;
    color: var(--danger-color);
    margin-top: 8rpx;
  }
  
  .switch-group {
    display: flex;
    gap: 16rpx;
    
    .switch-option {
      flex: 1;
      height: 72rpx;
      border: 2rpx solid var(--border-color);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &.active {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        
        .switch-text {
          color: #ffffff;
        }
      }
      
      .switch-text {
        font-size: 28rpx;
        color: var(--text-secondary);
        font-weight: 500;
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid var(--border-color);
  
  .modal-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-size: 30rpx;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.cancel {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
    }
    
    &.confirm {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: #ffffff;
    }
  }
}</style>