<template>
  <view class="page">
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title-section">
          <text class="page-title">审批中心</text>
          <text class="page-subtitle">处理合同审批流程</text>
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
          <text class="tab-value">{{ pendingCount }}</text>
          <text class="tab-label">待我审批</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'pending'"></view>
      </view>
      
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'processing' }"
        @click="activeTab = 'processing'"
      >
        <view class="tab-content">
          <text class="tab-value">{{ processingCount }}</text>
          <text class="tab-label">审批中</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'processing'"></view>
      </view>
      
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <view class="tab-content">
          <text class="tab-value">{{ historyCount }}</text>
          <text class="tab-label">已处理</text>
        </view>
        <view class="tab-indicator" v-if="activeTab === 'history'"></view>
      </view>
    </view>

    <view class="approval-list">
      <view 
        class="approval-card" 
        v-for="contract in filteredContracts" 
        :key="contract.id"
        @click="handleContractClick(contract)"
      >
        <view class="card-glow" :class="contract.approvalStatus"></view>
        
        <view class="card-header">
          <view class="contract-info">
            <text class="contract-title">{{ contract.title }}</text>
            <text class="contract-meta">{{ contract.contractNo }} | {{ getContractTypeLabel(contract.type) }}</text>
          </view>
          <view 
            class="approval-status-badge" 
            :class="contract.approvalStatus"
          >
            <text class="badge-dot"></text>
            <text class="badge-text">{{ getApprovalStatusLabel(contract.approvalStatus) }}</text>
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <view class="amount-info">
              <text class="amount-label">合同金额</text>
              <text class="amount-value">{{ contract.currency }} {{ formatAmount(contract.amount) }}</text>
            </view>
            <view class="parties-info">
              <text class="party">{{ contract.partyA }}</text>
              <view class="party-arrow">→</view>
              <text class="party">{{ contract.partyB }}</text>
            </view>
          </view>
        </view>

        <view class="card-footer">
          <view class="flow-info">
            <view class="flow-progress">
              <view class="progress-track">
                <view 
                  class="progress-fill" 
                  :style="{ width: getApprovalProgress(contract) + '%' }"
                ></view>
                <view class="progress-nodes">
                  <view 
                    class="node" 
                    v-for="(node, index) in contract.approvalFlow.nodes" 
                    :key="index"
                    :class="{ 
                      completed: index < contract.approvalFlow.currentNode,
                      current: index === contract.approvalFlow.currentNode,
                      pending: index > contract.approvalFlow.currentNode
                    }"
                  >
                    <view class="node-dot"></view>
                    <text class="node-label">{{ node.name }}</text>
                  </view>
                </view>
              </view>
              <view class="progress-meta">
                <text class="current-node">当前：{{ getCurrentNodeName(contract) }}</text>
                <text class="progress-percent">{{ getApprovalProgress(contract) }}%</text>
              </view>
            </view>
          </view>
          
          <view class="action-buttons" v-if="canApprove(contract)">
            <view class="btn-reject" @click.stop="handleReject(contract)">
              <text class="btn-icon">✕</text>
              <text class="btn-text">驳回</text>
            </view>
            <view class="btn-approve" @click.stop="handleApprove(contract)">
              <text class="btn-icon">✓</text>
              <text class="btn-text">同意</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredContracts.length === 0">
        <view class="empty-icon-wrap" :class="activeTab">
          <text class="empty-icon">{{ activeTab === 'pending' ? '✅' : activeTab === 'processing' ? '🔄' : '📋' }}</text>
        </view>
        <text class="empty-text">{{ getEmptyText() }}</text>
      </view>
    </view>

    <view class="action-modal" v-if="showActionModal">
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ actionType === 'approve' ? '同意审批' : '驳回审批' }}</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="modal-contract-card">
            <text class="contract-title-text">{{ currentContract?.title }}</text>
            <text class="contract-no-text">{{ currentContract?.contractNo }}</text>
          </view>
          <view class="comment-section">
            <view class="comment-header">
              <text class="comment-label">{{ actionType === 'reject' ? '驳回原因（必填）' : '审批意见（选填）' }}</text>
              <text class="comment-required" v-if="actionType === 'reject'">*</text>
            </view>
            <textarea 
              class="comment-input" 
              v-model="comment" 
              :placeholder="actionType === 'reject' ? '请输入驳回原因...' : '请输入审批意见...'"
              :maxlength="500"
              :focus="showActionModal"
            />
            <view class="comment-footer">
              <text class="comment-count">{{ comment.length }}/500</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="closeModal">取消</view>
          <view class="btn-confirm" :class="{ reject: actionType === 'reject' }" @click="submitAction">
            {{ actionType === 'approve' ? '同意' : '驳回' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContractStore } from '@/stores/contract'
import { getContractTypeLabel, getApprovalStatusLabel } from '@/types/contract'
import type { Contract } from '@/types/contract'

const contractStore = useContractStore()

const activeTab = ref<'pending' | 'processing' | 'history'>('pending')
const showActionModal = ref(false)
const actionType = ref<'approve' | 'reject'>('approve')
const currentContract = ref<Contract | null>(null)
const comment = ref('')

const pendingContracts = computed(() => 
  contractStore.contracts.filter(c => 
    c.status === 'pending_approval' && 
    c.approvalStatus === 'approving' &&
    c.approvalFlow.currentNode > 0 &&
    c.approvalFlow.currentNode < c.approvalFlow.nodes.length
  )
)

const processingContracts = computed(() => 
  contractStore.contracts.filter(c => 
    c.status === 'pending_approval' && 
    c.approvalStatus === 'approving'
  )
)

const historyContracts = computed(() => 
  contractStore.contracts.filter(c => 
    c.approvalStatus === 'approved' || 
    c.approvalStatus === 'rejected' || 
    c.approvalStatus === 'withdrawn'
  )
)

const pendingCount = computed(() => pendingContracts.value.length)
const processingCount = computed(() => processingContracts.value.length)
const historyCount = computed(() => historyContracts.value.length)

const filteredContracts = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return pendingContracts.value
    case 'processing':
      return processingContracts.value
    case 'history':
      return historyContracts.value
    default:
      return []
  }
})

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN')
}

