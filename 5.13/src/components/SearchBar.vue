<template>
  <view class="search-bar">
    <view class="search-input-wrap">
      <text class="search-icon">🔍</text>
      <input 
        class="search-input" 
        type="text" 
        placeholder="搜索合同名称、编号、甲乙双方..."
        :value="modelValue"
        @input="handleInput"
        confirm-type="search"
      />
      <text class="clear-icon" v-if="modelValue" @click="handleClear">✕</text>
    </view>
    <view class="filter-btn" @click="$emit('filter')">
      <text class="filter-icon">⚙️</text>
      <text>筛选</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'filter'): void
}>()

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleClear() {
  emit('update:modelValue', '')
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  background: transparent;
}

.clear-icon {
  font-size: 24rpx;
  color: #999999;
  padding: 8rpx;
}

.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background: #4080ff;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>