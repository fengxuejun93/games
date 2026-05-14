<template>
  <view class="page" v-if="contract">
    <scroll-view class="detail-scroll" scroll-y>
      <view class="detail-header">
        <view class="header-info">
          <text class="contract-title">{{ contract.title }}</text>
          <text class="contract-no">{{ contract.contractNo }}</text>
        </view>
        <view class="header-tags">
          <view class="type-tag" :style="{ backgroundColor: typeColor + '20', color: typeColor }">
            {{ typeLabel }}
          </view>
          <view class="status-tag" :style="{ backgroundColor: statusColor + '20', color: statusColor }">
            {{ statusLabel }}
          </view>
          <view class="approval-tag" :style="{ backgroundColor: approvalStatusColor + '20', color: approvalStatusColor }">
            {{ approvalStatusLabel }}
          </view>
        </view>
      </view>

      <view class="approval-section" v-if="contract.approvalFlow.nodes.length > 0">
        <view class="approval-header">
          <text class="approval-title">审批进度</text>
          <text class="approval-percent">{{ approvalProgress }}%</text>
        </view>
        <view class="approval-flow">
          <view 
            class="approval-node" 
            v-for="(node, index) in contract.approvalFlow.nodes" 
            :key="node.id"
            :class="{ 
              completed: index < contract.approvalFlow.currentNode,
              current: index === contract.approvalFlow.currentNode,
              pending: index > contract.approvalFlow.currentNode
            }"
          >
            <view class="node-circle">
              <text v-if="index < contract.approvalFlow.currentNode">✓</text>
              <text v-else-if="index === contract.approvalFlow.currentNode">{{ index + 1 }}</text>
              <text v-else>{{ index + 1 }}</text>
            </view>
            <text class="node-name">{{ node.name }}</text>
            <view class="node-line" v-if="index < contract.approvalFlow.nodes.length - 1"></view>
          </view>
        </view>
      </view>

      <view class="detail-card" v-if="contract.approvalFlow.history.length > 0">
        <text class="card-title">审批记录</text>
        <view class="history-list">
          <view class="history-item" v-for="record in contract.approvalFlow.history" :key="record.id">
            <view class="history-header">
              <view class="history-node">
                <text class="node-name-text">{{ record.nodeName }}</text>
                <view class="action-badge" :class="record.action">
                  {{ getActionLabel(record.action) }}
                </view>
              </view>
              <text class="history-time">{{ formatDate(record.operatedAt) }}</text>
            </view>
            <view class="history-body">
              <text class="history-operator">操作人：{{ record.operator }}</text>
              <text class="history-comment" v-if="record.comment">{{ record.comment }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="detail-card">
        <view class="card-section">
          <text class="section-title">合同金额</text>
          <view class="amount-display">
            <text class="amount-symbol">{{ contract.currency }}</text>
            <text class="amount-value">{{ formatAmount(contract.amount) }}</text>
          </view>
        </view>
      </view>

      <view class="detail-card">
        <text class="card-title">双方信息</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">甲方</text>
            <text class="info-value">{{ contract.partyA }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">乙方</text>
            <text class="info-value">{{ contract.partyB }}</text>
          </view>
        </view>
      </view>

      <view class="detail-card">
        <text class="card-title">时间信息</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">签订日期</text>
            <text class="info-value">{{ contract.signingDate || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">开始日期</text>
            <text class="info-value">{{ contract.startDate }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">结束日期</text>
            <text class="info-value" :class="{ expiring: isExpiring }">{{ contract.endDate }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">剩余天数</text>
            <text class="info-value" :class="{ expiring: daysRemaining <= 30 }">{{ daysRemaining > 0 ? daysRemaining + ' 天' : '已到期' }}</text>
          </view>
        </view>
      </view>

      <view class="detail-card">
        <text class="card-title">合同描述</text>
        <text class="description-text">{{ contract.description || '暂无描述' }}</text>
      </view>

      <view class="detail-card" v-if="contract.attachments.length > 0">
        <text class="card-title">附件列表</text>
        <view class="attachment-list">
          <view class="attachment-item" v-for="file in contract.attachments" :key="file.id" @click="previewFile(file)">
            <view class="attachment-icon">{{ getFileIcon(file.type) }}</view>
            <view class="attachment-info">
              <text class="attachment-name">{{ file.name }}</text>
              <text class="attachment-meta">{{ formatFileSize(file.size) }} | {{ file.uploadedAt }}</text>
            </view>
            <text class="preview-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="detail-card" v-if="contract.versions.length > 0">
        <text class="card-title">版本记录</text>
        <view class="version-list">
          <view class="version-item" v-for="(version, index) in contract.versions" :key="version.id">
            <view class="version-header">
              <text class="version-tag" :class="{ latest: index === contract.versions.length - 1 }">
                {{ version.version }}
                <text v-if="index === contract.versions.length - 1" class="latest-badge">最新</text>
              </text>
              <text class="version-date">{{ formatDate(version.updatedAt) }}</text>
            </view>
            <view class="version-body">
              <text class="version-content">{{ version.content }}</text>
              <text class="version-author">更新人：{{ version.updatedBy }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="detail-footer">
      <view class="footer-btn secondary" @click="handleEdit" v-if="canEdit">编辑</view>
      <view class="footer-btn primary" @click="handleSubmitApproval" v-if="canSubmit">提交审批</view>
      <view class="footer-btn primary" @click="openActionModal('approve')" v-if="canApprove">同意</view>
      <view class="footer-btn danger" @click="openActionModal('reject')" v-if="canReject">驳回</view>
      <view class="footer-btn secondary" @click="openActionModal('withdraw')" v-if="canWithdraw">撤回</view>
      <view class="footer-btn secondary" @click="handleArchive" v-if="contract.status === 'active'">归档</view>
      <view class="footer-btn secondary" @click="handleCancel" v-if="canCancel">作废</view>
      <view class="footer-btn secondary" @click="handleUnarchive" v-if="contract.status === 'archived'">取消归档</view>
      <view class="footer-btn danger" @click="handleDelete">删除</view>
    </view>

    <view class="preview-modal" v-if="previewFileData" @click="previewFileData = null">
      <view class="preview-content" @click.stop>
        <view class="preview-header">
          <text class="preview-title">{{ previewFileData.name }}</text>
          <text class="preview-close" @click="previewFileData = null">✕</text>
        </view>
        <view class="preview-body">
          <view class="preview-icon">📄</view>
          <text class="preview-info">文件预览</text>
          <text class="preview-hint">点击空白处关闭</text>
        </view>
      </view>
    </view>

    <view class="action-modal" v-if="showActionModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ actionType === 'approve' ? '同意审批' : actionType === 'reject' ? '驳回审批' : '撤回审批' }}</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="modal-contract">
            <text class="modal-title-text">{{ contract?.title }}</text>
          </view>
          <view class="comment-section">
            <text class="comment-label">{{ actionType === 'reject' ? '驳回原因（必填）' : '审批意见（选填）' }}</text>
            <textarea 
              class="comment-input" 
              v-model="comment" 
              :placeholder="actionType === 'reject' ? '请输入驳回原因...' : '请输入审批意见...'"
              :maxlength="500"
            />
            <text class="comment-count">{{ comment.length }}/500</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="closeModal">取消</view>
          <view class="btn-confirm" :class="{ reject: actionType === 'reject' }" @click="submitAction">
            {{ actionType === 'approve' ? '同意' : actionType === 'reject' ? '驳回' : '撤回' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { useContractStore } from '@/stores/contract'
import { getContractTypeLabel, getContractTypeColor, getContractStatusLabel, getContractStatusColor, getApprovalStatusLabel, getApprovalStatusColor } from '@/types/contract'
import type { Contract, Attachment, ApprovalAction } from '@/types/contract'

const contractStore = useContractStore()

const contract = ref<Contract | null>(null)
const previewFileData = ref<Attachment | null>(null)
const showActionModal = ref(false)
const actionType = ref<'approve' | 'reject' | 'withdraw'>('approve')
const comment = ref('')

const typeLabel = computed(() => contract.value ? getContractTypeLabel(contract.value.type) : '')
const typeColor = computed(() => contract.value ? getContractTypeColor(contract.value.type) : '#999999')
const statusLabel = computed(() => contract.value ? getContractStatusLabel(contract.value.status) : '')
const statusColor = computed(() => contract.value ? getContractStatusColor(contract.value.status) : '#999999')
const approvalStatusLabel = computed(() => contract.value ? getApprovalStatusLabel(contract.value.approvalStatus) : '')
const approvalStatusColor = computed(() => contract.value ? getApprovalStatusColor(contract.value.approvalStatus) : '#999999')

const approvalProgress = computed(() => {
  if (!contract.value) return 0
  const total = contract.value.approvalFlow.nodes.length
  const current = contract.value.approvalFlow.currentNode
  return Math.round((current / total) * 100)
})

function getActionLabel(action: ApprovalAction): string {
  const labels: Record<ApprovalAction, string> = {
    approve: '同意',
    reject: '驳回',
    transfer: '转交',
    add_sign: '加签',
    withdraw: '撤回'
  }
  return labels[action] || action
}

const canEdit = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'draft' && contract.value.approvalStatus === 'pending'
})

const canSubmit = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'draft' && contract.value.approvalStatus === 'pending'
})

const canApprove = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'pending_approval' && 
         contract.value.approvalStatus === 'approving' &&
         contract.value.approvalFlow.currentNode > 0 &&
         contract.value.approvalFlow.currentNode < contract.value.approvalFlow.nodes.length
})

const canReject = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'pending_approval' && 
         contract.value.approvalStatus === 'approving'
})

const canWithdraw = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'pending_approval' && 
         contract.value.approvalStatus === 'approving'
})

