<template>
  <view class="page">
    <view class="form-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <text class="header-title">{{ isEdit ? '编辑合同' : '新建合同' }}</text>
        <text class="header-subtitle">{{ isEdit ? '修改合同信息' : '创建新的合同记录' }}</text>
      </view>
    </view>

    <scroll-view class="form-scroll" scroll-y>
      <view class="form-container">
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">📋</text>
            </view>
            <text class="section-title">基本信息</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">合同编号</text>
              <text class="required">*</text>
            </view>
            <input 
              class="form-input" 
              v-model="form.contractNo" 
              placeholder="请输入合同编号" 
              :class="{ error: errors.contractNo }"
            />
            <text class="error-text" v-if="errors.contractNo">{{ errors.contractNo }}</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">合同名称</text>
              <text class="required">*</text>
            </view>
            <input 
              class="form-input" 
              v-model="form.title" 
              placeholder="请输入合同名称"
              :class="{ error: errors.title }"
            />
            <text class="error-text" v-if="errors.title">{{ errors.title }}</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">合同类型</text>
              <text class="required">*</text>
            </view>
            <view 
              class="form-picker" 
              @click="showTypePicker = true"
              :class="{ error: errors.type }"
            >
              <text class="picker-value" :style="{ color: selectedTypeColor }">
                {{ selectedTypeLabel || '请选择合同类型' }}
              </text>
              <view class="picker-arrow-wrap">
                <text class="picker-arrow">›</text>
              </view>
            </view>
            <text class="error-text" v-if="errors.type">{{ errors.type }}</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">合同状态</text>
            </view>
            <view class="form-picker" @click="showStatusPicker = true">
              <text class="picker-value" :style="{ color: selectedStatusColor }">
                {{ selectedStatusLabel }}
              </text>
              <view class="picker-arrow-wrap">
                <text class="picker-arrow">›</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">👥</text>
            </view>
            <text class="section-title">双方信息</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">甲方</text>
              <text class="required">*</text>
            </view>
            <input 
              class="form-input" 
              v-model="form.partyA" 
              placeholder="请输入甲方名称"
              :class="{ error: errors.partyA }"
            />
            <text class="error-text" v-if="errors.partyA">{{ errors.partyA }}</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">乙方</text>
              <text class="required">*</text>
            </view>
            <input 
              class="form-input" 
              v-model="form.partyB" 
              placeholder="请输入乙方名称"
              :class="{ error: errors.partyB }"
            />
            <text class="error-text" v-if="errors.partyB">{{ errors.partyB }}</text>
          </view>
        </view>
        
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">💰</text>
            </view>
            <text class="section-title">金额信息</text>
          </view>
          
          <view class="form-item">
            <view class="item-header">
              <text class="form-label">合同金额</text>
              <text class="required">*</text>
            </view>
            <view class="amount-input-wrap" :class="{ error: errors.amount }">
              <view class="currency-selector" @click="showCurrencyPicker = true">
                <text class="currency-label">{{ form.currency }}</text>
                <text class="currency-arrow">▼</text>
              </view>
              <input 
                class="amount-input" 
                type="digit" 
                v-model="form.amount" 
                placeholder="0.00"
              />
            </view>
            <text class="error-text" v-if="errors.amount">{{ errors.amount }}</text>
          </view>
        </view>
        
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">📅</text>
            </view>
            <text class="section-title">时间信息</text>
          </view>
          
          <view class="date-row">
            <view class="form-item date-item">
              <text class="form-label">签订日期</text>
              <picker mode="date" :value="form.signingDate" @change="handleSigningDateChange">
                <view class="form-picker">
                  <text class="picker-value">{{ form.signingDate || '选择日期' }}</text>
                  <view class="picker-arrow-wrap">
                    <text class="picker-arrow">›</text>
                  </view>
                </view>
              </picker>
            </view>
            <view class="form-item date-item">
              <text class="form-label">开始日期</text>
              <picker mode="date" :value="form.startDate" @change="handleStartDateChange">
                <view class="form-picker">
                  <text class="picker-value">{{ form.startDate || '选择日期' }}</text>
                  <view class="picker-arrow-wrap">
                    <text class="picker-arrow">›</text>
                  </view>
                </view>
              </picker>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">结束日期</text>
            <picker mode="date" :value="form.endDate" @change="handleEndDateChange">
              <view class="form-picker">
                <text class="picker-value">{{ form.endDate || '选择日期' }}</text>
                <view class="picker-arrow-wrap">
                  <text class="picker-arrow">›</text>
                </view>
              </view>
            </picker>
          </view>
        </view>
        
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">📝</text>
            </view>
            <text class="section-title">合同描述</text>
          </view>
          <textarea 
            class="form-textarea" 
            v-model="form.description" 
            placeholder="请输入合同描述（可选）"
            :maxlength="500"
          />
          <view class="textarea-footer">
            <text class="textarea-count">{{ form.description.length }}/500</text>
          </view>
        </view>
        
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon-wrap">
              <text class="section-icon">📎</text>
            </view>
            <text class="section-title">附件上传</text>
            <text class="section-hint">{{ form.attachments.length }} 个文件</text>
          </view>
          <view class="attachment-list">
            <view 
              class="attachment-item" 
              v-for="(file, index) in form.attachments" 
              :key="index"
            >
              <view class="attachment-icon-wrap">
                <text class="attachment-icon">{{ getFileIcon(file.type) }}</text>
              </view>
              <view class="attachment-info">
                <text class="attachment-name">{{ file.name }}</text>
                <text class="attachment-meta">{{ formatFileSize(file.size) }} · {{ file.uploadedAt }}</text>
              </view>
              <view class="attachment-delete" @click="removeAttachment(index)">
                <text class="delete-icon">✕</text>
              </view>
            </view>
            <view class="upload-btn" @click="handleUpload">
              <view class="upload-icon-wrap">
                <text class="upload-icon">+</text>
              </view>
              <text class="upload-text">上传附件</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="form-footer">
      <view class="btn-cancel" @click="handleCancel">取消</view>
      <view class="btn-save" @click="handleSave">
        <text class="btn-icon">{{ isEdit ? '✏️' : '✓' }}</text>
        <text class="btn-text">{{ isEdit ? '保存修改' : '创建合同' }}</text>
      </view>
    </view>
    
    <view class="picker-modal" v-if="showTypePicker" @click="showTypePicker = false">
      <view class="modal-mask" @click="showTypePicker = false"></view>
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择合同类型</text>
          <view class="picker-close" @click="showTypePicker = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="picker-options">
          <view 
            v-for="option in typeOptions" 
            :key="option.value"
            class="picker-option"
            :class="{ active: form.type === option.value }"
            @click="selectType(option.value)"
          >
            <view class="option-icon">{{ option.icon }}</view>
            <text class="option-label">{{ option.label }}</text>
            <view class="option-check" v-if="form.type === option.value">✓</view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="picker-modal" v-if="showStatusPicker" @click="showStatusPicker = false">
      <view class="modal-mask" @click="showStatusPicker = false"></view>
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择合同状态</text>
          <view class="picker-close" @click="showStatusPicker = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="picker-options">
          <view 
            v-for="option in statusOptions" 
            :key="option.value"
            class="picker-option"
            :class="{ active: form.status === option.value }"
            @click="selectStatus(option.value)"
          >
            <view class="option-dot" :style="{ background: option.color }"></view>
            <text class="option-label">{{ option.label }}</text>
            <view class="option-check" v-if="form.status === option.value">✓</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import { useContractStore } from '@/stores/contract'
