<template>
  <view class="page-container">
    <view class="header">
      <view class="header-content">
        <text class="header-title">物品清单</text>
        <text class="header-subtitle">{{ filteredItems.length }} 件物品</text>
      </view>
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索物品名称或备注" 
          v-model="searchKeyword"
          @input="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tags">
          <view 
            v-for="cat in categories" 
            :key="cat.value"
            :class="['filter-tag', { active: currentCategory === cat.value }]"
            @click="selectCategory(cat.value)"
          >
            {{ cat.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ filteredItems.length }}</text>
        <text class="stat-label">全部</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value active">{{ filteredItems.filter(i => !i.completed).length }}</text>
        <text class="stat-label">待完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value completed">{{ completedCount }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value signed">{{ signedCount }}</text>
        <text class="stat-label">已签字</text>
      </view>
      <view v-if="completedCount > 0" class="clear-btn" @click="clearCompleted">
        清空已完成
      </view>
    </view>

    <scroll-view scroll-y class="list-container">
      <view v-if="filteredItems.length === 0" class="empty-state">
        <view class="empty-icon-wrapper">
          <text class="empty-icon">📋</text>
        </view>
        <text class="empty-text">暂无物品</text>
        <text class="empty-hint">点击下方按钮添加新物品</text>
      </view>

      <view 
        v-for="(item, index) in filteredItems" 
        :key="item.id" 
        :class="['item-card', { signed: item.signed }]"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="editItem(item)"
      >
        <view class="item-left">
          <view 
            :class="['checkbox', { checked: item.completed }]"
            @click.stop="toggleComplete(item)"
          >
            <text v-if="item.completed" class="check-icon">✓</text>
          </view>
          <view :class="['item-content', { completed: item.completed }]">
            <view class="item-header">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-quantity">×{{ item.quantity }}</text>
              <view v-if="item.signed" class="signed-badge">
                <text class="badge-icon">✓</text>
                <text class="badge-text">已签字</text>
              </view>
              <view v-else class="unsigned-badge">
                <text class="badge-icon">○</text>
                <text class="badge-text">待签字</text>
              </view>
            </view>
            <view class="item-meta">
              <view :class="['category-badge', item.category]">
                {{ getCategoryLabel(item.category) }}
              </view>
              <text v-if="item.remark" class="item-remark">{{ item.remark }}</text>
            </view>
          </view>
        </view>
        <view class="item-actions">
          <view v-if="!item.signed" class="action-btn sign" @click.stop="openSignature(item)">
            <text class="action-icon">✍️</text>
          </view>
          <view v-else class="action-btn records" @click.stop="openRecords(item)">
            <text class="action-icon">📝</text>
          </view>
          <view class="action-btn edit" @click.stop="editItem(item)">
            <text class="action-icon">✏️</text>
          </view>
          <view class="action-btn delete" @click.stop="deleteItem(item)">
            <text class="action-icon">🗑️</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="fab-button" @click="addItem">
      <text class="fab-icon">+</text>
      <view class="fab-ripple"></view>
    </view>

    <view v-if="showSignature" class="signature-overlay">
      <SignaturePad 
        @close="closeSignature" 
        @save="handleSignatureSave"
      />
    </view>

    <view v-if="showRecords" class="records-overlay">
      <SignatureRecord 
        :records="currentRecords" 
        @close="closeRecords" 
      />
    </view>

    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑物品' : '新增物品' }}</text>
          <view class="modal-close" @click="closeModal">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">物品名称</text>
            <view class="form-input-wrapper">
              <text class="input-prefix">📦</text>
              <input 
                class="form-input" 
                type="text" 
                placeholder="请输入物品名称" 
                v-model="formData.name"
              />
              <text v-if="formData.name" class="required-mark">*</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">数量</text>
            <view class="form-input-wrapper">
              <text class="input-prefix">🔢</text>
              <input 
                class="form-input" 
                type="number" 
                placeholder="请输入数量" 
                v-model="formData.quantity"
              />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">分类</text>
            <view class="category-picker">
              <view 
                v-for="cat in categories.slice(1)" 
                :key="cat.value"
                :class="['category-option', { active: formData.category === cat.value }]"
                @click="formData.category = cat.value"
              >
                {{ cat.label }}
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <view class="form-textarea-wrapper">
              <textarea 
                class="form-textarea" 
                placeholder="添加备注信息（可选）" 
                v-model="formData.remark"
                :maxlength="200"
              />
              <text class="textarea-count">{{ formData.remark.length }}/200</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="closeModal">取消</view>
          <view class="btn-confirm" @click="saveItem">
            <text>{{ isEdit ? '保存修改' : '添加物品' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import type { Item } from '@/utils/itemStorage'
import { 
  getItems, 
  addItem, 
  updateItem, 
  deleteItem, 
  toggleComplete, 
  filterItemsByCategory, 
  searchItems, 
  clearCompleted as storageClearCompleted,
  validateItem,
  initMockItems,
  addSignature,
  getSignatureRecords
} from '@/utils/itemStorage'
import SignaturePad from '@/components/SignaturePad.vue'
import SignatureRecord from '@/components/SignatureRecord.vue'

const categories = [
  { label: '全部', value: '' },
  { label: '食品', value: 'food' },
  { label: '日用品', value: 'daily' },
  { label: '电子产品', value: 'electronics' },
  { label: '衣物', value: 'clothes' },
  { label: '其他', value: 'other' }
]

const items = ref<Item[]>([])
const searchKeyword = ref('')
const currentCategory = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const showSignature = ref(false)
const showRecords = ref(false)
const signingItemId = ref('')
const currentRecords = ref<{ signerName: string; signTime: string; signatureData: string }[]>([])

const formData = reactive({
  name: '',
  quantity: 1,
  category: '',
  remark: ''
})

const filteredItems = computed(() => {
  let result = [...items.value]
  
  if (currentCategory.value) {
    result = filterItemsByCategory(result, currentCategory.value)
  }
  
  if (searchKeyword.value) {
    result = searchItems(result, searchKeyword.value)
  }
  
  return result.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.signed !== b.signed) return a.signed ? 1 : -1
    return 0
  })
})

