<template>
  <view class="page">
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title-section">
          <text class="page-title">合同管理</text>
          <text class="page-subtitle">管理企业合同全生命周期</text>
        </view>
        <view class="header-actions">
          <view class="header-btn" @click="goToApproval">
            <text class="btn-icon">📋</text>
            <view class="badge-dot" v-if="pendingCount > 0"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="stats-panel">
      <view 
        class="stat-card" 
        :class="{ active: selectedStatus === 'active' }"
        @click="filterByStatus('active')"
      >
        <view class="stat-icon-wrap active">
          <text class="stat-icon">📋</text>
        </view>
        <view class="stat-content">
          <text class="stat-value">{{ activeCount }}</text>
          <text class="stat-label">生效中</text>
        </view>
        <view class="stat-indicator" v-if="selectedStatus === 'active'"></view>
      </view>
      
      <view 
        class="stat-card" 
        :class="{ active: selectedStatus === 'draft' }"
        @click="filterByStatus('draft')"
      >
        <view class="stat-icon-wrap draft">
          <text class="stat-icon">📝</text>
        </view>
        <view class="stat-content">
          <text class="stat-value">{{ draftCount }}</text>
          <text class="stat-label">草稿</text>
        </view>
        <view class="stat-indicator" v-if="selectedStatus === 'draft'"></view>
      </view>
      
      <view 
        class="stat-card" 
        :class="{ active: selectedStatus === 'archived' }"
        @click="filterByStatus('archived')"
      >
        <view class="stat-icon-wrap archived">
          <text class="stat-icon">📁</text>
        </view>
        <view class="stat-content">
          <text class="stat-value">{{ archivedCount }}</text>
          <text class="stat-label">已归档</text>
        </view>
        <view class="stat-indicator" v-if="selectedStatus === 'archived'"></view>
      </view>
      
      <view class="stat-card" @click="goToReminder">
        <view class="stat-icon-wrap expiring">
          <text class="stat-icon">🔔</text>
        </view>
        <view class="stat-content">
          <text class="stat-value" :class="{ urgent: expiringCount > 0 }">{{ expiringCount }}</text>
          <text class="stat-label">即将到期</text>
        </view>
        <view class="stat-arrow">›</view>
      </view>
    </view>

    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索合同名称、编号、甲乙双方..."
          @confirm="handleSearch"
        />
        <view class="search-clear" v-if="searchKeyword" @click="searchKeyword = ''">
          <text class="clear-icon">✕</text>
        </view>
      </view>
      <view class="filter-btn" @click="showFilterModal = true">
        <text class="filter-icon">⚙️</text>
        <text class="filter-text">筛选</text>
      </view>
    </view>

    <FilterModal 
      :visible="showFilterModal"
      :selected-type="selectedType"
      :selected-status="selectedStatus"
      @close="showFilterModal = false"
      @confirm="handleFilterConfirm"
    />

    <view class="contract-list">
      <view class="list-header">
        <view class="list-title-wrap">
          <text class="list-title">合同列表</text>
          <view class="list-filter-tag" v-if="selectedType || selectedStatus">
            <text class="tag-text">{{ getFilterTagText() }}</text>
            <text class="tag-close" @click="clearFilter">✕</text>
          </view>
        </view>
        <text class="list-count">共 {{ filteredContracts.length }} 份</text>
      </view>
      
      <ContractCard 
        v-for="contract in filteredContracts"
        :key="contract.id"
        :contract="contract"
        :show-actions="true"
        @click="handleContractClick"
        @edit="handleContractEdit"
        @delete="handleContractDelete"
      />
    </view>

    <EmptyState 
      v-if="filteredContracts.length === 0"
      icon="📋"
      text="暂无合同数据"
      :show-btn="true"
      btn-text="新建合同"
      @action="goToForm"
    />

    <view class="fab-btn" @click="goToForm">
      <view class="fab-icon-wrap">
        <text class="fab-icon">+</text>
      </view>
      <text class="fab-text">新建合同</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContractStore } from '@/stores/contract'
import type { Contract, ContractType, ContractStatus } from '@/types/contract'
import { getContractTypeLabel } from '@/types/contract'
import ContractCard from '@/components/ContractCard.vue'
import FilterModal from '@/components/FilterModal.vue'
import EmptyState from '@/components/EmptyState.vue'

const contractStore = useContractStore()

const searchKeyword = ref('')
const showFilterModal = ref(false)
const selectedType = ref<ContractType | undefined>()
const selectedStatus = ref<ContractStatus | undefined>()

