<template>
  <view class="container">
    <view v-if="application" class="detail-content">
      <view class="status-bar">
        <view 
          class="status-tag" 
          :style="{ backgroundColor: getStatusColor(application.status) }"
        >
          {{ getStatusLabel(application.status) }}
        </view>
      </view>

      <view class="info-section">
        <view class="section-header">
          <text class="section-title">申领人信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="label">申领人</text>
            <text class="value">{{ application.applicant }}</text>
          </view>
          <view class="info-row">
            <text class="label">部门</text>
            <text class="value">{{ application.department }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间</text>
            <text class="value">{{ application.createdAt }}</text>
          </view>
          <view class="info-row">
            <text class="label">更新时间</text>
            <text class="value">{{ application.updatedAt }}</text>
          </view>
        </view>
      </view>

      <view class="info-section">
        <view class="section-header">
          <text class="section-title">申领物品</text>
          <text class="item-count">共{{ application.items.length }}件</text>
        </view>
        
        <view v-for="(item, index) in application.items" :key="index" class="item-card">
          <view class="item-header">
            <text class="item-number">物品{{ index + 1 }}</text>
          </view>
          <view class="item-body">
            <view class="info-row">
              <text class="label">物品名称</text>
              <text class="value">{{ item.supplyName }}</text>
            </view>
            <view class="info-row">
              <text class="label">规格型号</text>
              <text class="value">{{ item.spec }}</text>
            </view>
            <view class="info-row">
              <text class="label">单位</text>
              <text class="value">{{ item.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">申领数量</text>
              <text class="value">{{ item.quantity }}{{ item.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">申请时库存</text>
              <text class="value">{{ item.currentStock }}{{ item.unit }}</text>
            </view>
            <view class="info-row">
              <text class="label">用途</text>
              <text class="value">{{ item.reason }}</text>
            </view>
            <view v-if="item.remark" class="info-row">
              <text class="label">备注</text>
              <text class="value">{{ item.remark }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="application.status === 'approved' || application.status === 'rejected'" class="info-section">
        <view class="section-header">
          <text class="section-title">审批信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="label">审批人</text>
            <text class="value">{{ application.approverName || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">审批意见</text>
            <text class="value">{{ application.approvalComment || '-' }}</text>
          </view>
        </view>
      </view>

      <view v-if="application.status === 'issued'" class="info-section">
        <view class="section-header">
          <text class="section-title">发放信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="label">发放人</text>
            <text class="value">{{ application.issuerName || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">发放物品</text>
            <text class="value">
              <view v-for="(issued, idx) in application.issuedItems" :key="idx" class="issued-item">
                {{ getSupplyName(issued.supplyId) }} × {{ issued.quantity }}
              </view>
            </text>
          </view>
        </view>
      </view>

      <view class="action-bar" v-if="showActions">
        <view 
          v-if="application.status === 'pending'" 
          class="action-btn cancel"
          @click="handleWithdraw"
        >
          <text>撤回申领</text>
        </view>
        <view 
          v-if="application.status === 'approved' && store.currentUser.role === 'admin'" 
          class="action-btn confirm"
          @click="showIssueModal = true"
        >
          <text>发放物品</text>
        </view>
        <view 
          v-if="application.status === 'draft'" 
          class="action-btn confirm"
          @click="handleSubmitDraft"
        >
          <text>提交申请</text>
        </view>
      </view>
    </view>

    <view class="issue-modal" v-if="showIssueModal" @click="showIssueModal = false">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发放物品</text>
          <view class="modal-close" @click="showIssueModal = false">✕</view>
        </view>
        <view class="modal-body">
          <view v-for="(item, index) in application?.items" :key="index" class="issue-item">
            <view class="issue-item-header">
              <text class="issue-item-name">{{ item.supplyName }} - {{ item.spec }}</text>
              <text class="issue-item-unit">{{ item.unit }}</text>
            </view>
            <view class="issue-item-body">
              <text class="issue-item-label">申领数量：{{ item.quantity }}</text>
              <view class="quantity-input">
                <view class="qty-btn" @click="decreaseIssueQty(index)">-</view>
                <input 
                  type="number" 
                  :value="issueQuantities[index]" 
                  class="qty-input"
                  @input="(e: any) => updateIssueQty(index, e.detail.value)"
                />
                <view class="qty-btn" @click="increaseIssueQty(index)">+</view>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showIssueModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleIssue">
            <text>确认发放</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSuppliesStore } from '@/stores/supplies'
import { getApplicationStatusLabel, getApplicationStatusColor } from '@/types/supplies'
import type { Application, ApplicationItem } from '@/types/supplies'

const store = useSuppliesStore()
const application = ref<Application | null>(null)
const showIssueModal = ref(false)
const issueQuantities = reactive<number[]>([])

const showActions = computed(() => {
  if (!application.value) return false
  const status = application.value.status
  if (status === 'pending' && application.value.applicantId === store.currentUser.id) {
    return true
  }
  if (status === 'approved' && store.currentUser.role === 'admin') {
    return true
  }
  if (status === 'draft' && application.value.applicantId === store.currentUser.id) {
    return true
  }
  return false
})

function getStatusLabel(status: string) {
  return getApplicationStatusLabel(status as any)
}

function getStatusColor(status: string) {
  return getApplicationStatusColor(status as any)
}

function getSupplyName(supplyId: string): string {
  const supply = store.getSupplyItemById(supplyId)
  return supply?.name || '未知物品'
}

function decreaseIssueQty(index: number) {
  if (issueQuantities[index] > 0) {
    issueQuantities[index]--
  }
}

function increaseIssueQty(index: number) {
  const item = application.value?.items[index]
  if (item && issueQuantities[index] < item.quantity) {
    issueQuantities[index]++
  }
}

function updateIssueQty(index: number, value: string) {
  const item = application.value?.items[index]
  const num = parseInt(value) || 0
  issueQuantities[index] = Math.max(0, Math.min(num, item?.quantity || 0))
}

function handleWithdraw() {
  uni.showModal({
    title: '确认撤回',
    content: '确定要撤回该申领吗？',
    success: (res) => {
      if (res.confirm && application.value) {
        store.withdrawApplication(application.value.id)
        uni.showToast({ title: '撤回成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

function handleSubmitDraft() {
  uni.showModal({
    title: '确认提交',
    content: '确定要提交该申请吗？',
    success: (res) => {
      if (res.confirm && application.value) {
        store.submitFromDraft(application.value.id)
        uni.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

function handleIssue() {
  if (!application.value) return
  
  const issuedItems = application.value.items.map((item, index) => ({
    supplyId: item.supplyId,
    quantity: issueQuantities[index]
  })).filter(item => item.quantity > 0)
  
  if (issuedItems.length === 0) {
    uni.showToast({ title: '请选择发放数量', icon: 'none' })
    return
  }
  
  const result = store.issueApplication(application.value.id, issuedItems)
  if (result) {
    uni.showToast({ title: '发放成功', icon: 'success' })
    showIssueModal.value = false
    application.value = result
  } else {
    uni.showToast({ title: '发放失败，库存不足', icon: 'none' })
  }
}

onLoad((options) => {
  if (options?.id) {
    application.value = store.getApplicationById(options.id) || null
    if (application.value) {
      issueQuantities.length = 0
      for (const item of application.value.items) {
        issueQuantities.push(item.quantity)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail-content {
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.status-bar {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
}

.status-tag {
  padding: 12rpx 32rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}

.info-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: block;
  flex: 1;
}

.item-count {
  font-size: 24rpx;
  color: #999;
}

.info-list {
  padding: 0 8rpx;
}

.info-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-row .label {
  font-size: 28rpx;
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.info-row .value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.item-card {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.item-header {
  margin-bottom: 12rpx;
}

.item-number {
  font-size: 24rpx;
  color: #4080ff;
  font-weight: bold;
}

.item-body {
  padding-left: 16rpx;
}

.item-body .info-row {
  padding: 8rpx 0;
}

.item-body .label {
  width: 120rpx;
}

.issued-item {
  display: block;
  margin-bottom: 4rpx;
}

.action-bar {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: 40rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 40rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
  
  &.cancel {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &.confirm {
    background-color: #4080ff;
    color: #fff;
  }
}

.issue-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40rpx;
}

.modal-container {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.issue-item {
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.issue-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.issue-item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.issue-item-unit {
  font-size: 24rpx;
  color: #999;
}

.issue-item-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-item-label {
  font-size: 26rpx;
  color: #666;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.qty-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 12rpx;
  font-size: 36rpx;
  color: #666;
}

.qty-input {
  width: 120rpx;
  height: 60rpx;
  text-align: center;
  font-size: 32rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  
  &.cancel {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &.confirm {
    background-color: #4080ff;
    color: #fff;
  }
}
</style>
