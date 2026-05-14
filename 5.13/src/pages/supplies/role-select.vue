<template>
  <view class="container">
    <view class="page-header">
      <text class="page-title">选择角色</text>
      <text class="page-desc">切换角色以体验不同权限功能</text>
    </view>

    <view class="current-role-card">
      <view class="role-info">
        <text class="role-icon">👤</text>
        <view class="role-detail">
          <text class="role-name">{{ getUserRoleLabel(store.currentUser.role) }}</text>
          <text class="user-name">{{ store.currentUser.name }} - {{ store.currentUser.department }}</text>
        </view>
      </view>
      <text class="role-badge">当前</text>
    </view>

    <view class="section-title">可选角色</view>
    
    <view 
      v-for="user in availableUsers" 
      :key="user.id" 
      class="role-card"
      :class="{ active: user.id === store.currentUser.id }"
      @click="selectUser(user)"
    >
      <view class="role-info">
        <text class="role-icon">{{ getRoleIcon(user.role) }}</text>
        <view class="role-detail">
          <text class="role-name">{{ getUserRoleLabel(user.role) }}</text>
          <text class="user-name">{{ user.name }} - {{ user.department }}</text>
        </view>
      </view>
      <view class="role-arrow">
        <text v-if="user.id === store.currentUser.id">✓</text>
        <text v-else>›</text>
      </view>
    </view>

    <view class="role-description">
      <view class="desc-section">
        <text class="desc-title">普通员工</text>
        <text class="desc-icon">👷</text>
        <text class="desc-text">可提交办公用品申领申请，查看个人申领记录</text>
      </view>
      <view class="desc-section">
        <text class="desc-title">部门审批人</text>
        <text class="desc-icon">👔</text>
        <text class="desc-text">可审批本部门员工的申领申请，查看审批记录</text>
      </view>
      <view class="desc-section">
        <text class="desc-title">系统管理员</text>
        <text class="desc-icon">👑</text>
        <text class="desc-text">可管理库存、发放物品、审批所有申请、查看完整数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSuppliesStore } from '@/stores/supplies'
import { getUserRoleLabel } from '@/types/supplies'
import type { User } from '@/types/supplies'

const store = useSuppliesStore()

const availableUsers = computed(() => store.users)

function getRoleIcon(role: string) {
  switch (role) {
    case 'employee':
      return '👷'
    case 'department_approver':
      return '👔'
    case 'admin':
      return '👑'
    default:
      return '👤'
  }
}

function selectUser(user: User) {
  if (user.id === store.currentUser.id) return
  
  store.setCurrentUser(user)
  uni.showToast({ 
    title: `已切换为${getUserRoleLabel(user.role)}`, 
    icon: 'success' 
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.page-header {
  text-align: center;
  padding: 40rpx 0;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.page-desc {
  font-size: 26rpx;
  color: #999;
}

.current-role-card {
  background: linear-gradient(135deg, #4080ff 0%, #6b9cff 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.current-role-card .role-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.current-role-card .role-icon {
  font-size: 56rpx;
}

.current-role-card .role-detail {
  display: flex;
  flex-direction: column;
}

.current-role-card .role-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.current-role-card .user-name {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.role-badge {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.role-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  
  &.active {
    border-color: #4080ff;
    background-color: #f0f7ff;
  }
}

.role-card .role-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.role-card .role-icon {
  font-size: 48rpx;
}

.role-card .role-detail {
  display: flex;
  flex-direction: column;
}

.role-card .role-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.role-card .user-name {
  font-size: 24rpx;
  color: #999;
}

.role-arrow {
  font-size: 36rpx;
  color: #ccc;
  
  .active & {
    color: #4080ff;
  }
}

.role-description {
  margin-top: 40rpx;
}

.desc-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.desc-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.desc-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>