function getCurrentNodeName(contract: Contract): string {
  const index = contract.approvalFlow.currentNode
  if (index < contract.approvalFlow.nodes.length) {
    return contract.approvalFlow.nodes[index].name
  }
  return '已完成'
}

function getApprovalProgress(contract: Contract): number {
  const total = contract.approvalFlow.nodes.length
  const current = contract.approvalFlow.currentNode
  return Math.round((current / total) * 100)
}

function canApprove(contract: Contract): boolean {
  return activeTab.value === 'pending' && 
         contract.status === 'pending_approval' &&
         contract.approvalStatus === 'approving'
}

function getEmptyText(): string {
  switch (activeTab.value) {
    case 'pending':
      return '暂无待审批的合同'
    case 'processing':
      return '暂无审批中的合同'
    case 'history':
      return '暂无已处理的合同'
    default:
      return ''
  }
}

function handleContractClick(contract: Contract) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${contract.id}`
  })
}

function handleApprove(contract: Contract) {
  actionType.value = 'approve'
  currentContract.value = contract
  comment.value = ''
  showActionModal.value = true
}

function handleReject(contract: Contract) {
  actionType.value = 'reject'
  currentContract.value = contract
  comment.value = ''
  showActionModal.value = true
}

function closeModal() {
  showActionModal.value = false
  currentContract.value = null
  comment.value = ''
}

function submitAction() {
  if (!currentContract.value) return

  if (actionType.value === 'approve') {
    contractStore.approve(currentContract.value.id, comment.value)
    uni.showToast({ title: '审批通过', icon: 'success' })
  } else {
    if (!comment.value.trim()) {
      uni.showToast({ title: '请填写驳回原因', icon: 'none' })
      return
    }
    contractStore.reject(currentContract.value.id, comment.value)
    uni.showToast({ title: '已驳回', icon: 'success' })
  }

  closeModal()
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
  flex-direction: column;
  gap: 10rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
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
  font-size: 44rpx;
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

.approval-list {
  padding: 0 24rpx;
}

.approval-card {
  position: relative;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f3f4f6;
  transition: all 0.3s ease;
  overflow: hidden;

  &:active {
    background: #f9fafb;
    transform: scale(0.995);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.approving {
      background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
      opacity: 1;
    }

    &.approved {
      background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%);
      opacity: 1;
    }

    &.rejected {
      background: linear-gradient(90deg, #ef4444 0%, #f87171 50%, #ef4444 100%);
      opacity: 1;
    }
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

.contract-meta {
  font-size: 24rpx;
  color: #9ca3af;
}

.approval-status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 500;

  .badge-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
  }

  &.pending, &.approving {
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

  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    .badge-dot { background: #ef4444; }
  }

  &.withdrawn {
    background: rgba(156, 163, 175, 0.08);
    color: #9ca3af;
    .badge-dot { background: #9ca3af; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-body {
  padding: 20rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-info {
  flex: 1;
}

.amount-label {
  font-size: 24rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 6rpx;
}

.amount-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #2563eb;
}

.parties-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-left: 24rpx;
  border-left: 1rpx solid #e5e7eb;
}

.party {
  font-size: 24rpx;
  color: #4b5563;
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.party-arrow {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 50%;
  font-size: 18rpx;
  color: #6b7280;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.flow-info {
  flex: 1;
  margin-right: 20rpx;
}

.flow-progress {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.progress-track {
  position: relative;
}

.progress-fill {
  height: 8rpx;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-nodes {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: -8rpx;
  left: 0;
  right: 0;
}

.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .node-dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    border: 3rpx solid #e5e7eb;
    background: #ffffff;
  }

  .node-label {
    font-size: 20rpx;
    color: #9ca3af;
    white-space: nowrap;
  }

  &.completed {
    .node-dot {
      background: #10b981;
      border-color: #10b981;
    }
    .node-label {
      color: #10b981;
    }
  }

  &.current {
    .node-dot {
      background: #2563eb;
      border-color: #2563eb;
      box-shadow: 0 0 0 6rpx rgba(37, 99, 235, 0.1);
    }
    .node-label {
      color: #2563eb;
      font-weight: 500;
    }
  }

  &.pending {
    .node-dot {
      background: #f3f4f6;
      border-color: #e5e7eb;
    }
  }
}

.progress-meta {
  display: flex;
  justify-content: space-between;
}

.current-node {
  font-size: 22rpx;
  color: #6b7280;
}

.progress-percent {
  font-size: 22rpx;
  color: #2563eb;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn-reject, .btn-approve {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 28rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.btn-reject {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;

  &:active {
    background: rgba(239, 68, 68, 0.15);
  }
}

.btn-approve {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;

  &:active {
    background: rgba(37, 99, 235, 0.15);
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;

  &.pending {
    background: rgba(245, 158, 11, 0.08);
  }

  &.processing {
    background: rgba(37, 99, 235, 0.08);
  }

  &.history {
    background: rgba(16, 185, 129, 0.08);
  }
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.action-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 640rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #e5e7eb;
  }

  .close-icon {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.modal-body {
  padding: 32rpx;
}

.modal-contract-card {
  padding: 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.contract-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 8rpx;
}

.contract-no-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.comment-section {
  display: flex;
  flex-direction: column;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.comment-label {
  font-size: 28rpx;
  color: #4b5563;
  font-weight: 500;
}

.comment-required {
  font-size: 28rpx;
  color: #ef4444;
}

.comment-input {
  width: 100%;
  height: 200rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #e5e7eb;
  transition: all 0.2s ease;

  &:focus {
    border-color: #2563eb;
    background: #ffffff;
  }
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.comment-count {
  font-size: 24rpx;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f3f4f6;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  transition: all 0.2s ease;
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

  &.reject {
    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>