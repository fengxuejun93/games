<template>
  <view class="container">
    <view class="role-tips" v-if="store.currentUser.role === 'employee'">
      <text class="tips-icon">💡</text>
      <text class="tips-text">您是普通员工，没有审批权限</text>
    </view>

    <view v-if="store.currentUser.role !== 'employee'" class="approval-content">
      <view class="tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <text>{{ tab.label }}</text>
          <view 
            v-if="getTabCount(tab.value) > 0" 
            class="tab-badge"
          >
            {{ getTabCount(tab.value) }}
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="list-container">
        <view v-if="filteredApplications.length === 0" class="empty-state">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无{{ currentTabLabel }}记录</text>
        </view>
        
        <view 
          v-for="app in filteredApplications" 
          :key="app.id" 
          class="approval-card"
          @click="goToDetail(app.id)"
        >
          <view class="card-header">
            <view class="supply-info">
              <text class="supply-name">{{ getFirstItemName(app) }}</text>
              <text class="item-count" v-if="app.items.length > 1">等{{ app.items.length }}件</text>
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
              <text class="label">申领用途：</text>
              <text class="value reason">{{ getCombinedReasons(app) }}</text>
            </view>
          </view>
          
          <view class="card-footer" v-if="app.status === 'pending' && canApprove(app)">
            <view class="action-btn reject" @click.stop="showRejectModal(app)">
              <text>驳回</text>
            </view>
            <view class="action-btn approve" @click.stop="showApproveModal(app)">
              <text>通过</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view 
      class="modal-mask" 
      v-if="showModal" 
      @click="showModal = false"
    >
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isApprove ? '审批通过' : '审批驳回' }}</text>
          <view class="modal-close" @click="showModal = false">✕</view>
        </view>
        <view class="modal-body">
          <view class="modal-info">
            <text class="info-title">{{ getFirstItemName(currentApp!) }} 等{{ currentApp?.items.length }}件物品</text>
            <text class="info-text">申领人：{{ currentApp?.applicant }}</text>
            <text class="info-text">申领数量：{{ getTotalQuantity(currentApp!) }} 件</text>
            <text class="info-text">部门：{{ currentApp?.department }}</text>
          </view>
          <view class="modal-form">
            <text class="form-label">审批意见</text>
            <textarea 
              v-model="approvalComment" 
              class="form-textarea"
              placeholder="请输入审批意见"
              :maxlength="200"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleApproval">
            <text>{{ isApprove ? '确认通过' : '确认驳回' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { getApplicationStatusLabel, getApplicationStatusColor } from '@/types/supplies'
import type { Application, ApplicationStatus } from '@/types/supplies'

const store = useSuppliesStore()
const currentTab = ref<ApplicationStatus | 'pending'>('pending')
const showModal = ref(false)
const isApprove = ref(true)
const currentApp = ref<Application | null>(null)
const approvalComment = ref('')

const tabs = [
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' }
]

const currentTabLabel = computed(() => {
  const tab = tabs.find(t => t.value === currentTab.value)
  return tab?.label || ''
})

const filteredApplications = computed(() => {
  if (store.currentUser.role === 'department_approver') {
    if (currentTab.value === 'pending') {
      return store.myDepartmentApplications
    }
    return store.applications.filter(a => 
      a.departmentId === store.currentUser.departmentId && a.status === currentTab.value
    )
  }
  return store.applications.filter(a => a.status === currentTab.value)
})

function getTabCount(tab: string) {
  if (tab === 'pending') {
    if (store.currentUser.role === 'department_approver') {
      return store.myDepartmentApplications.length
    }
    return store.pendingApplications.length
  }
  if (store.currentUser.role === 'department_approver') {
    return store.applications.filter(a => 
      a.departmentId === store.currentUser.departmentId && a.status === tab
    ).length
  }
  if (tab === 'approved') return store.approvedApplications.length
  if (tab === 'rejected') return store.rejectedApplications.length
  return 0
}

function getStatusLabel(status: string) {
  return getApplicationStatusLabel(status as ApplicationStatus)
}

function getStatusColor(status: string) {
  return getApplicationStatusColor(status as ApplicationStatus)
}

function getFirstItemName(app: Application): string {
  return app.items[0]?.supplyName || '未知物品'
}

function getTotalQuantity(app: Application): number {
  return app.items.reduce((sum, item) => sum + item.quantity, 0)
}

function getCombinedReasons(app: Application): string {
  const reasons = app.items.map(item => item.reason).filter(Boolean)
  if (reasons.length === 0) return '-'
  if (reasons.length === 1) return reasons[0]
  return reasons.slice(0, 2).join('、') + `等${reasons.length}项`
}

function canApprove(app: Application) {
  if (app.status !== 'pending') return false
  if (store.currentUser.role === 'admin') return true
  if (store.currentUser.role === 'department_approver') {
    return app.departmentId === store.currentUser.departmentId
  }
  return false
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/supplies/detail?id=${id}` })
}

function showApproveModal(app: Application) {
  currentApp.value = app
  isApprove.value = true
  approvalComment.value = ''
  showModal.value = true
}

function showRejectModal(app: Application) {
  currentApp.value = app
  isApprove.value = false
  approvalComment.value = ''
  showModal.value = true
}

function handleApproval() {
  if (!currentApp.value) return
  
  if (isApprove.value) {
    store.approveApplication(currentApp.value.id, approvalComment.value)
    uni.showToast({ title: '审批通过', icon: 'success' })
  } else {
    if (!approvalComment.value.trim()) {
      uni.showToast({ title: '请填写驳回原因', icon: 'none' })
      return
    }
    store.rejectApplication(currentApp.value.id, approvalComment.value)
    uni.showToast({ title: '已驳回', icon: 'success' })
  }
  
  showModal.value = false
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

.approval-content {
  padding-bottom: 120rpx;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 20rpx;
  gap: 20rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  position: relative;
  
  &.active {
    background-color: #4080ff;
    color: #fff;
  }
}

.tab-badge {
  position: absolute;
  top: 8rpx;
  right: 16rpx;
  min-width: 32rpx;
  height: 32rpx;
  background-color: #ff4d4f;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.list-container {
  padding: 20rpx;
  height: calc(100vh - 180rpx);
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

.approval-card {
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
  width: 140rpx;
  flex-shrink: 0;
}

.value {
  font-size: 26rpx;
  color: #333;
  
  &.reason {
    flex: 1;
    word-break: break-all;
  }
}

.card-footer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  
  &.reject {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1rpx solid #ffccc7;
  }
  
  &.approve {
    background-color: #4080ff;
    color: #fff;
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

.modal-info {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.info-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.modal-form {
  margin-bottom: 16rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.form-textarea {
  width: 100%;
  height: 150rpx;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
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
</style>
