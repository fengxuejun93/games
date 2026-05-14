<template>
  <view class="container">
    <view class="header">
      <view class="search-bar">
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="搜索物品名称、申领人、部门"
          class="search-input"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">
          <text class="search-icon">🔍</text>
        </view>
      </view>
      <view class="filter-bar">
        <view 
          v-for="status in statusOptions" 
          :key="status.value"
          class="filter-item"
          :class="{ active: currentStatus === status.value }"
          @click="currentStatus = status.value"
        >
          {{ status.label }}
        </view>
      </view>
    </view>

    <view class="add-btn" @click="goToForm">
      <text class="add-icon">+</text>
      <text>新建申领</text>
    </view>

    <scroll-view scroll-y class="list-container">
      <view v-if="filteredApplications.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无申领记录</text>
      </view>
      
      <view 
        v-for="app in filteredApplications" 
        :key="app.id" 
        class="application-card"
        @click="goToDetail(app.id)"
      >
        <view class="card-header">
          <view class="supply-info">
            <text class="supply-name">{{ getFirstItemName(app) }}</text>
            <text class="item-count" v-if="app.items.length > 1">等{{ app.items.length }}件物品</text>
          </view>
          <view 
            class="status-tag" 
            :style="{ backgroundColor: getStatusColor(app.status) }"
          >
            {{ getStatusLabel(app.status) }}
          </view>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="label">申领数量：</text>
            <text class="value">{{ getTotalQuantity(app) }} 件</text>
          </view>
          <view class="info-row">
            <text class="label">申领人：</text>
            <text class="value">{{ app.applicant }}</text>
          </view>
          <view class="info-row">
            <text class="label">部门：</text>
            <text class="value">{{ app.department }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ app.createdAt }}</text>
          </view>
        </view>
        
        <view class="card-footer">
          <view v-if="app.status === 'pending'" class="actions">
            <view class="action-btn cancel" @click.stop="handleWithdraw(app.id)">
              <text>撤回</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { getApplicationStatusLabel, getApplicationStatusColor } from '@/types/supplies'
import type { ApplicationStatus, Application } from '@/types/supplies'

const store = useSuppliesStore()
const keyword = ref('')
const currentStatus = ref<ApplicationStatus | ''>('')

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '审批通过' },
  { value: 'rejected', label: '审批驳回' },
  { value: 'issued', label: '已发放' },
  { value: 'withdrawn', label: '已撤回' },
  { value: 'draft', label: '草稿' }
]

const filteredApplications = computed(() => {
  return store.searchApplications(keyword.value, currentStatus.value || undefined)
})

function getStatusLabel(status: ApplicationStatus) {
  return getApplicationStatusLabel(status)
}

function getStatusColor(status: ApplicationStatus) {
  return getApplicationStatusColor(status)
}

function getFirstItemName(app: Application): string {
  return app.items[0]?.supplyName || '未知物品'
}

function getTotalQuantity(app: Application): number {
  return app.items.reduce((sum, item) => sum + item.quantity, 0)
}

function handleSearch() {
  filteredApplications.value = store.searchApplications(keyword.value, currentStatus.value || undefined)
}

function goToForm() {
  uni.navigateTo({ url: '/pages/supplies/form' })
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/supplies/detail?id=${id}` })
}

function handleWithdraw(id: string) {
  uni.showModal({
    title: '确认撤回',
    content: '确定要撤回该申领吗？',
    success: (res) => {
      if (res.confirm) {
        store.withdrawApplication(id)
        uni.showToast({ title: '撤回成功', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background-color: #fff;
  padding: 20rpx;
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

.filter-bar {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  overflow-x: auto;
}

.filter-item {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 26rpx;
  white-space: nowrap;
  
  &.active {
    background-color: #4080ff;
    color: #fff;
  }
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
  height: calc(100vh - 280rpx);
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

.application-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.supply-info {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.supply-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.item-count {
  font-size: 24rpx;
  color: #999;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #fff;
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
}

.card-footer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 26rpx;
  
  &.cancel {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &.confirm {
    background-color: #4080ff;
    color: #fff;
  }
}
</style>
