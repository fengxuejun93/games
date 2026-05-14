<template>
  <view class="page">
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title-section">
          <view class="title-icon-wrap">
            <text class="title-icon">💰</text>
          </view>
          <view class="title-text">
            <text class="page-title">金额认领</text>
            <text class="page-subtitle">管理合同金额认领记录</text>
          </view>
        </view>
      </view>
    </view>

    <view class="tabs-panel">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <view class="tab-content">
          <text class="tab-value">{{ pendingClaims.length }}</text>
          <text class="tab-label">待确认</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'pending'"></view>
      </view>
      
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'confirmed' }"
        @click="activeTab = 'confirmed'"
      >
        <view class="tab-content">
          <text class="tab-value">{{ confirmedClaims.length }}</text>
          <text class="tab-label">已确认</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'confirmed'"></view>
      </view>
      
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'contracts' }"
        @click="activeTab = 'contracts'"
      >
        <view class="tab-content">
          <text class="tab-value">{{ availableContracts.length }}</text>
          <text class="tab-label">可认领合同</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'contracts'"></view>
      </view>
    </view>

    <view class="claim-list" v-if="activeTab === 'pending' || activeTab === 'confirmed'">
      <view 
        class="claim-card" 
        v-for="item in filteredClaims" 
        :key="item.id"
        @click="handleClaimClick(item)"
      >
        <view class="card-status-bar" :class="item.status"></view>
        
        <view class="card-header">
          <view class="contract-info">
            <text class="contract-title">{{ item.contract.title }}</text>
            <text class="contract-no">{{ item.contract.contractNo }}</text>
          </view>
          <view 
            class="status-badge" 
            :class="item.status"
          >
            <text class="badge-text">{{ getClaimStatusLabel(item.status) }}</text>
          </view>
        </view>

        <view class="card-body">
          <view class="claim-info">
            <view class="amount-row">
              <text class="amount-label">认领金额</text>
              <text class="amount-value">{{ item.currency }} {{ formatAmount(item.amount) }}</text>
            </view>
            <view class="purpose-row">
              <text class="purpose-label">认领用途</text>
              <text class="purpose-value">{{ item.purpose }}</text>
            </view>
            <view class="meta-row">
              <text class="meta-item">认领人：{{ item.claimer }}</text>
              <text class="meta-item">{{ formatDate(item.claimedAt) }}</text>
            </view>
          </view>
        </view>

        <view class="card-footer" v-if="item.status === 'pending'">
          <view class="btn-cancel" @click.stop="handleCancelClaim(item)">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn-confirm" @click.stop="handleConfirmClaim(item)">
            <text class="btn-text">确认</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredClaims.length === 0">
        <view class="empty-icon-wrap">
          <text class="empty-icon">{{ activeTab === 'pending' ? '📋' : '✅' }}</text>
        </view>
        <text class="empty-text">{{ activeTab === 'pending' ? '暂无待确认的认领' : '暂无已确认的认领' }}</text>
      </view>
    </view>

    <view class="contract-list" v-if="activeTab === 'contracts'">
      <view 
        class="contract-card" 
        v-for="contract in availableContracts" 
        :key="contract.id"
        @click="handleContractClick(contract)"
      >
        <view class="card-header">
          <view class="contract-info">
            <text class="contract-title">{{ contract.title }}</text>
            <text class="contract-no">{{ contract.contractNo }}</text>
          </view>
          <view class="type-badge" :class="contract.type">
            <text class="badge-text">{{ getContractTypeLabel(contract.type) }}</text>
          </view>
        </view>

        <view class="card-body">
          <view class="amount-section">
            <view class="total-amount">
              <text class="label">合同金额</text>
              <text class="value">{{ contract.currency }} {{ formatAmount(contract.amount) }}</text>
            </view>
            <view class="claimed-amount">
              <text class="label">已认领</text>
              <text class="value">{{ contract.currency }} {{ formatAmount(contract.claimedAmount) }}</text>
            </view>
          </view>
          
          <view class="progress-bar">
            <view class="progress-track">
              <view 
                class="progress-fill" 
                :style="{ width: getClaimProgress(contract) + '%' }"
              ></view>
            </view>
            <text class="progress-text">{{ getClaimProgress(contract) }}%</text>
          </view>

          <view class="remaining-amount">
            <text class="label">可认领金额</text>
            <text class="value highlight">{{ contract.currency }} {{ formatAmount(contract.amount - contract.claimedAmount) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="btn-claim" @click.stop="handleAddClaim(contract)">
            <text class="btn-icon">+</text>
            <text class="btn-text">发起认领</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="availableContracts.length === 0">
        <view class="empty-icon-wrap">
          <text class="empty-icon">📄</text>
        </view>
        <text class="empty-text">暂无可认领的合同</text>
      </view>
    </view>

    <view class="claim-modal" v-if="showClaimModal" @click="showClaimModal = false">
      <view class="modal-mask" @click="showClaimModal = false"></view>
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发起金额认领</text>
          <view class="modal-close" @click="showClaimModal = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="contract-info-card" v-if="selectedContract">
            <text class="contract-title-text">{{ selectedContract.title }}</text>
            <view class="contract-meta">
              <text class="contract-no-text">{{ selectedContract.contractNo }}</text>
              <text class="contract-remaining">可认领：{{ selectedContract.currency }} {{ formatAmount(selectedContract.amount - selectedContract.claimedAmount) }}</text>
            </view>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">认领金额</text>
              <text class="required">*</text>
            </view>
            <view class="amount-input-wrap">
              <view class="currency-label">{{ selectedContract?.currency }}</view>
              <input 
                class="amount-input" 
                type="digit" 
                v-model="claimAmount" 
                placeholder="0.00"
              />
            </view>
            <text class="error-text" v-if="errors.amount">{{ errors.amount }}</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">认领用途</text>
              <text class="required">*</text>
            </view>
            <textarea 
              class="purpose-input" 
              v-model="claimPurpose" 
              placeholder="请输入认领用途，如：项目结算、费用报销等"
              :maxlength="200"
            />
            <text class="error-text" v-if="errors.purpose">{{ errors.purpose }}</text>
            <view class="textarea-footer">
              <text class="textarea-count">{{ claimPurpose.length }}/200</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showClaimModal = false">取消</view>
          <view class="btn-submit" @click="handleSubmitClaim">确认认领</view>
        </view>
      </view>
    </view>

    <view class="confirm-modal" v-if="showConfirmModal" @click="showConfirmModal = false">
      <view class="modal-mask" @click="showConfirmModal = false"></view>
      <view class="modal-content small" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ confirmAction === 'confirm' ? '确认认领' : '取消认领' }}</text>
        </view>
        <view class="modal-body">
          <text class="confirm-text">
            {{ confirmAction === 'confirm' ? '确认此认领记录？' : '请输入取消原因' }}
          </text>
          <textarea 
            v-if="confirmAction === 'cancel'"
            class="reason-input" 
            v-model="cancelReason" 
            placeholder="请输入取消原因"
            :maxlength="200"
          />
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showConfirmModal = false">取消</view>
          <view class="btn-submit" :class="{ danger: confirmAction === 'cancel' }" @click="executeConfirm">
            {{ confirmAction === 'confirm' ? '确认' : '确定取消' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContractStore } from '@/stores/contract'
import { getContractTypeLabel, getClaimStatusLabel } from '@/types/contract'
import type { Contract, Claim } from '@/types/contract'

const contractStore = useContractStore()

const activeTab = ref<'pending' | 'confirmed' | 'contracts'>('pending')
const showClaimModal = ref(false)
const showConfirmModal = ref(false)
const confirmAction = ref<'confirm' | 'cancel'>('confirm')
const selectedContract = ref<Contract | null>(null)
const claimAmount = ref('')
const claimPurpose = ref('')
const cancelReason = ref('')
const currentClaim = ref<(Claim & { contract: Contract }) | null>(null)

const errors = ref<Record<string, string>>({})

const pendingClaims = computed(() => contractStore.pendingClaims)
const confirmedClaims = computed(() => contractStore.confirmedClaims)

const availableContracts = computed(() => {
  return contractStore.contracts.filter(c => 
    c.status === 'active' && c.amount > c.claimedAmount
  ).sort((a, b) => (b.amount - b.claimedAmount) - (a.amount - a.claimedAmount))
})

const filteredClaims = computed(() => {
  if (activeTab.value === 'pending') {
    return pendingClaims.value
  }
  return confirmedClaims.value
})

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getClaimProgress(contract: Contract): number {
  if (contract.amount === 0) return 0
  return Math.round((contract.claimedAmount / contract.amount) * 100)
}

function handleClaimClick(item: Claim & { contract: Contract }) {
}

function handleContractClick(contract: Contract) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${contract.id}`
  })
}

function handleAddClaim(contract: Contract) {
  selectedContract.value = contract
  claimAmount.value = ''
  claimPurpose.value = ''
  errors.value = {}
  showClaimModal.value = true
}

function validateClaim(): boolean {
  errors.value = {}
  
  if (!claimAmount.value) {
    errors.value.amount = '请输入认领金额'
  } else if (isNaN(parseFloat(claimAmount.value))) {
    errors.value.amount = '请输入有效的金额'
  } else if (selectedContract.value && parseFloat(claimAmount.value) > selectedContract.value.amount - selectedContract.value.claimedAmount) {
    errors.value.amount = '认领金额不能超过可认领金额'
  } else if (parseFloat(claimAmount.value) <= 0) {
    errors.value.amount = '认领金额必须大于0'
  }
  
  if (!claimPurpose.value.trim()) {
    errors.value.purpose = '请输入认领用途'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmitClaim() {
  if (!validateClaim() || !selectedContract.value) return
  
  try {
    contractStore.addClaim(selectedContract.value.id, parseFloat(claimAmount.value), claimPurpose.value)
    uni.showToast({ title: '认领成功', icon: 'success' })
    showClaimModal.value = false
    selectedContract.value = null
    claimAmount.value = ''
    claimPurpose.value = ''
  } catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

function handleConfirmClaim(item: Claim & { contract: Contract }) {
  currentClaim.value = item
  confirmAction.value = 'confirm'
  showConfirmModal.value = true
}

function handleCancelClaim(item: Claim & { contract: Contract }) {
  currentClaim.value = item
  confirmAction.value = 'cancel'
  cancelReason.value = ''
  showConfirmModal.value = true
}

function executeConfirm() {
  if (!currentClaim.value) return
  
  if (confirmAction.value === 'cancel' && !cancelReason.value.trim()) {
    uni.showToast({ title: '请输入取消原因', icon: 'none' })
    return
  }
  
  try {
    if (confirmAction.value === 'confirm') {
      contractStore.confirmClaim(currentClaim.value.contractId, currentClaim.value.id)
      uni.showToast({ title: '确认成功', icon: 'success' })
    } else {
      contractStore.cancelClaim(currentClaim.value.contractId, currentClaim.value.id, cancelReason.value)
      uni.showToast({ title: '已取消', icon: 'success' })
    }
    showConfirmModal.value = false
    currentClaim.value = null
    cancelReason.value = ''
  } catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  position: relative;
  padding: 48rpx 32rpx;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
}

.header-content {
  position: relative;
}

.header-title-section {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.title-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-icon {
  font-size: 44rpx;
}

.title-text {
  flex: 1;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.tabs-panel {
  display: flex;
  margin: -32rpx 24rpx 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  position: relative;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &.active {
    background: rgba(37, 99, 235, 0.06);
  }
}

.tab-content {
  text-align: center;
}

.tab-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 4rpx;

  .active & {
    color: #2563eb;
  }
}

.tab-label {
  font-size: 24rpx;
  color: #6b7280;

  .active & {
    color: #2563eb;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 3rpx;
}

.claim-list, .contract-list {
  padding: 0 24rpx;
}

.claim-card, .contract-card {
  position: relative;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f3f4f6;
  overflow: hidden;

  &:active {
    background: #f9fafb;
    transform: scale(0.995);
  }
}

.card-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;

  &.pending {
    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
  }

  &.confirmed {
    background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%);
  }

  &.cancelled {
    background: linear-gradient(90deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.contract-info {
  flex: 1;
  margin-right: 16rpx;
}

.contract-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 8rpx;
}

.contract-no {
  font-size: 24rpx;
  color: #9ca3af;
  font-family: monospace;
}

.status-badge, .type-badge {
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge {
  &.pending {
    background: rgba(245, 158, 11, 0.08);
    color: #f59e0b;
  }

  &.confirmed {
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
  }

  &.cancelled {
    background: rgba(107, 114, 128, 0.08);
    color: #6b7280;
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

.card-body {
  padding: 20rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.claim-info {
}

.amount-row, .purpose-row, .meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.amount-label, .purpose-label {
  font-size: 26rpx;
  color: #6b7280;
}

.amount-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #2563eb;
}

.purpose-value {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 500;
}

.meta-row {
  gap: 24rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #9ca3af;
}

.amount-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.total-amount, .claimed-amount, .remaining-amount {
  flex: 1;
}

.total-amount, .claimed-amount {
  text-align: center;
}

.total-amount {
  border-right: 1rpx solid #e5e7eb;
}

.total-amount .label, .claimed-amount .label, .remaining-amount .label {
  font-size: 24rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 8rpx;
}

.total-amount .value {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.claimed-amount .value {
  font-size: 32rpx;
  font-weight: 600;
  color: #f59e0b;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.progress-track {
  flex: 1;
  height: 12rpx;
  background: #e5e7eb;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 26rpx;
  color: #6b7280;
  font-weight: 500;
  min-width: 60rpx;
  text-align: right;
}

.remaining-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #e5e7eb;
}

.remaining-amount .label {
  margin-bottom: 0;
}

.remaining-amount .value {
  font-size: 32rpx;
  font-weight: 700;

  &.highlight {
    color: #10b981;
  }
}

.card-footer {
  display: flex;
  gap: 16rpx;
}

.btn-cancel, .btn-confirm, .btn-claim {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;

  &:active {
    background: #e5e7eb;
  }
}

.btn-confirm {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
}

.btn-claim {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #ffffff;
  gap: 8rpx;

  .btn-icon {
    font-size: 32rpx;
  }
}

.empty-state {
  text-align: center;
  padding: 80rpx 48rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.claim-modal, .confirm-modal {
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
  max-height: 85vh;
  overflow-y: auto;

  &.small {
    max-height: 60vh;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
  position: sticky;
  top: 0;
  background: #ffffff;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
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

.contract-info-card {
  padding: 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.contract-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 12rpx;
}

.contract-meta {
  display: flex;
  justify-content: space-between;
}

.contract-no-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.contract-remaining {
  font-size: 24rpx;
  color: #10b981;
  font-weight: 500;
}

.form-item {
  margin-bottom: 28rpx;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 14rpx;
}

.form-label {
  font-size: 28rpx;
  color: #4b5563;
  font-weight: 500;
}

.required {
  font-size: 28rpx;
  color: #ef4444;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  height: 96rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 0 8rpx;
  border: 2rpx solid #e5e7eb;
  transition: all 0.2s ease;
}

.currency-label {
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #6b7280;
  font-weight: 500;
}

.amount-input {
  flex: 1;
  font-size: 36rpx;
  background: transparent;
  color: #1f2937;
  font-weight: 600;
}

.error-text {
  font-size: 24rpx;
  color: #ef4444;
  margin-top: 10rpx;
  display: block;
}

.purpose-input {
  width: 100%;
  height: 160rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 1rpx solid #e5e7eb;
  transition: all 0.2s ease;

  &:focus {
    border-color: #2563eb;
    background: #ffffff;
  }
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.textarea-count {
  font-size: 24rpx;
  color: #9ca3af;
}

.confirm-text {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 24rpx;
  display: block;
}

.reason-input {
  width: 100%;
  height: 160rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 1rpx solid #e5e7eb;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  border-top: 1rpx solid #f3f4f6;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}

.btn-submit {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
  }

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
    box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.25);
  }
}
</style>