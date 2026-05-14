<template>
  <view class="count-badge" :style="{ backgroundColor: color + '20', color: color }">
    <text class="count">{{ count }}</text>
    <text class="label">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  count: number
  label: string
  color?: string
}>()
</script>

<style lang="scss" scoped>
.count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  min-width: 140rpx;
}

.count {
  font-size: 40rpx;
  font-weight: 600;
}

.label {
  font-size: 24rpx;
  margin-top: 8rpx;
}
</style>