import { CONTRACT_TYPE_OPTIONS, CONTRACT_STATUS_OPTIONS, getContractTypeLabel, getContractTypeColor, getContractStatusLabel, getContractStatusColor } from '@/types/contract'
import type { Contract, ContractType, ContractStatus, Attachment } from '@/types/contract'

const contractStore = useContractStore()

const isEdit = ref(false)
const contractId = ref('')

const form = ref({
  contractNo: '',
  title: '',
  type: '' as ContractType,
  status: 'draft' as ContractStatus,
  partyA: '',
  partyB: '',
  amount: '',
  currency: 'CNY',
  signingDate: '',
  startDate: '',
  endDate: '',
  description: '',
  attachments: [] as Attachment[]
})

const errors = ref<Record<string, string>>({})

const showTypePicker = ref(false)
const showStatusPicker = ref(false)
const showCurrencyPicker = ref(false)

const typeOptions = CONTRACT_TYPE_OPTIONS
const statusOptions = CONTRACT_STATUS_OPTIONS

const selectedTypeLabel = computed(() => {
  if (!form.value.type) return ''
  return getContractTypeLabel(form.value.type)
})

const selectedTypeColor = computed(() => {
  if (!form.value.type) return '#9ca3af'
  return getContractTypeColor(form.value.type)
})

