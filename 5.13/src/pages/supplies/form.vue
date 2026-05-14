<template>
  <view class="container">
    <view class="form-section">
      <view class="section-header">
        <text class="section-title">申请信息</text>
      </view>
      <view class="info-row">
        <text class="label">申领人</text>
        <text class="value">{{ store.currentUser.name }}</text>
      </view>
      <view class="info-row">
        <text class="label">所属部门</text>
        <text class="value">{{ store.currentUser.department }}</text>
      </view>
      <view class="info-row">
        <text class="label">申请时间</text>
        <text class="value">{{ currentTime }}</text>
      </view>
    </view>

    <view class="form-section">
      <view class="section-header">
        <text class="section-title">申领物品</text>
        <view class="add-btn" @click="showSupplyPicker = true">
          <text class="add-icon">+</text>
          <text>添加物品</text>
        </view>
      </view>

      <view v-if="applicationItems.length === 0" class="empty-items">
        <text class="empty-icon">📦</text>
        <text class="empty-text">请添加需要申领的物品</text>
      </view>

      <view v-for="(item, index) in applicationItems" :key="index" class="item-card">
        <view class="item-header">
          <view class="item-info">
            <text class="item-name">{{ item.supplyName }}</text>
            <text class="item-spec">{{ item.spec }}</text>
          </view>
          <view class="remove-btn" @click="removeItem(index)">✕</view>
        </view>
        
        <view class="item-body">
          <view class="stock-info">
            <text class="stock-label">库存：</text>
            <text class="stock-value" :class="{ warning: item.currentStock <= 5 }">
              {{ item.currentStock }}{{ item.unit }}
            </text>
            <text class="stock-limit">（可申领上限：{{ item.currentStock }}{{ item.unit }}）</text>
          </view>
          
          <view class="form-row">
            <text class="label">数量 *</text>
            <view class="quantity-input">
              <view class="qty-btn" @click="decreaseQty(index)">-</view>
              <input 
                type="number" 
                :value="item.quantity"
                class="qty-input"
                @input="(e: any) => updateQty(index, e.detail.value)"
              />
              <view class="qty-btn" @click="increaseQty(index)">+</view>
              <text class="qty-unit">{{ item.unit }}</text>
            </view>
          </view>
          
          <view class="form-row">
            <text class="label">用途 *</text>
            <textarea 
              :value="item.reason"
              class="form-textarea"
              placeholder="请填写申领用途"
              :maxlength="200"
              @input="(e: any) => updateReason(index, e.detail.value)"
            />
          </view>
          
          <view class="form-row">
            <text class="label">备注</text>
            <input 
              type="text" 
              :value="item.remark"
              class="form-input"
              placeholder="选填，如有特殊需求请备注"
              :maxlength="100"
              @input="(e: any) => updateRemark(index, e.detail.value)"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="form-section" v-if="hasDraft">
      <view class="draft-info" @click="loadDraft">
        <text class="draft-icon">📋</text>
        <view class="draft-content">
          <text class="draft-title">有未提交的草稿</text>
          <text class="draft-time">保存于 {{ draftInfo?.updatedAt }}</text>
        </view>
        <text class="draft-arrow">›</text>
      </view>
    </view>

    <view class="footer-actions">
      <view class="action-btn secondary" @click="handleSaveDraft">
        <text>保存草稿</text>
      </view>
      <view class="action-btn primary" @click="handleSubmit">
        <text>提交申请</text>
      </view>
    </view>

    <view 
      class="picker-mask" 
      v-if="showSupplyPicker" 
      @click="showSupplyPicker = false"
    >
      <view class="picker-container" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择物品</text>
          <view class="picker-close" @click="showSupplyPicker = false">✕</view>
        </view>
        
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
            v-model="searchKeyword" 
            placeholder="搜索物品名称"
            class="search-input"
          />
        </view>

        <scroll-view scroll-y class="picker-list">
          <view 
            v-for="item in filteredSupplyItems" 
            :key="item.id"
            class="picker-item"
            :class="{ active: isItemSelected(item.id), disabled: item.stock === 0 }"
            @click="selectSupply(item)"
          >
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">{{ item.spec }}</text>
            </view>
            <view class="item-stock">
              <text :class="{ warning: item.stock <= 5 }">{{ item.stock }}{{ item.unit }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { SUPPLY_CATEGORY_OPTIONS } from '@/types/supplies'
import type { SupplyItem, ApplicationItem, SupplyCategory } from '@/types/supplies'

const store = useSuppliesStore()
const showSupplyPicker = ref(false)
const selectedCategory = ref<SupplyCategory | ''>('')
const searchKeyword = ref('')
const categoryOptions = [{ value: '', label: '全部', icon: '📋' }, ...SUPPLY_CATEGORY_OPTIONS]

const applicationItems = reactive<ApplicationItem[]>([])

const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

const hasDraft = computed(() => {
  return store.getMyDraft() !== undefined
})

const draftInfo = computed(() => store.getMyDraft())

const filteredSupplyItems = computed(() => {
  return store.searchSupplyItems(searchKeyword.value, selectedCategory.value || undefined)
})

function isItemSelected(supplyId: string): boolean {
  return applicationItems.some(item => item.supplyId === supplyId)
}

function selectSupply(item: SupplyItem) {
  if (item.stock === 0) {
    uni.showToast({ title: '该物品库存为0，无法申领', icon: 'none' })
    return
  }
  
  if (isItemSelected(item.id)) {
    uni.showToast({ title: '该物品已添加', icon: 'none' })
    return
  }

  applicationItems.push({
    supplyId: item.id,
    supplyName: item.name,
    spec: item.spec,
    unit: item.unit,
    quantity: 1,
    currentStock: item.stock,
    reason: '',
    remark: ''
  })

  showSupplyPicker.value = false
}

function removeItem(index: number) {
  applicationItems.splice(index, 1)
}

function increaseQty(index: number) {
  const item = applicationItems[index]
  if (item.quantity < item.currentStock) {
    item.quantity++
  }
}

function decreaseQty(index: number) {
  const item = applicationItems[index]
  if (item.quantity > 1) {
    item.quantity--
  }
}

function updateQty(index: number, value: string) {
  const item = applicationItems[index]
  const num = parseInt(value) || 1
  item.quantity = Math.max(1, Math.min(num, item.currentStock))
}

function updateReason(index: number, value: string) {
  applicationItems[index].reason = value
}

function updateRemark(index: number, value: string) {
  applicationItems[index].remark = value
}

function validateForm(): boolean {
  if (applicationItems.length === 0) {
    uni.showToast({ title: '请至少添加一件物品', icon: 'none' })
    return false
  }

  for (const item of applicationItems) {
    if (!item.reason.trim()) {
      uni.showToast({ title: `请填写【${item.supplyName}】的申领用途`, icon: 'none' })
      return false
    }
    if (item.quantity <= 0) {
      uni.showToast({ title: `请设置【${item.supplyName}】的申领数量`, icon: 'none' })
      return false
    }
  }

  return true
}

function handleSaveDraft() {
  if (applicationItems.length === 0) {
    uni.showToast({ title: '请至少添加一件物品', icon: 'none' })
    return
  }

  store.saveDraft([...applicationItems])
  uni.showToast({ title: '草稿保存成功', icon: 'success' })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

function handleSubmit() {
  if (!validateForm()) return

  store.addApplication([...applicationItems], 'pending')
  uni.showToast({ title: '提交成功', icon: 'success' })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

function loadDraft() {
  const draft = store.getMyDraft()
  if (draft) {
    applicationItems.length = 0
    for (const item of draft.items) {
      const supply = store.getSupplyItemById(item.supplyId)
      applicationItems.push({
        ...item,
        currentStock: supply?.stock || item.currentStock
      })
    }
    uni.showToast({ title: '已加载草稿', icon: 'success' })
  }
}

onMounted(() => {
  const draft = store.getMyDraft()
  if (draft) {
    uni.showModal({
      title: '提示',
      content: '检测到未提交的草稿，是否加载？',
      success: (res) => {
        if (res.confirm) {
          loadDraft()
        }
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 180rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #4080ff;
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
}

.add-icon {
  font-size: 28rpx;
}

.info-row {
  display: flex;
  padding: 12rpx 0;
}

.info-row .label {
  font-size: 28rpx;
  color: #666;
  width: 140rpx;
}

.info-row .value {
  font-size: 28rpx;
  color: #333;
}

.empty-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.item-card {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.item-header .item-info {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.item-header .item-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-header .item-spec {
  font-size: 24rpx;
  color: #999;
}

.remove-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 50%;
  font-size: 28rpx;
  color: #999;
}

.item-body {
  padding-left: 16rpx;
}

.stock-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 24rpx;
}

.stock-label {
  color: #999;
}

.stock-value {
  color: #52c41a;
  font-weight: bold;
  
  &.warning {
    color: #faad14;
  }
}

.stock-limit {
  color: #999;
  margin-left: 8rpx;
}

.form-row {
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-row .label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #666;
}

.qty-input {
  width: 100rpx;
  height: 56rpx;
  text-align: center;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.qty-unit {
  font-size: 26rpx;
  color: #666;
}

.form-textarea {
  width: 100%;
  height: 120rpx;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.draft-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background-color: #fff7e6;
  border-radius: 12rpx;
}

.draft-icon {
  font-size: 40rpx;
}

.draft-content {
  flex: 1;
}

.draft-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fa8c16;
  display: block;
}

.draft-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.draft-arrow {
  font-size: 36rpx;
  color: #999;
}

.footer-actions {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: 40rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 40rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
  
  &.secondary {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &.primary {
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
  max-height: 80vh;
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

.category-tabs {
  display: flex;
  padding: 20rpx;
  gap: 16rpx;
  overflow-x: auto;
  border-bottom: 1rpx solid #f0f0f0;
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
  padding: 20rpx;
}

.search-input {
  width: 100%;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-list {
  max-height: 60vh;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &.active {
    background-color: #f0f7ff;
  }
  
  &.disabled {
    opacity: 0.5;
  }
}

.picker-item .item-info {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.picker-item .item-name {
  font-size: 30rpx;
  color: #333;
}

.picker-item .item-spec {
  font-size: 24rpx;
  color: #999;
}

.picker-item .item-stock {
  font-size: 26rpx;
  color: #52c41a;
  
  .warning & {
    color: #faad14;
  }
}
</style>
