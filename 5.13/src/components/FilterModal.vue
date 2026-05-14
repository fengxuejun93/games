<template>
  <view class="filter-modal" v-if="visible" @click="handleClose">
    <view class="modal-mask" @click="handleClose"></view>
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="title">筛选条件</text>
        <view class="close-btn" @click="handleClose">
          <text class="close-icon">✕</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="filter-section">
          <view class="section-header">
            <text class="filter-label">合同类型</text>
          </view>
          <view class="filter-options">
            <view 
              v-for="option in typeOptions" 
              :key="option.value"
              class="filter-option"
              :class="{ active: currentType === option.value }"
              @click="selectType(option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>
        
        <view class="filter-section">
          <view class="section-header">
            <text class="filter-label">合同状态</text>
          </view>
          <view class="filter-options">
            <view 
              v-for="option in statusOptions" 
              :key="option.value"
              class="filter-option"
              :class="{ active: currentStatus === option.value }"
              @click="selectStatus(option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <view class="btn-reset" @click="handleReset">
          <text class="btn-text">重置</text>
        </view>
        <view class="btn-confirm" @click="handleConfirm">
          <text class="btn-text">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CONTRACT_TYPE_OPTIONS, CONTRACT_STATUS_OPTIONS } from '@/types/contract'
import type { ContractType, ContractStatus } from '@/types/contract'

const props = defineProps<{
  visible: boolean
  selectedType?: ContractType
  selectedStatus?: ContractStatus
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', type: ContractType | undefined, status: ContractStatus | undefined): void
}>()

const typeOptions = [{ value: undefined, label: '全部' }, ...CONTRACT_TYPE_OPTIONS]
const statusOptions = [{ value: undefined, label: '全部' }, ...CONTRACT_STATUS_OPTIONS]

const currentType = ref<ContractType | undefined>(props.selectedType)
const currentStatus = ref<ContractStatus | undefined>(props.selectedStatus)

watch(() => props.visible, (val) => {
  if (val) {
    currentType.value = props.selectedType
    currentStatus.value = props.selectedStatus
  }
})

function selectType(type: ContractType | undefined) {
  currentType.value = currentType.value === type ? undefined : type
}

function selectStatus(status: ContractStatus | undefined) {
  currentStatus.value = currentStatus.value === status ? undefined : status
}

function handleClose() {
  emit('close')
}

function handleReset() {
  currentType.value = undefined
  currentStatus.value = undefined
}

function handleConfirm() {
  emit('confirm', currentType.value, currentStatus.value)
}
</script>

<style lang="scss" scoped>
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 75vh;
  overflow-y: auto;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #e5e7eb;
    transform: scale(0.95);
  }

  .close-icon {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.modal-body {
  padding: 32rpx;
}

.filter-section {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  margin-bottom: 20rpx;
}

.filter-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #374151;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 18rpx 32rpx;
  background: #f9fafb;
  border-radius: 48rpx;
  border: 2rpx solid #f3f4f6;
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.96);
  }

  &.active {
    background: rgba(37, 99, 235, 0.08);
    border-color: #2563eb;
    
    .option-text {
      color: #2563eb;
      font-weight: 600;
    }
  }

  .option-text {
    font-size: 28rpx;
    color: #4b5563;
  }
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  border-top: 1rpx solid #f3f4f6;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}

.btn-reset, .btn-confirm {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 500;
  }
}

.btn-reset {
  background: #f3f4f6;

  .btn-text {
    color: #4b5563;
  }

  &:active {
    background: #e5e7eb;
  }
}

.btn-confirm {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);

  .btn-text {
    color: #ffffff;
  }

  &:active {
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
  }
}
</style>