const activeCount = computed(() => contractStore.activeContracts.length)
const draftCount = computed(() => contractStore.draftContracts.length)
const archivedCount = computed(() => contractStore.archivedContracts.length)
const expiringCount = computed(() => contractStore.expiringContracts.length)
const pendingCount = computed(() => contractStore.pendingContracts.length)

const filteredContracts = computed(() => {
  return contractStore.search(searchKeyword.value, selectedType.value, selectedStatus.value)
})

onShow(() => {
  searchKeyword.value = ''
  selectedType.value = undefined
  selectedStatus.value = undefined
})

function handleSearch() {
}

function handleFilterConfirm(type: ContractType | undefined, status: ContractStatus | undefined) {
  selectedType.value = type
  selectedStatus.value = status
  showFilterModal.value = false
}

function filterByStatus(status: ContractStatus) {
  selectedStatus.value = selectedStatus.value === status ? undefined : status
  selectedType.value = undefined
}

function getFilterTagText(): string {
  const parts: string[] = []
  if (selectedType.value) {
    parts.push(getContractTypeLabel(selectedType.value))
  }
  if (selectedStatus.value) {
    const statusLabels: Record<ContractStatus, string> = {
      draft: '草稿',
      pending_approval: '待审批',
      approved: '已通过',
      active: '生效中',
      archived: '已归档',
      cancelled: '已作废'
    }
    parts.push(statusLabels[selectedStatus.value])
  }
  return parts.join(' · ')
}

function clearFilter() {
  selectedType.value = undefined
  selectedStatus.value = undefined
}

function goToReminder() {
  uni.navigateTo({
    url: '/pages/reminder/index'
  })
}

function goToApproval() {
  uni.navigateTo({
    url: '/pages/approval/index'
  })
}

function handleContractClick(contract: Contract) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${contract.id}`
  })
}

function handleContractEdit(contract: Contract) {
  uni.navigateTo({
    url: `/pages/form/index?id=${contract.id}`
  })
}

function handleContractDelete(contract: Contract) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除合同「${contract.title}」吗？此操作不可撤销。`,
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        contractStore.remove(contract.id)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

function goToForm() {
  uni.navigateTo({
    url: '/pages/form/index'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.page-header {
  position: relative;
  padding: 48rpx 32rpx;
  overflow: hidden;
  border-radius: 0 0 48rpx 48rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%);
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title-section {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.header-btn {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.2);
  }

  .btn-icon {
    font-size: 36rpx;
  }

  .badge-dot {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 16rpx;
    height: 16rpx;
    background: #ef4444;
    border-radius: 50%;
    border: 3rpx solid #ffffff;
  }
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 0 24rpx;
  margin-top: -48rpx;
}

.stat-card {
  position: relative;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.04);
  }

  .stat-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 6rpx;
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
    border-radius: 0 0 6rpx 6rpx;
  }
}

.stat-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: rgba(37, 99, 235, 0.1);
  }

  &.draft {
    background: rgba(156, 163, 175, 0.1);
  }

  &.archived {
    background: rgba(107, 114, 128, 0.1);
  }

  &.expiring {
    background: rgba(245, 158, 11, 0.1);
  }
}

.stat-icon {
  font-size: 36rpx;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;

  &.urgent {
    color: #f59e0b;
  }
}

.stat-label {
  font-size: 22rpx;
  color: #6b7280;
}

.stat-arrow {
  font-size: 28rpx;
  color: #d1d5db;
}

.search-section {
  display: flex;
  gap: 16rpx;
  padding: 28rpx 24rpx;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 88rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f3f4f6;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.08);
  }
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  background: transparent;
  color: #1f2937;
}

.search-clear {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #e5e7eb;
  }

  .clear-icon {
    font-size: 24rpx;
    color: #9ca3af;
  }
}

.filter-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 88rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #f9fafb;
    transform: scale(0.98);
  }
}

.filter-icon {
  font-size: 32rpx;
}

.filter-text {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.contract-list {
  padding: 0 24rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.list-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.list-filter-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 20rpx;

  .tag-text {
    font-size: 24rpx;
    color: #2563eb;
  }

  .tag-close {
    font-size: 22rpx;
    color: #2563eb;
    opacity: 0.7;
  }
}

.list-count {
  font-size: 24rpx;
  color: #9ca3af;
}

.fab-btn {
  position: fixed;
  right: 32rpx;
  bottom: calc(80rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 24rpx 36rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 56rpx;
  box-shadow: 0 8rpx 28rpx rgba(37, 99, 235, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 14rpx rgba(37, 99, 235, 0.4);
  }
}

.fab-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-icon {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: 300;
}

.fab-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}
</style>