const selectedStatusLabel = computed(() => {
  return getContractStatusLabel(form.value.status)
})

const selectedStatusColor = computed(() => {
  return getContractStatusColor(form.value.status)
})

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    contractId.value = options.id
    loadContract(options.id)
    uni.setNavigationBarTitle({ title: '编辑合同' })
  }
})

function loadContract(id: string) {
  const contract = contractStore.getById(id)
  if (contract) {
    form.value = {
      contractNo: contract.contractNo,
      title: contract.title,
      type: contract.type,
      status: contract.status,
      partyA: contract.partyA,
      partyB: contract.partyB,
      amount: contract.amount.toString(),
      currency: contract.currency,
      signingDate: contract.signingDate,
      startDate: contract.startDate,
      endDate: contract.endDate,
      description: contract.description,
      attachments: [...contract.attachments]
    }
  }
}

function selectType(type: ContractType) {
  form.value.type = type
  showTypePicker.value = false
}

function selectStatus(status: ContractStatus) {
  form.value.status = status
  showStatusPicker.value = false
}

function handleSigningDateChange(e: { detail: { value: string } }) {
  form.value.signingDate = e.detail.value
}

function handleStartDateChange(e: { detail: { value: string } }) {
  form.value.startDate = e.detail.value
}

function handleEndDateChange(e: { detail: { value: string } }) {
  form.value.endDate = e.detail.value
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

function handleUpload() {
  uni.chooseMessageFile({
    count: 10,
    type: 'file',
    success: (res) => {
      const newFiles: Attachment[] = res.tempFiles.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        url: file.path,
        size: file.size,
        type: file.name.split('.').pop() || 'other',
        uploadedAt: new Date().toISOString().split('T')[0]
      }))
      form.value.attachments = [...form.value.attachments, ...newFiles]
    }
  })
}

function removeAttachment(index: number) {
  form.value.attachments.splice(index, 1)
}