const completedCount = computed(() => {
  return items.value.filter(item => item.completed).length
})

const signedCount = computed(() => {
  return items.value.filter(item => item.signed).length
})

const getCategoryLabel = (value: string) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : '其他'
}

const handleSearch = () => {}

const clearSearch = () => {
  searchKeyword.value = ''
}

const selectCategory = (category: string) => {
  currentCategory.value = category
}

const toggleComplete = (item: Item) => {
  toggleComplete(item.id)
  loadItems()
}

const addItemHandler = () => {
  isEdit.value = false
  editingId.value = ''
  formData.name = ''
  formData.quantity = 1
  formData.category = ''
  formData.remark = ''
  showModal.value = true
}

const editItem = (item: Item) => {
  isEdit.value = true
  editingId.value = item.id
  formData.name = item.name
  formData.quantity = item.quantity
  formData.category = item.category
  formData.remark = item.remark
  showModal.value = true
}

const deleteItemHandler = (item: Item) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${item.name}」吗？`,
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        deleteItem(item.id)
        loadItems()
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

const closeModal = () => {
  showModal.value = false
}

const saveItem = () => {
  const validation = validateItem({
    name: formData.name,
    quantity: Number(formData.quantity) || 0,
    category: formData.category,
    remark: formData.remark
  })
  
  if (!validation.isValid) {
    uni.showToast({ title: validation.message, icon: 'none' })
    return
  }
  
  if (isEdit.value && editingId.value) {
    updateItem(editingId.value, {
      name: formData.name,
      quantity: Number(formData.quantity),
      category: formData.category,
      remark: formData.remark
    })
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    addItem({
      name: formData.name,
      quantity: Number(formData.quantity),
      category: formData.category,
      remark: formData.remark
    })
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
  
  loadItems()
  closeModal()
}

const clearCompleted = () => {
  uni.showModal({
    title: '确认清空',
    content: `确定要清空所有已完成的物品吗？（共 ${completedCount.value} 件）`,
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        storageClearCompleted()
        loadItems()
        uni.showToast({ title: '清空成功', icon: 'success' })
      }
    }
  })
}

const loadItems = () => {
  items.value = getItems()
}

const openSignature = (item: Item) => {
  signingItemId.value = item.id
  showSignature.value = true
  setTimeout(() => {
    uni.$emit('signatureInit')
  }, 100)
}

const closeSignature = () => {
  showSignature.value = false
}

const handleSignatureSave = (data: { signerName: string; signatureData: string }) => {
  addSignature(signingItemId.value, {
    signerName: data.signerName,
    signatureData: data.signatureData
  })
  loadItems()
  closeSignature()
  uni.showToast({ title: '签字成功', icon: 'success' })
}

const openRecords = (item: Item) => {
  currentRecords.value = getSignatureRecords(item.id)
  showRecords.value = true
}

const closeRecords = () => {
  showRecords.value = false
}

onMounted(() => {
  initMockItems()
  loadItems()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding-bottom: 140rpx;
}

.header {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%);
  padding: 48rpx 32rpx;
  padding-top: calc(48rpx + env(safe-area-inset-top));
  border-radius: 0 0 48rpx 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(129, 140, 248, 0.3);
}

.header-content {
  margin-bottom: 32rpx;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1e293b;
  background: transparent;
}

.clear-icon {
  font-size: 28rpx;
  color: #94a3b8;
  padding: 8rpx 12rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.filter-bar {
  background: #fff;
  padding: 24rpx 0;
  margin: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 36rpx;
  background: #f8fafc;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(129, 140, 248, 0.35);
  }
}

.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
  gap: 16rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
  
  &.active {
    color: #818cf8;
  }
  
  &.completed {
    color: #94a3b8;
  }
  
  &.signed {
    color: #10b981;
  }
}

.stat-label {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #e2e8f0;
  margin: 0 16rpx;
}

.clear-btn {
  font-size: 26rpx;
  color: #ef4444;
  padding: 16rpx 28rpx;
  background: #fef2f2;
  border-radius: 16rpx;
  font-weight: 500;
}

.list-container {
  height: calc(100vh - 560rpx);
  padding: 0 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #e0e7ff 0%, #e9d5ff 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #94a3b8;
}

.item-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.3s ease;
  border-left: 6rpx solid transparent;
  
  &.signed {
    border-left-color: #10b981;
    background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 30%);
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  }
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-left {
  display: flex;
  flex: 1;
  align-items: center;
}

.checkbox {
  width: 52rpx;
  height: 52rpx;
  border: 3rpx solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 28rpx;
  transition: all 0.3s ease;
  background: #fff;
  
  &.checked {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    border-color: transparent;
    box-shadow: 0 4rpx 16rpx rgba(129, 140, 248, 0.4);
  }
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.item-content {
  flex: 1;
  
  &.completed {
    .item-name {
      color: #94a3b8;
      text-decoration: line-through;
      text-decoration-thickness: 2rpx;
    }
    
    .category-badge {
      opacity: 0.5;
    }
    
    .item-remark {
      color: #cbd5e1;
    }
  }
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
  gap: 8rpx;
}

.item-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.item-quantity {
  font-size: 24rpx;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.signed-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.3);
}

.unsigned-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #fef3c7;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}

.badge-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
  
  .unsigned-badge & {
    color: #d97706;
  }
}

.badge-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
  
  .unsigned-badge & {
    color: #d97706;
  }
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.category-badge {
  font-size: 22rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  
  &.food {
    background: #fef3c7;
    color: #d97706;
  }
  
  &.daily {
    background: #dbeafe;
    color: #2563eb;
  }
  
  &.electronics {
    background: #dcfce7;
    color: #16a34a;
  }
  
  &.clothes {
    background: #fce7f3;
    color: #db2777;
  }
  
  &.other {
    background: #e2e8f0;
    color: #64748b;
  }
}

.item-remark {
  font-size: 24rpx;
  color: #64748b;
}

.item-actions {
  display: flex;
  gap: 12rpx;
  margin-left: 16rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.sign {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &.records {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &.edit {
    background: #eff6ff;
    
    &:active {
      background: #dbeafe;
    }
  }
  
  &.delete {
    background: #fef2f2;
    
    &:active {
      background: #fee2e2;
    }
  }
}

.action-icon {
  font-size: 28rpx;
}

.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 48rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(129, 140, 248, 0.45);
  z-index: 100;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:active {
    transform: scale(0.92);
  }
}

.fab-icon {
  font-size: 64rpx;
  color: #fff;
  font-weight: 300;
}

.fab-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 2s infinite;
}

@keyframes ripple {
  to {
    width: 200%;
    height: 200%;
    opacity: 0;
  }
}

.signature-overlay,
.records-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  max-width: 750rpx;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 28rpx;
  color: #64748b;
}

.modal-body {
  padding: 32rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16rpx;
}

.form-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 0 24rpx;
  transition: all 0.3s ease;
  
  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(129, 140, 248, 0.15);
    border: 2rpx solid #818cf8;
  }
}

.input-prefix {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #1e293b;
  background: transparent;
}

.required-mark {
  font-size: 24rpx;
  color: #818cf8;
  font-weight: 600;
}

.form-textarea-wrapper {
  position: relative;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #1e293b;
  box-sizing: border-box;
  transition: all 0.3s ease;
  
  &:focus {
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(129, 140, 248, 0.15);
    border: 2rpx solid #818cf8;
  }
}

.textarea-count {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.category-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.category-option {
  padding: 20rpx 32rpx;
  background: #f8fafc;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(129, 140, 248, 0.3);
  }
}

.modal-footer {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 20rpx;
  border-top: 1rpx solid #f1f5f9;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 28rpx;
  text-align: center;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f8fafc;
  color: #64748b;
  
  &:active {
    background: #f1f5f9;
  }
}

.btn-confirm {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(129, 140, 248, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
}
</style>