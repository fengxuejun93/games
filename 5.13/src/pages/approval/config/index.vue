<template>
  <view class="page">
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title-section">
          <text class="page-title">审批流程配置</text>
          <text class="page-subtitle">为不同合同类型配置审批节点</text>
        </view>
      </view>
    </view>

    <view class="type-tabs">
      <view 
        v-for="type in contractTypes" 
        :key="type.value"
        class="type-tab"
        :class="{ active: activeType === type.value }"
        :style="{ '--tab-color': type.color }"
        @click="activeType = type.value"
      >
        <view class="tab-icon">{{ type.icon }}</view>
        <text class="tab-label">{{ type.label }}</text>
        <view class="tab-indicator" v-if="activeType === type.value"></view>
      </view>
    </view>

    <view class="config-card">
      <view class="card-header">
        <view class="card-title-wrap">
          <view class="card-icon-wrap">
            <text class="card-icon">📊</text>
          </view>
          <text class="card-title">{{ currentTypeName }} - 审批流程</text>
        </view>
        <view class="node-count">
          <text class="count-value">{{ currentFlow.nodes.length }}</text>
          <text class="count-label">个节点</text>
        </view>
      </view>

      <view class="flow-canvas">
        <view class="flow-node" v-for="(node, index) in currentFlow.nodes" :key="node.id">
          <view class="node-wrapper" :class="{ initiator: node.role === 'initiator' }">
            <view class="node-header">
              <view class="node-number" :class="{ initiator: node.role === 'initiator' }">
                {{ index + 1 }}
              </view>
              <view class="node-info">
                <text class="node-name">{{ node.name }}</text>
                <text class="node-role">{{ getRoleLabel(node.role) }}</text>
              </view>
              <view class="node-actions">
                <view class="action-btn move" @click="moveUp(index)" v-if="index > 0">
                  <text class="action-icon">↑</text>
                </view>
                <view class="action-btn move" @click="moveDown(index)" v-if="index < currentFlow.nodes.length - 1">
                  <text class="action-icon">↓</text>
                </view>
                <view class="action-btn delete" @click="removeNode(index)" v-if="currentFlow.nodes.length > 1 && node.role !== 'initiator'">
                  <text class="action-icon">×</text>
                </view>
              </view>
            </view>
          </view>
          <view class="node-connector" v-if="index < currentFlow.nodes.length - 1">
            <view class="connector-line"></view>
            <view class="connector-arrow">›</view>
          </view>
        </view>
      </view>
    </view>

    <view class="add-node-section">
      <view class="section-header">
        <view class="section-icon-wrap">
          <text class="section-icon">➕</text>
        </view>
        <text class="section-title">添加审批节点</text>
      </view>
      <view class="role-grid">
        <view 
          v-for="role in availableRoles" 
          :key="role.value"
          class="role-item"
          :class="{ disabled: isRoleUsed(role.value) }"
          @click="addNode(role)"
        >
          <view class="role-icon-wrap">
            <text class="role-icon">{{ getRoleIcon(role.value) }}</text>
          </view>
          <text class="role-name">{{ role.label }}</text>
          <view class="role-check" v-if="isRoleUsed(role.value)">✓</view>
        </view>
      </view>
    </view>

    <view class="save-section">
      <view class="save-btn" @click="saveConfig">
        <text class="btn-icon">✓</text>
        <text class="btn-text">保存配置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CONTRACT_TYPE_OPTIONS, APPROVAL_ROLE_OPTIONS, getApprovalRoleLabel } from '@/types/contract'
import type { ContractType, ApprovalRole, ApprovalNode } from '@/types/contract'

const contractTypes = CONTRACT_TYPE_OPTIONS
const availableRoles = APPROVAL_ROLE_OPTIONS.filter(r => r.value !== 'initiator')

const activeType = ref<ContractType>('purchase')

const flowConfigs = ref<Record<ContractType, ApprovalNode[]>>({
  purchase: [
    { id: '1', name: '发起人', role: 'initiator', required: true },
    { id: '2', name: '部门主管', role: 'department_head', required: true },
    { id: '3', name: '财务', role: 'finance', required: true },
    { id: '4', name: '法务', role: 'legal', required: true },
    { id: '5', name: '总经理', role: 'general_manager', required: true }
  ],
  sales: [
    { id: '1', name: '发起人', role: 'initiator', required: true },
    { id: '2', name: '部门主管', role: 'department_head', required: true },
    { id: '3', name: '财务', role: 'finance', required: true },
    { id: '4', name: '法务', role: 'legal', required: true }
  ],
  service: [
    { id: '1', name: '发起人', role: 'initiator', required: true },
    { id: '2', name: '部门主管', role: 'department_head', required: true },
    { id: '3', name: '法务', role: 'legal', required: true }
  ],
  hr: [
    { id: '1', name: '发起人', role: 'initiator', required: true },
    { id: '2', name: '部门主管', role: 'department_head', required: true },
    { id: '3', name: '总经理', role: 'general_manager', required: true }
  ]
})

const currentTypeName = computed(() => {
  const type = contractTypes.find(t => t.value === activeType.value)
  return type?.label || ''
})

