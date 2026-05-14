<template>
  <view class="container">
    <view class="role-tips" v-if="store.currentUser.role !== 'admin'">
      <text class="tips-icon">💡</text>
      <text class="tips-text">您没有库存管理权限</text>
    </view>

    <view v-if="store.currentUser.role === 'admin'" class="stock-content">
      <view class="header">
        <view class="category-tabs">
          <view 
            v-for="cat in categoryOptions" 
            :key="cat.value"
            class="category-tab"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectedCategory = cat.value"
          >
            <text class="cat-icon">{{ cat.icon }}</text>
            <text>{{ cat.label }}</text>
          </view>
        </view>
        <view class="search-bar">
          <input 
            type="text" 
            v-model="keyword" 
            placeholder="搜索物品名称"
            class="search-input"
          />
          <view class="search-btn" @click="handleSearch">
            <text class="search-icon">🔍</text>
          </view>
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-value">{{ store.supplyItems.length }}</text>
          <text class="stat-label">物品种类</text>
        </view>
        <view class="stat-card warning" v-if="store.lowStockItems.length > 0">
          <text class="stat-value">{{ store.lowStockItems.length }}</text>
          <text class="stat-label">库存不足</text>
        </view>
      </view>

      <view class="add-btn" @click="showAddModal = true">
        <text class="add-icon">+</text>
        <text>新增物品</text>
      </view>

      <scroll-view scroll-y class="list-container">
        <view v-if="filteredItems.length === 0" class="empty-state">
          <text class="empty-icon">📦</text>
          <text class="empty-text">暂无物品记录</text>
        </view>
        
        <view 
          v-for="item in filteredItems" 
          :key="item.id" 
          class="stock-card"
        >
          <view class="card-header">
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">{{ item.spec }}</text>
            </view>
            <view 
              class="stock-status" 
              :class="{ warning: item.stock <= item.minStock }"
            >
              <text>{{ item.stock <= item.minStock ? '库存不足' : '库存充足' }}</text>
            </view>
          </view>
          
          <view class="card-body">
            <view class="info-row">
              <text class="label">分类：</text>
              <text class="value">{{ getCategoryLabel(item.category) }}</text>
            </view>
            <view class="info-row">
              <text class="label">单位：</text>
              <text class="value">{{ item.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">现有库存：</text>
              <text class="value" :class="{ warning: item.stock <= item.minStock }">{{ item.stock }}{{ item.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">最低库存：</text>
              <text class="value">{{ item.minStock }}{{ item.unit }}</text>
            </view>
            <view class="stock-bar">
              <view 
                class="stock-fill" 
                :style="{ width: getStockPercent(item) + '%' }"
                :class="{ warning: item.stock <= item.minStock }"
              ></view>
            </view>
          </view>
          
          <view class="card-footer">
            <view class="action-btn edit" @click="showEditModal(item)">
              <text>编辑</text>
            </view>
            <view class="action-btn delete" @click="handleDelete(item)">
              <text>删除</text>
            </view>
            <view class="action-btn add-stock" @click="showStockModal(item)">
              <text>入库</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view 
      class="modal-mask" 
      v-if="showAddModal || showEditModalState || showStockModalState" 
      @click="closeModals"
    >
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ modalTitle }}</text>
          <view class="modal-close" @click="closeModals">✕</view>
        </view>
        <view class="modal-body">
          <view class="modal-form-item" v-if="!isStockModal">
            <text class="modal-label">物品名称 *</text>
            <input 
              type="text" 
              v-model="formData.name" 
              class="modal-input"
              placeholder="请输入物品名称"
            />
          </view>
          <view class="modal-form-item" v-if="!isStockModal">
            <text class="modal-label">规格型号 *</text>
            <input 
              type="text" 
              v-model="formData.spec" 
              class="modal-input"
              placeholder="请输入规格型号"
            />
          </view>
          <view class="modal-form-item" v-if="!isStockModal">
            <text class="modal-label">分类 *</text>
            <view class="picker-btn" @click="showCategoryPicker = true">
              <text v-if="formData.category">{{ getCategoryLabel(formData.category) }}</text>
              <text v-else class="placeholder">请选择分类</text>
            </view>
          </view>
          <view class="modal-form-item" v-if="!isStockModal">
            <text class="modal-label">单位 *</text>
            <view class="picker-btn" @click="showUnitPicker = true">
              <text v-if="formData.unit">{{ formData.unit }}</text>
              <text v-else class="placeholder">请选择单位</text>
            </view>
          </view>
          <view class="modal-form-item">
            <text class="modal-label">{{ isStockModal ? '入库数量' : '现有库存' }} *</text>
            <input 
              type="number" 
              v-model="formData.stock" 
              class="modal-input"
              placeholder="请输入数量"
            />
          </view>
          <view class="modal-form-item" v-if="!isStockModal">
            <text class="modal-label">最低库存 *</text>
            <input 
              type="number" 
              v-model="formData.minStock" 
              class="modal-input"
              placeholder="请输入最低库存"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeModals">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleSubmit">
            <text>{{ isStockModal ? '确认入库' : '保存' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view 
      class="picker-mask" 
      v-if="showUnitPicker" 
      @click="showUnitPicker = false"
    >
      <view class="picker-container" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择单位</text>
          <view class="picker-close" @click="showUnitPicker = false">✕</view>
        </view>
        <scroll-view scroll-y class="picker-list">
          <view 
            v-for="unit in unitOptions" 
            :key="unit.value"
            class="picker-item"
            :class="{ active: formData.unit === unit.value }"
            @click="selectUnit(unit.value)"
          >
            <text>{{ unit.label }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view 
      class="picker-mask" 
      v-if="showCategoryPicker" 
      @click="showCategoryPicker = false"
    >
      <view class="picker-container" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择分类</text>
          <view class="picker-close" @click="showCategoryPicker = false">✕</view>
        </view>
        <scroll-view scroll-y class="picker-list">
          <view 
            v-for="cat in categoryOptions" 
            :key="cat.value"
            class="picker-item"
            :class="{ active: formData.category === cat.value }"
            @click="selectCategory(cat.value)"
          >
            <text class="cat-icon">{{ cat.icon }}</text>
            <text>{{ cat.label }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { SUPPLY_UNIT_OPTIONS, SUPPLY_CATEGORY_OPTIONS, getSupplyCategoryLabel } from '@/types/supplies'
import type { SupplyItem, SupplyUnit, SupplyCategory } from '@/types/supplies'

const store = useSuppliesStore()
const keyword = ref('')
const selectedCategory = ref<SupplyCategory | ''>('')
const showAddModal = ref(false)
const showEditModalState = ref(false)
const showStockModalState = ref(false)
const showUnitPicker = ref(false)
const showCategoryPicker = ref(false)
const currentItem = ref<SupplyItem | null>(null)

const formData = reactive({
  name: '',
  spec: '',
  category: '',
  unit: '',
  stock: '',
  minStock: ''
})

const unitOptions = SUPPLY_UNIT_OPTIONS
const categoryOptions = SUPPLY_CATEGORY_OPTIONS

const isStockModal = computed(() => showStockModalState.value)

const modalTitle = computed(() => {
  if (showAddModal.value) return '新增物品'
  if (showEditModalState.value) return '编辑物品'
  if (showStockModalState.value) return '入库管理'
  return ''
})

const filteredItems = computed(() => {
  return store.searchSupplyItems(keyword.value, selectedCategory.value || undefined)
})

function getCategoryLabel(category: string): string {
  return getSupplyCategoryLabel(category as SupplyCategory)
}

function getStockPercent(item: SupplyItem) {
  const max = Math.max(item.stock, item.minStock * 2)
  return (item.stock / max) * 100
}

function handleSearch() {
  filteredItems.value = store.searchSupplyItems(keyword.value, selectedCategory.value || undefined)
}

function showEditModal(item: SupplyItem) {
  currentItem.value = item
  formData.name = item.name
  formData.spec = item.spec
  formData.category = item.category
  formData.unit = item.unit
  formData.stock = item.stock.toString()
  formData.minStock = item.minStock.toString()
  showEditModalState.value = true
}

function showStockModal(item: SupplyItem) {
  currentItem.value = item
  formData.stock = '1'
  showStockModalState.value = true
}

function selectUnit(unit: SupplyUnit) {
  formData.unit = unit
  showUnitPicker.value = false
}

function selectCategory(category: SupplyCategory) {
  formData.category = category
  showCategoryPicker.value = false
}

function closeModals() {
  showAddModal.value = false
  showEditModalState.value = false
  showStockModalState.value = false
  showUnitPicker.value = false
  showCategoryPicker.value = false
  currentItem.value = null
  formData.name = ''
  formData.spec = ''
  formData.category = ''
  formData.unit = ''
  formData.stock = ''
  formData.minStock = ''
}

function handleSubmit() {
  if (isStockModal.value) {
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      uni.showToast({ title: '请输入入库数量', icon: 'none' })
      return
    }
    if (currentItem.value) {
      const newStock = currentItem.value.stock + parseInt(formData.stock)
      store.updateSupplyItem(currentItem.value.id, { stock: newStock })
      uni.showToast({ title: '入库成功', icon: 'success' })
    }
  } else {
    if (!formData.name.trim()) {
      uni.showToast({ title: '请输入物品名称', icon: 'none' })
      return
    }
    if (!formData.spec.trim()) {
      uni.showToast({ title: '请输入规格型号', icon: 'none' })
      return
    }
    if (!formData.category) {
      uni.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (!formData.unit) {
      uni.showToast({ title: '请选择单位', icon: 'none' })
      return
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      uni.showToast({ title: '请输入有效库存', icon: 'none' })
      return
    }
    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      uni.showToast({ title: '请输入最低库存', icon: 'none' })
      return
    }

    if (showAddModal.value) {
      store.addSupplyItem({
        name: formData.name,
        spec: formData.spec,
        category: formData.category as SupplyCategory,
        unit: formData.unit as SupplyUnit,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock)
      })
      uni.showToast({ title: '新增成功', icon: 'success' })
    } else if (showEditModalState.value && currentItem.value) {
      store.updateSupplyItem(currentItem.value.id, {
        name: formData.name,
        spec: formData.spec,
        category: formData.category as SupplyCategory,
        unit: formData.unit as SupplyUnit,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock)
      })
      uni.showToast({ title: '修改成功', icon: 'success' })
    }
  }
  
  closeModals()
}

function handleDelete(item: SupplyItem) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除物品 "${item.name}" 吗？`,
    success: (res) => {
      if (res.confirm) {
        store.deleteSupplyItem(item.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.role-tips {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 40rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
}

.tips-icon {
  font-size: 40rpx;
}

.tips-text {
  font-size: 28rpx;
  color: #666;
}

.stock-content {
  padding-bottom: 120rpx;
}

.header {
  background-color: #fff;
  padding: 20rpx;
}

.category-tabs {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  margin-bottom: 20rpx;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 26rpx;
  white-space: nowrap;
  
  &.active {
    background-color: #4080ff;
    color: #fff;
  }
}

.cat-icon {
  font-size: 28rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 20rpx;
  height: 80rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
}

.search-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  font-size: 32rpx;
}

.stats-row {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
}

.stat-card {
  flex: 1;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  
  &.warning {
    background-color: #fff7e6;
  }
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4080ff;
  display: block;
  
  .warning & {
    color: #faad14;
  }
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.add-btn {
  position: fixed;
  right: 30rpx;
  bottom: 180rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  background-color: #4080ff;
  color: #fff;
  padding: 20rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(64, 128, 255, 0.3);
}

.add-icon {
  font-size: 36rpx;
  font-weight: bold;
}

.list-container {
  padding: 20rpx;
  height: calc(100vh - 320rpx);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.stock-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.item-info {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
}

.stock-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  background-color: #f6ffed;
  color: #52c41a;
  
  &.warning {
    background-color: #fff7e6;
    color: #faad14;
  }
}

.card-body {
  padding: 10rpx 0;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;
}

.label {
  font-size: 26rpx;
  color: #999;
  width: 120rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  
  &.warning {
    color: #faad14;
    font-weight: bold;
  }
}

.stock-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-top: 16rpx;
}

.stock-fill {
  height: 100%;
  background-color: #52c41a;
  border-radius: 6rpx;
  transition: width 0.3s;
  
  &.warning {
    background-color: #faad14;
  }
}

.card-footer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 26rpx;
  
  &.edit {
    background-color: #f0f7ff;
    color: #4080ff;
  }
  
  &.delete {
    background-color: #fff1f0;
    color: #ff4d4f;
  }
  
  &.add-stock {
    background-color: #f6ffed;
    color: #52c41a;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40rpx;
}

.modal-container {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
}

.modal-form-item {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.modal-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.modal-input {
  width: 100%;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-btn {
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  
  .placeholder {
    color: #999;
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  
  &.cancel {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &.confirm {
    background-color: #4080ff;
    color: #fff;
  }
}

.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.picker-container {
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 70vh;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
}

.picker-close {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.picker-list {
  max-height: 60vh;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 30rpx;
  color: #333;
  
  &.active {
    background-color: #f0f7ff;
    color: #4080ff;
  }
}

.picker-item .cat-icon {
  font-size: 32rpx;
}
</style>
