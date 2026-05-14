<template>
  <view class="container">
    <view class="profile-header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-text">{{ store.currentUser.name.charAt(0) }}</text>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ store.currentUser.name }}</text>
          <text class="user-role">{{ getUserRoleLabel(store.currentUser.role) }}</text>
        </view>
      </view>
      <view class="user-department">
        <text class="department-icon">🏢</text>
        <text>{{ store.currentUser.department }}</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item" @click="goToList('all')">
        <text class="stat-value">{{ store.myApplications.length }}</text>
        <text class="stat-label">全部申领</text>
      </view>
      <view class="stat-item" @click="goToList('pending')">
        <text class="stat-value pending">{{ pendingCount }}</text>
        <text class="stat-label">待审批</text>
      </view>
      <view class="stat-item" @click="goToList('approved')">
        <text class="stat-value approved">{{ approvedCount }}</text>
        <text class="stat-label">已通过</text>
      </view>
      <view class="stat-item" @click="goToList('rejected')">
        <text class="stat-value rejected">{{ rejectedCount }}</text>
        <text class="stat-label">已驳回</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @click="goToNotifications">
        <view class="section-title-row">
          <text class="section-icon">🔔</text>
          <text class="section-title">消息通知</text>
        </view>
        <view class="section-extra">
          <view v-if="store.unreadCount > 0" class="badge">{{ store.unreadCount }}</view>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <view v-if="recentNotifications.length > 0" class="notification-list">
        <view 
          v-for="notif in recentNotifications" 
          :key="notif.id" 
          class="notification-item"
          :class="{ unread: !notif.isRead }"
          @click="handleNotificationClick(notif)"
        >
          <view class="notif-icon">{{ getNotificationIcon(notif.type) }}</view>
          <view class="notif-content">
            <text class="notif-title">{{ notif.title }}</text>
            <text class="notif-desc">{{ notif.content }}</text>
            <text class="notif-time">{{ formatTime(notif.createdAt) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-notification">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息通知</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header" @click="goToRoleSelect">
        <view class="section-title-row">
          <text class="section-icon">👤</text>
          <text class="section-title">角色切换</text>
        </view>
        <view class="section-extra">
          <text class="current-role">{{ getUserRoleLabel(store.currentUser.role) }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <view class="section-title-row">
          <text class="section-icon">📋</text>
          <text class="section-title">我的申领记录</text>
        </view>
        <view class="export-btn" @click="handleExport">
          <text class="export-icon">📥</text>
          <text>导出</text>
        </view>
      </view>
      
      <view class="filter-tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value"
          class="filter-tab"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </view>
      </view>

      <scroll-view scroll-y class="application-list">
        <view v-if="filteredApplications.length === 0" class="empty-state">
          <text class="empty-icon">📄</text>
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
              <text class="label">数量：</text>
              <text class="value">{{ getTotalQuantity(app) }}{{ app.items[0]?.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">时间：</text>
              <text class="value">{{ app.createdAt }}</text>
            </view>
          </view>
          
          <view class="card-footer">
            <view 
              v-if="app.status !== 'draft' && app.status !== 'withdrawn'" 
              class="replicate-btn"
              @click.stop="handleReplicate(app.id)"
            >
              <text class="replicate-icon">🔄</text>
              <text>一键复刻</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { 
  getApplicationStatusLabel, 
  getApplicationStatusColor,
  getUserRoleLabel as getRoleLabel,
  getNotificationTypeIcon
} from '@/types/supplies'
import { exportSupplyApplications } from '@/utils/export'
import type { Application, ApplicationStatus, Notification } from '@/types/supplies'

const store = useSuppliesStore()
const currentTab = ref<ApplicationStatus | 'all'>('all')

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'issued', label: '已发放' },
  { value: 'withdrawn', label: '已撤回' }
]

const pendingCount = computed(() => 
  store.myApplications.filter(a => a.status === 'pending').length
)

const approvedCount = computed(() => 
  store.myApplications.filter(a => a.status === 'approved').length
)

const rejectedCount = computed(() => 
  store.myApplications.filter(a => a.status === 'rejected').length
)

const recentNotifications = computed(() => 
  store.allMyNotifications.slice(0, 3)
)

const filteredApplications = computed(() => {
  if (currentTab.value === 'all') {
    return store.myApplications.slice(0, 5)
  }
  return store.myApplications.filter(a => a.status === currentTab.value).slice(0, 5)
})

function getUserRoleLabel(role: string) {
  return getRoleLabel(role as any)
}

function getNotificationIcon(type: string) {
  return getNotificationTypeIcon(type as any)
}

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

function formatTime(timeStr: string): string {
  const now = new Date()
  const time = new Date(timeStr.replace(/-/g, '/'))
  const diff = now.getTime() - time.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else {
    return timeStr.split(' ')[0]
  }
}

function goToList(status: string) {
  uni.navigateTo({ url: `/pages/supplies/list?status=${status}` })
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/supplies/detail?id=${id}` })
}

function goToNotifications() {
  uni.navigateTo({ url: '/pages/supplies/notifications' })
}

function goToRoleSelect() {
  uni.navigateTo({ url: '/pages/supplies/role-select' })
}

function handleNotificationClick(notif: Notification) {
  store.markNotificationAsRead(notif.id)
  if (notif.applicationId) {
    goToDetail(notif.applicationId)
  }
}

function handleReplicate(id: string) {
  uni.showModal({
    title: '确认复刻',
    content: '确定要复刻此申领单吗？将自动带入原物品明细。',
    success: (res) => {
      if (res.confirm) {
        const result = store.createReplication(id)
        if (result) {
          uni.showToast({ title: '复刻成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateTo({ url: `/pages/supplies/detail?id=${result.id}` })
          }, 1500)
        }
      }
    }
  })
}

function handleExport() {
  const exportData = currentTab.value === 'all' 
    ? store.myApplications 
    : store.myApplications.filter(a => a.status === currentTab.value)
  
  exportSupplyApplications(exportData)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.profile-header {
  background: linear-gradient(135deg, #4080ff 0%, #6b7bff 100%);
  padding: 60rpx 30rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.user-role {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.user-department {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  width: fit-content;
  font-size: 26rpx;
  color: #fff;
}

.department-icon {
  font-size: 28rpx;
}

.stats-section {
  display: flex;
  background-color: #fff;
  margin: -30rpx 20rpx 20rpx;
  padding: 30rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  border-right: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-right: none;
  }
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  
  &.pending {
    color: #faad14;
  }
  
  &.approved {
    color: #52c41a;
  }
  
  &.rejected {
    color: #ff4d4f;
  }
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.section {
  background-color: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.section-extra {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.current-role {
  font-size: 26rpx;
  color: #4080ff;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: #52c41a;
  color: #fff;
  border-radius: 20rpx;
  font-size: 26rpx;
}

.export-icon {
  font-size: 28rpx;
}

.badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.arrow {
  font-size: 36rpx;
  color: #999;
}

.notification-list {
  padding: 0 8rpx;
}

.notification-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.unread {
    background-color: #f0f7ff;
    margin: 0 -8rpx;
    padding-left: 24rpx;
    padding-right: 24rpx;
    border-radius: 12rpx;
  }
}

.notif-icon {
  font-size: 36rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}

.notif-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-time {
  font-size: 22rpx;
  color: #999;
}

.empty-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.empty-icon {
  font-size: 60rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
}

.filter-tab {
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

.application-list {
  max-height: 600rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.application-card {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.supply-info {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.supply-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.item-count {
  font-size: 24rpx;
  color: #999;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #fff;
}

.card-body {
  padding-left: 16rpx;
}

.info-row {
  display: flex;
  margin-bottom: 8rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-row .label {
  font-size: 24rpx;
  color: #999;
}

.info-row .value {
  font-size: 24rpx;
  color: #666;
}

.card-footer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.replicate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #4080ff;
}

.replicate-icon {
  font-size: 28rpx;
}
</style>