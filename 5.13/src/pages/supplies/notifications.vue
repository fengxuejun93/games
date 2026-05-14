<template>
  <view class="container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">消息通知</text>
      <view class="header-right" @click="handleMarkAllRead">
        <text class="mark-all">全部已读</text>
      </view>
    </view>

    <view class="filter-bar">
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-item"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
        <view v-if="getFilterCount(filter.value) > 0" class="filter-badge">
          {{ getFilterCount(filter.value) }}
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="notification-list">
      <view v-if="filteredNotifications.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无{{ getFilterLabel() }}消息</text>
      </view>

      <view 
        v-for="notif in filteredNotifications" 
        :key="notif.id" 
        class="notification-item"
        :class="{ unread: !notif.isRead }"
        @click="handleNotificationClick(notif)"
      >
        <view class="notif-icon-wrapper">
          <text class="notif-icon">{{ getNotificationIcon(notif.type) }}</text>
          <view v-if="!notif.isRead" class="unread-dot"></view>
        </view>
        <view class="notif-content">
          <text class="notif-title">{{ notif.title }}</text>
          <text class="notif-desc">{{ notif.content }}</text>
          <text class="notif-time">{{ formatTime(notif.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { getNotificationTypeIcon } from '@/types/supplies'
import type { Notification, NotificationType } from '@/types/supplies'

const store = useSuppliesStore()
const currentFilter = ref<NotificationType | 'all' | 'unread'>('all')

const filters = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'submit_success', label: '提交成功' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '审批通过' },
  { value: 'rejected', label: '审批驳回' },
  { value: 'issued', label: '已发放' },
  { value: 'low_stock', label: '库存预警' }
]

const filteredNotifications = computed(() => {
  if (currentFilter.value === 'all') {
    return store.allMyNotifications
  } else if (currentFilter.value === 'unread') {
    return store.myNotifications
  } else {
    return store.allMyNotifications.filter(n => n.type === currentFilter.value)
  }
})

function getNotificationIcon(type: NotificationType): string {
  return getNotificationTypeIcon(type)
}

function getFilterCount(filter: string): number {
  if (filter === 'all') {
    return store.allMyNotifications.length
  } else if (filter === 'unread') {
    return store.unreadCount
  } else {
    return store.allMyNotifications.filter(n => n.type === filter).length
  }
}

function getFilterLabel(): string {
  const filter = filters.find(f => f.value === currentFilter.value)
  return filter?.label || ''
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
      if (minutes === 0) return '刚刚'
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return timeStr.split(' ')[0]
  }
}

function goBack() {
  uni.navigateBack()
}

function handleMarkAllRead() {
  store.markAllNotificationsAsRead()
  uni.showToast({ title: '已全部标为已读', icon: 'success' })
}

function handleNotificationClick(notif: Notification) {
  store.markNotificationAsRead(notif.id)
  if (notif.applicationId) {
    uni.navigateTo({ url: `/pages/supplies/detail?id=${notif.applicationId}` })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-right {
  padding: 12rpx 20rpx;
}

.mark-all {
  font-size: 26rpx;
  color: #4080ff;
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 20rpx;
  gap: 16rpx;
  overflow-x: auto;
  border-top: 1rpx solid #f0f0f0;
}

.filter-item {
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
    
    .filter-badge {
      background-color: rgba(255, 255, 255, 0.3);
      color: #fff;
    }
  }
}

.filter-badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  min-width: 32rpx;
  text-align: center;
}

.notification-list {
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

.notification-item {
  display: flex;
  gap: 20rpx;
  background-color: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  &.unread {
    border-left: 4rpx solid #4080ff;
  }
}

.notif-icon-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.notif-icon {
  font-size: 40rpx;
}

.unread-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #ff4d4f;
  border-radius: 50%;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.notif-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.5;
}

.notif-time {
  font-size: 24rpx;
  color: #999;
}
</style>