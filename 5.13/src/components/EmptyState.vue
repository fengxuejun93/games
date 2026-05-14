<template>
  <view class="empty-state">
    <view class="empty-icon-wrap">
      <text class="empty-icon">{{ icon }}</text>
    </view>
    <text class="empty-text">{{ text }}</text>
    <view class="empty-btn" v-if="showBtn" @click="$emit('action')">
      <text class="btn-text">{{ btnText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
  showBtn?: boolean
  btnText?: string
}>()

defineEmits<{
  (e: 'action'): void
}>()
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 48rpx;
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  border-radius: 24rpx;
  margin: 24rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #6b7280;
  margin-bottom: 40rpx;
  text-align: center;
  line-height: 1.6;
}

.empty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 72rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
  }

  .btn-text {
    letter-spacing: 2rpx;
  }
}
</style>