const canCancel = computed(() => {
  if (!contract.value) return false
  return contract.value.status === 'active' || 
         (contract.value.status === 'draft' && contract.value.approvalStatus !== 'pending')
})

function openActionModal(type: 'approve' | 'reject' | 'withdraw') {
  actionType.value = type
  comment.value = ''
  showActionModal.value = true
}

function closeModal() {
  showActionModal.value = false
  comment.value = ''
}

function submitAction() {
  if (!contract.value) return

  if (actionType.value === 'approve') {
    contractStore.approve(contract.value.id, comment.value)
    uni.showToast({ title: '审批通过', icon: 'success' })
  } else if (actionType.value === 'reject') {
    if (!comment.value.trim()) {
      uni.showToast({ title: '请填写驳回原因', icon: 'none' })
      return
    }
    contractStore.reject(contract.value.id, comment.value)
    uni.showToast({ title: '已驳回', icon: 'success' })
  } else if (actionType.value === 'withdraw') {
    contractStore.withdraw(contract.value.id, comment.value)
    uni.showToast({ title: '已撤回', icon: 'success' })
  }

  closeModal()
  
  setTimeout(() => {
    const data = contractStore.getById(contract.value!.id)
    if (data) {
      contract.value = data
    }
  }, 500)
}

function handleSubmitApproval() {
  if (!contract.value) return
  uni.showModal({
    title: '确认提交审批',
    content: '确定要提交此合同进行审批吗？',
    success: (res) => {
      if (res.confirm) {
        contractStore.submitForApproval(contract.value!.id)
        uni.showToast({ title: '已提交', icon: 'success' })
        setTimeout(() => {
          const data = contractStore.getById(contract.value!.id)
          if (data) {
            contract.value = data
          }
        }, 500)
      }
    }
  })
}

