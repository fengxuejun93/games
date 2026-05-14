<template>
  <view class="record-container">
    <view class="record-header">
      <text class="record-title">签字记录</text>
      <text class="record-close" @click="$emit('close')">✕</text>
    </view>
    
    <scroll-view scroll-y class="record-body">
      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无签字记录</text>
      </view>
      
      <view v-else class="record-list">
        <view 
          v-for="(record, index) in records" 
          :key="index" 
          class="record-item"
        >
          <view class="record-info">
            <view class="record-name">
              <text class="name-label">签字人：</text>
              <text class="name-value">{{ record.signerName }}</text>
            </view>
            <view class="record-time">
              <text class="time-label">签字时间：</text>
              <text class="time-value">{{ formatTime(record.signTime) }}</text>
            </view>
          </view>
          <view v-if="record.signatureData" class="signature-preview">
            <image :src="record.signatureData" mode="aspectFit" class="signature-img" />
          </view>
          <view v-else class="signature-placeholder">
            <text>✍️ 手写签名</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import type { SignatureRecord } from '@/utils/itemStorage'

defineProps<{
  records: SignatureRecord[]
}>()

defineEmits(['close'])

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
.record-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));
  border-bottom: 1rpx solid #f1f5f9;
}

.record-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1e293b;
}

.record-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 28rpx;
  color: #64748b;
}

.record-body {
  flex: 1;
  padding: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #94a3b8;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-item {
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 24rpx;
}

.record-info {
  margin-bottom: 16rpx;
}

.record-name, .record-time {
  display: flex;
  margin-bottom: 8rpx;
}

.name-label, .time-label {
  font-size: 26rpx;
  color: #64748b;
}

.name-value {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
}

.time-value {
  font-size: 26rpx;
  color: #64748b;
}

.signature-preview {
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e2e8f0;
}

.signature-img {
  width: 100%;
  height: 160rpx;
}

.signature-placeholder {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  border: 1rpx dashed #cbd5e1;
  font-size: 26rpx;
  color: #94a3b8;
}
</style>