function validateForm(): boolean {
  errors.value = {}
  
  if (!form.value.contractNo.trim()) {
    errors.value.contractNo = '请输入合同编号'
  }
  if (!form.value.title.trim()) {
    errors.value.title = '请输入合同名称'
  }
  if (!form.value.type) {
    errors.value.type = '请选择合同类型'
  }
  if (!form.value.partyA.trim()) {
    errors.value.partyA = '请输入甲方名称'
  }
  if (!form.value.partyB.trim()) {
    errors.value.partyB = '请输入乙方名称'
  }
  if (!form.value.amount) {
    errors.value.amount = '请输入合同金额'
  } else if (isNaN(parseFloat(form.value.amount))) {
    errors.value.amount = '请输入有效的金额'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSave() {
  if (!validateForm()) return
  
  const contractData = {
    ...form.value,
    amount: parseFloat(form.value.amount)
  }
  
  if (isEdit.value) {
    contractStore.update(contractId.value, contractData)
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    contractStore.add(contractData)
    uni.showToast({ title: '创建成功', icon: 'success' })
  }
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

function handleCancel() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
}

.form-header {
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

.header-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-scroll {
  height: calc(100vh - 280rpx);
  padding: 24rpx;
}

.form-container {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.form-section {
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 28rpx;
}

.section-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: rgba(37, 99, 235, 0.08);
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

.section-hint {
  margin-left: auto;
  font-size: 24rpx;
  color: #9ca3af;
}

.form-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
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

.form-input {
  height: 96rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.error {
    background: #fff5f5;
    border-color: #ef4444;
  }

  &:focus {
    background: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.08);
  }
}

.error-text {
  font-size: 24rpx;
  color: #ef4444;
  margin-top: 10rpx;
  display: block;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 96rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 0 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.error {
    background: #fff5f5;
    border-color: #ef4444;
  }

  &:active {
    background: #f3f4f6;
  }
}

.picker-value {
  font-size: 28rpx;
  color: #1f2937;
}

.picker-arrow-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-arrow {
  font-size: 28rpx;
  color: #6b7280;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  height: 96rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 0 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.error {
    background: #fff5f5;
    border-color: #ef4444;
  }
}

.currency-selector {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 20rpx;
  height: 64rpx;
  background: #e5e7eb;
  border-radius: 12rpx;
  margin-right: 12rpx;
}

.currency-label {
  font-size: 28rpx;
  color: #4b5563;
  font-weight: 500;
}

.currency-arrow {
  font-size: 20rpx;
  color: #6b7280;
}

.amount-input {
  flex: 1;
  font-size: 32rpx;
  background: transparent;
  color: #1f2937;
  font-weight: 600;
}

.date-row {
  display: flex;
  gap: 20rpx;
}

.date-item {
  flex: 1;
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #1f2937;
  border: 1rpx solid #e5e7eb;
  transition: all 0.2s ease;

  &:focus {
    background: #ffffff;
    border-color: #2563eb;
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

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  width: calc(50% - 8rpx);
  border: 1rpx solid #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #f3f4f6;
  }
}

.attachment-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.attachment-icon {
  font-size: 32rpx;
}

.attachment-info {
  flex: 1;
  overflow: hidden;
}

.attachment-name {
  font-size: 26rpx;
  color: #1f2937;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-meta {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}

.attachment-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.08);
  transition: all 0.2s ease;

  &:active {
    background: rgba(239, 68, 68, 0.15);
  }

  .delete-icon {
    font-size: 24rpx;
    color: #ef4444;
  }
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(50% - 8rpx);
  height: 160rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  border: 2rpx dashed #d1d5db;
  transition: all 0.3s ease;

  &:active {
    background: #f3f4f6;
    border-color: #2563eb;
  }
}

.upload-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.upload-icon {
  font-size: 40rpx;
  color: #2563eb;
}

.upload-text {
  font-size: 26rpx;
  color: #6b7280;
}

.form-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.btn-cancel, .btn-save {
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

.btn-save {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  gap: 10rpx;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .btn-icon {
    font-size: 28rpx;
  }
}

.picker-modal {
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
}

.picker-content {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 28rpx 28rpx 0 0;
  max-height: 75vh;
  overflow-y: auto;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
  position: sticky;
  top: 0;
  background: #ffffff;
}

.picker-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.picker-close {
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

.picker-options {
  padding: 16rpx 24rpx 32rpx;
}

.picker-option {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  transition: all 0.2s ease;

  &.active {
    background: rgba(37, 99, 235, 0.06);
  }

  &:active {
    background: #f3f4f6;
  }
}

.option-icon {
  font-size: 36rpx;
}

.option-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}

.option-label {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
}

.option-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}
</style>