const daysRemaining = computed(() => {
  if (!contract.value) return 0
  const endDate = new Date(contract.value.endDate)
  const now = new Date()
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})

const isExpiring = computed(() => daysRemaining.value > 0 && daysRemaining.value <= 30)

onLoad((options) => {
  if (options?.id) {
    const data = contractStore.getById(options.id)
    if (data) {
      contract.value = data
    }
  }
})

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    zip: '📦',
    rar: '📦'
  }
  return icons[type.toLowerCase()] || '📄'
}

function previewFile(file: Attachment) {
  previewFileData.value = file
}

function handleEdit() {
  if (!contract.value) return
  uni.navigateTo({
    url: `/pages/form/index?id=${contract.value.id}`
  })
}

function handleArchive() {
  if (!contract.value) return
  uni.showModal({
    title: '确认归档',
    content: '确定要将此合同归档吗？',
    success: (res) => {
      if (res.confirm) {
        contractStore.archive(contract.value!.id)
        uni.showToast({ title: '归档成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

function handleUnarchive() {
  if (!contract.value) return
  uni.showModal({
    title: '确认取消归档',
    content: '确定要取消此合同的归档状态吗？',
    success: (res) => {
      if (res.confirm) {
        contractStore.unarchive(contract.value!.id)
        uni.showToast({ title: '已取消归档', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

function handleCancel() {
  if (!contract.value) return
  uni.showModal({
    title: '确认作废',
    content: '确定要将此合同作废吗？此操作不可撤销。',
    success: (res) => {
      if (res.confirm) {
        contractStore.cancel(contract.value!.id)
        uni.showToast({ title: '已作废', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

function handleDelete() {
  if (!contract.value) return
  uni.showModal({
    title: '确认删除',
    content: `确定要删除合同「${contract.value.title}」吗？此操作不可撤销。`,
    success: (res) => {
      if (res.confirm) {
        contractStore.remove(contract.value!.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.detail-scroll {
  height: calc(100vh - 120rpx);
}

.approval-section {
  margin: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.approval-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.approval-percent {
  font-size: 32rpx;
  font-weight: 700;
  color: #4080ff;
}

.approval-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.approval-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.node-circle {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  background: #f5f5f5;
  color: #999999;

  .completed & {
    background: #52c41a;
    color: #ffffff;
  }

  .current & {
    background: #4080ff;
    color: #ffffff;
  }

  .pending & {
    background: #f5f5f5;
    color: #999999;
  }
}

.node-name {
  font-size: 22rpx;
  color: #999999;
  text-align: center;

  .completed & {
    color: #52c41a;
  }

  .current & {
    color: #4080ff;
    font-weight: 600;
  }
}

.node-line {
  position: absolute;
  top: 32rpx;
  left: 50%;
  width: calc(100% + 8rpx);
  height: 4rpx;
  background: #f5f5f5;

  .completed & {
    background: #52c41a;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.history-node {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.node-name-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.action-badge {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.approve {
    background: #f6ffed;
    color: #52c41a;
  }

  &.reject {
    background: #fff1f0;
    color: #ff4d4f;
  }

  &.transfer {
    background: #fff7e6;
    color: #faad14;
  }

  &.add_sign {
    background: #f0f5ff;
    color: #4080ff;
  }

  &.withdraw {
    background: #f5f5f5;
    color: #999999;
  }
}

.history-time {
  font-size: 24rpx;
  color: #999999;
}

.history-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-operator {
  font-size: 24rpx;
  color: #666666;
}

.history-comment {
  font-size: 26rpx;
  color: #333333;
  padding-top: 8rpx;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 8rpx;
}

.detail-header {
  background: #4080ff;
  padding: 32rpx;
  color: #ffffff;
}

.header-info {
  margin-bottom: 20rpx;
}

.contract-title {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.contract-no {
  font-size: 24rpx;
  opacity: 0.8;
}

.header-tags {
  display: flex;
  gap: 16rpx;
}

.type-tag, .status-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.detail-card {
  background: #ffffff;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
}

.card-section {
  text-align: center;
  padding: 24rpx 0;
}

.section-title {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
  display: block;
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
}

.amount-symbol {
  font-size: 32rpx;
  color: #4080ff;
}

.amount-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #4080ff;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid #4080ff;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
}

.info-item {
  width: 50%;
  margin-bottom: 20rpx;
}

.info-label {
  font-size: 24rpx;
  color: #999999;
  display: block;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333333;

  &.expiring {
    color: #faad14;
  }
}

.description-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.attachment-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 28rpx;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.attachment-meta {
  font-size: 24rpx;
  color: #999999;
}

.preview-arrow {
  font-size: 32rpx;
  color: #999999;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.version-item {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.version-tag {
  font-size: 26rpx;
  font-weight: 600;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 8rpx;

  &.latest {
    color: #4080ff;
  }
}

.latest-badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  background: #4080ff;
  color: #ffffff;
  border-radius: 12rpx;
  font-weight: normal;
}

.version-date {
  font-size: 24rpx;
  color: #999999;
}

.version-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-content {
  font-size: 26rpx;
  color: #333333;
}

.version-author {
  font-size: 24rpx;
  color: #999999;
}

.detail-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.footer-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36rpx;
  font-size: 28rpx;

  &.secondary {
    background: #f5f5f5;
    color: #666666;
  }

  &.primary {
    background: #4080ff;
    color: #ffffff;
  }

  &.danger {
    background: #ff4d4f;
    color: #ffffff;
  }
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  width: 80%;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.preview-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.preview-close {
  font-size: 32rpx;
  color: #999999;
}

.preview-body {
  padding: 80rpx 48rpx;
  text-align: center;
}

.preview-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.preview-info {
  font-size: 32rpx;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.preview-hint {
  font-size: 24rpx;
  color: #999999;
}

.action-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
}

.modal-close {
  font-size: 32rpx;
  color: #999999;
}

.modal-body {
  padding: 32rpx;
}

.modal-contract {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.modal-title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.comment-section {
  display: flex;
  flex-direction: column;
}

.comment-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.comment-input {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.comment-count {
  align-self: flex-end;
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666666;
}

.btn-confirm {
  background: #4080ff;
  color: #ffffff;

  &.reject {
    background: #ff4d4f;
  }
}
</style>