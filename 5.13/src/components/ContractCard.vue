<template>
  <view class="contract-card" :class="{ hover: isHovered }" @click="handleClick" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <view class="card-glow"></view>
    <view class="card-header">
      <view class="contract-info">
        <text class="contract-title">{{ contract.title }}</text>
        <text class="contract-no">{{ contract.contractNo }}</text>
      </view>
      <view class="card-badges">
        <view class="badge type-badge" :class="contract.type">
          <text class="badge-icon">{{ getTypeIcon(contract.type) }}</text>
          <text class="badge-text">{{ typeLabel }}</text>
        </view>
        <view class="badge status-badge" :class="contract.status">
          <text class="badge-dot"></text>
          <text class="badge-text">{{ statusLabel }}</text>
        </view>
      </view>
    </view>
    
    <view class="card-body">
      <view class="info-grid">
        <view class="info-item">
          <text class="info-icon">👤</text>
          <view class="info-content">
            <text class="info-label">甲方</text>
            <text class="info-value">{{ contract.partyA }}</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">👤</text>
          <view class="info-content">
            <text class="info-label">乙方</text>
            <text class="info-value">{{ contract.partyB }}</text>
          </view>
        </view>
      </view>
      
      <view class="card-highlight">
        <view class="amount-info">
          <text class="amount-label">合同金额</text>
          <view class="amount-value-wrap">
            <text class="amount-currency">{{ contract.currency }}</text>
            <text class="amount-number">{{ formatAmount(contract.amount) }}</text>
          </view>
        </view>
        
        <view class="date-info" :class="{ expiring: isExpiring, expired: isExpired }">
          <text class="date-label">到期日</text>
          <text class="date-value">{{ contract.endDate }}</text>
          <text class="date-countdown" v-if="isExpiring || isExpired">
            {{ isExpired ? '已过期' : `${getDaysRemaining()}天后到期` }}
          </text>
        </view>
      </view>
    </view>
    
    <view class="card-footer">
      <text class="update-time">更新于 {{ formatDate(contract.updatedAt) }}</text>
      <view class="actions" v-if="showActions">
        <view class="action-btn edit" @click.stop="handleEdit">
          <text class="btn-icon">✏️</text>
          <text class="btn-text">编辑</text>
        </view>
        <view class="action-btn delete" @click.stop="handleDelete">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Contract, ContractType } from '@/types/contract'
import { getContractTypeLabel, getContractStatusLabel } from '@/types/contract'

const props = defineProps<{
  contract: Contract
  showActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', contract: Contract): void
  (e: 'edit', contract: Contract): void
  (e: 'delete', contract: Contract): void
}>()

const isHovered = ref(false)

const typeLabel = getContractTypeLabel(props.contract.type)
const statusLabel = getContractStatusLabel(props.contract.status)

const isExpiring = computed(() => {
  const endDate = new Date(props.contract.endDate)
  const now = new Date()
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
})

const isExpired = computed(() => {
  const endDate = new Date(props.contract.endDate)
  const now = new Date()
  return endDate < now
})

function getTypeIcon(type: ContractType): string {
  const icons: Record<ContractType, string> = {
    purchase: '📦',
    sales: '💰',
    service: '⚙️',
    hr: '👥'
  }
  return icons[type]
}

function getDaysRemaining(): number {
  const endDate = new Date(props.contract.endDate)
  const now = new Date()
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function handleClick() {
  emit('click', props.contract)
}

function handleEdit() {
  emit('edit', props.contract)
}

function handleDelete() {
  emit('delete', props.contract)
}
</script>

<style lang="scss" scoped>
.contract-card {
  position: relative;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f3f4f6;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.hover {
    transform: translateY(-6rpx) scale(1.002);
    box-shadow: 0 12rpx 32rpx rgba(37, 99, 235, 0.12);
    border-color: rgba(37, 99, 235, 0.2);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #2563eb 100%);
    opacity: 0;
    transform: scaleX(0);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left;
  }

  &.hover .card-glow {
    opacity: 1;
    transform: scaleX(1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.contract-info {
  flex: 1;
  margin-right: 20rpx;
}

.contract-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.contract-no {
  font-size: 24rpx;
  color: #9ca3af;
  font-family: monospace;
}

.card-badges {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 16rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  .badge-icon {
    font-size: 20rpx;
  }

  .badge-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
  }
}

.type-badge {
  &.purchase {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
  }

  &.sales {
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
  }

  &.service {
    background: rgba(245, 158, 11, 0.08);
    color: #f59e0b;
  }

  &.hr {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
  }
}

.status-badge {
  &.draft {
    background: rgba(156, 163, 175, 0.08);
    color: #9ca3af;
    .badge-dot { background: #9ca3af; }
  }

  &.pending_approval {
    background: rgba(245, 158, 11, 0.08);
    color: #f59e0b;
    .badge-dot { 
      background: #f59e0b; 
      animation: pulse 2s infinite;
    }
  }

  &.approved {
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
    .badge-dot { background: #10b981; }
  }

  &.active {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
    .badge-dot { background: #2563eb; }
  }

  &.archived {
    background: rgba(107, 114, 128, 0.08);
    color: #6b7280;
    .badge-dot { background: #6b7280; }
  }

  &.cancelled {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    .badge-dot { background: #ef4444; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-body {
  margin-bottom: 24rpx;
}

.info-grid {
  display: flex;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.info-item {
  flex: 1;
  display: flex;
  gap: 12rpx;
}

.info-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 22rpx;
  color: #9ca3af;
  display: block;
  margin-bottom: 6rpx;
}

.info-value {
  font-size: 28rpx;
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.card-highlight {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  border: 1rpx solid #f3f4f6;
}

.amount-info {
  flex: 1;
}

.amount-label {
  font-size: 22rpx;
  color: #9ca3af;
  display: block;
  margin-bottom: 8rpx;
}

.amount-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.amount-currency {
  font-size: 24rpx;
  color: #6b7280;
}

.amount-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
}

.date-info {
  text-align: right;
  padding-left: 24rpx;
  border-left: 1rpx solid #e5e7eb;

  &.expiring {
    .date-value, .date-countdown {
      color: #f59e0b;
    }
  }

  &.expired {
    .date-value, .date-countdown {
      color: #ef4444;
    }
  }
}

.date-label {
  font-size: 22rpx;
  color: #9ca3af;
  display: block;
  margin-bottom: 8rpx;
}

.date-value {
  font-size: 28rpx;
  color: #374151;
  display: block;
  font-weight: 600;
}

.date-countdown {
  font-size: 22rpx;
  color: #9ca3af;
  display: block;
  margin-top: 4rpx;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid #f3f4f6;
}

.update-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &.edit {
    background: rgba(37, 99, 235, 0.06);
    color: #2563eb;

    &:hover, &:active {
      background: rgba(37, 99, 235, 0.12);
    }
  }

  &.delete {
    background: rgba(239, 68, 68, 0.06);
    color: #ef4444;

    &:hover, &:active {
      background: rgba(239, 68, 68, 0.12);
    }
  }

  .btn-icon {
    font-size: 22rpx;
  }
}
</style>