const currentFlow = computed(() => {
  return {
    nodes: flowConfigs.value[activeType.value]
  }
})

function getRoleLabel(role: ApprovalRole): string {
  return getApprovalRoleLabel(role)
}

function getRoleIcon(role: ApprovalRole): string {
  const icons: Record<ApprovalRole, string> = {
    initiator: '👤',
    department_head: '👔',
    finance: '💰',
    legal: '⚖️',
    general_manager: '👑'
  }
  return icons[role] || '👤'
}

function isRoleUsed(role: ApprovalRole): boolean {
  return currentFlow.value.nodes.some(node => node.role === role)
}

function addNode(role: typeof availableRoles[0]) {
  if (isRoleUsed(role.value)) {
    uni.showToast({ title: '该角色已存在', icon: 'none' })
    return
  }

  const newNode: ApprovalNode = {
    id: Date.now().toString(),
    name: role.label,
    role: role.value,
    required: true
  }

  flowConfigs.value[activeType.value] = [...currentFlow.value.nodes, newNode]
}

function removeNode(index: number) {
  const nodes = currentFlow.value.nodes
  if (nodes[index].role === 'initiator') {
    uni.showToast({ title: '发起人节点不可删除', icon: 'none' })
    return
  }

  flowConfigs.value[activeType.value] = nodes.filter((_, i) => i !== index)
}

function moveUp(index: number) {
  if (index === 0) return
  if (currentFlow.value.nodes[index - 1].role === 'initiator') {
    uni.showToast({ title: '无法移至发起人之前', icon: 'none' })
    return
  }

  const nodes = [...currentFlow.value.nodes]
  const temp = nodes[index]
  nodes[index] = nodes[index - 1]
  nodes[index - 1] = temp
  flowConfigs.value[activeType.value] = nodes
}

function moveDown(index: number) {
  const nodes = [...currentFlow.value.nodes]
  const temp = nodes[index]
  nodes[index] = nodes[index + 1]
  nodes[index + 1] = temp
  flowConfigs.value[activeType.value] = nodes
}

function saveConfig() {
  uni.showToast({ title: '配置已保存', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
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

.type-tabs {
  display: flex;
  gap: 16rpx;
  padding: 0 24rpx;
  margin-top: -32rpx;
  margin-bottom: 28rpx;
}

.type-tab {
  flex: 1;
  position: relative;
  padding: 24rpx 16rpx;
  background: #ffffff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    border-color: var(--tab-color);
    background: rgba(37, 99, 235, 0.04);
  }

  &:active {
    transform: scale(0.96);
  }
}

.tab-icon {
  font-size: 36rpx;
}

.tab-label {
  font-size: 26rpx;
  color: #4b5563;
  font-weight: 500;

  .active & {
    color: var(--tab-color);
    font-weight: 600;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: var(--tab-color);
  border-radius: 3rpx;
}

.config-card {
  margin: 0 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.card-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  font-size: 28rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.node-count {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 20rpx;
}

.count-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #2563eb;
}

.count-label {
  font-size: 24rpx;
  color: #2563eb;
}

.flow-canvas {
  padding-left: 8rpx;
}

.flow-node {
  position: relative;
}

.node-wrapper {
  background: #f9fafb;
  border-radius: 16rpx;
  border: 1rpx solid #f3f4f6;
  transition: all 0.2s ease;

  &.initiator {
    background: rgba(37, 99, 235, 0.06);
    border-color: rgba(37, 99, 235, 0.2);
  }

  &:active {
    background: #f3f4f6;
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 24rpx;
}

.node-number {
  width: 52rpx;
  height: 52rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  margin-right: 16rpx;
  flex-shrink: 0;

  &.initiator {
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  }
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 6rpx;
}

.node-role {
  font-size: 24rpx;
  color: #6b7280;
}

.node-actions {
  display: flex;
  gap: 12rpx;
  margin-left: 16rpx;
}

.action-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.move {
    background: #ffffff;
    border: 1rpx solid #e5e7eb;

    &:active {
      background: #f3f4f6;
    }

    .action-icon {
      font-size: 24rpx;
      color: #6b7280;
    }
  }

  &.delete {
    background: rgba(239, 68, 68, 0.08);

    &:active {
      background: rgba(239, 68, 68, 0.15);
    }

    .action-icon {
      font-size: 28rpx;
      color: #ef4444;
    }
  }
}

.node-connector {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  padding-left: 24rpx;
  gap: 8rpx;
}

.connector-line {
  width: 8rpx;
  height: 8rpx;
  background: #d1d5db;
  border-radius: 50%;
}

.connector-arrow {
  font-size: 24rpx;
  color: #d1d5db;
}

.add-node-section {
  margin: 0 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.section-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: rgba(16, 185, 129, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.role-item {
  position: relative;
  padding: 28rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
    background: #f3f4f6;
    border-color: #2563eb;
  }

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
    background: #f3f4f6;
  }
}

.role-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon {
  font-size: 36rpx;
}

.role-name {
  font-size: 28rpx;
  color: #374151;
  font-weight: 500;
}

.role-check {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.save-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
  }

  .btn-icon {
    font-size: 28rpx;
    color: #ffffff;
  }

  .btn-text {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 600;
  }
}
</style>