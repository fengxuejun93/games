<template>
  <view class="page">
    <view class="header-section">
      <view class="header-top">
        <text class="page-title">会议记录</text>
        <view class="header-right">
          <button class="export-btn" @click="handleExportSelected" :class="{ active: selectedIds.length > 0 }" v-if="selectedIds.length > 0">
            <text class="btn-icon">📥</text>
            <text class="btn-text">导出 ({{ selectedIds.length }})</text>
          </button>
          <button class="add-btn" @click="goToAdd" v-else>
            <text class="btn-icon">+</text>
            <text class="btn-text">新建</text>
          </button>
        </view>
      </view>
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索会议主题" 
          v-model="keyword"
          @confirm="loadMeetings"
        />
      </view>
    </view>
    
    <view class="filter-section" v-if="showFilter">
      <view class="filter-card">
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">状态</text>
            <picker :value="statusIndex" :range="statusOptions" @change="onStatusChange">
              <view class="filter-picker">
                <text class="filter-value">{{ statusOptions[statusIndex] }}</text>
                <text class="filter-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="filter-divider"></view>
          <view class="filter-item">
            <text class="filter-label">日期范围</text>
            <view class="date-range">
              <picker mode="date" :value="dateStart" @change="onDateStartChange">
                <view class="date-picker">{{ dateStart || '开始' }}</view>
              </picker>
              <text class="date-separator">至</text>
              <picker mode="date" :value="dateEnd" @change="onDateEndChange">
                <view class="date-picker">{{ dateEnd || '结束' }}</view>
              </picker>
            </view>
          </view>
        </view>
        <view class="filter-actions">
          <button class="filter-btn reset" @click="resetFilter">重置</button>
          <button class="filter-btn confirm" @click="applyFilter">应用筛选</button>
        </view>
      </view>
    </view>
    
    <view class="filter-toggle" @click="showFilter = !showFilter">
      <view class="toggle-content">
        <text class="toggle-icon">{{ showFilter ? '▲' : '▼' }}</text>
        <text class="toggle-text">{{ showFilter ? '收起筛选' : '筛选条件' }}</text>
      </view>
    </view>
    
    <view class="select-bar" v-if="meetings.length > 0">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: isAllSelected }">
          <text v-if="isAllSelected">✓</text>
        </view>
        <text class="select-text">全选</text>
      </view>
      <view class="select-actions">
        <text class="select-action" @click="clearSelection">取消选择</text>
        <text class="select-action export" @click="handleExportSelected">导出选中</text>
      </view>
    </view>
    
    <view class="list-container" v-if="meetings.length > 0">
      <view 
        class="meeting-card" 
        v-for="meeting in meetings" 
        :key="meeting.meetingId"
        :class="{ selected: selectedIds.includes(meeting.meetingId) }"
        @click="goToDetail(meeting.meetingId)"
        @touchstart="handleCardHover($event, true)"
        @touchend="handleCardHover($event, false)"
      >
        <view class="card-main">
          <view class="card-header">
            <view class="checkbox-wrap" @click.stop="toggleSelect(meeting.meetingId)">
              <view class="checkbox" :class="{ checked: selectedIds.includes(meeting.meetingId) }">
                <text v-if="selectedIds.includes(meeting.meetingId)">✓</text>
              </view>
            </view>
            <view class="header-info">
              <text class="theme-text">{{ meeting.meetingTheme }}</text>
              <view class="status-tag" :class="meeting.status">
                {{ meeting.status === 'draft' ? '草稿' : '已提交' }}
              </view>
            </view>
            <view class="header-meta">
              <text class="date-icon">📅</text>
              <text class="date-text">{{ meeting.meetingDate }}</text>
            </view>
          </view>
          
          <view class="card-body">
            <view class="info-grid">
              <view class="info-item">
                <text class="info-icon">📍</text>
                <text class="info-text">{{ meeting.location }}</text>
              </view>
              <view class="info-item">
                <text class="info-icon">🕐</text>
                <text class="info-text">{{ meeting.startTime }} - {{ meeting.endTime }}</text>
              </view>
              <view class="info-item">
                <text class="info-icon">👥</text>
                <text class="info-text">{{ meeting.attendees.length }}人参会</text>
              </view>
              <view class="info-item">
                <text class="info-icon">🎤</text>
                <text class="info-text">{{ meeting.host }}</text>
              </view>
            </view>
          </view>
          
          <view class="card-footer">
            <view class="todo-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: getProgress(meeting.todos) + '%' }"></view>
              </view>
              <text class="progress-text">{{ getCompletedCount(meeting.todos) }}/{{ meeting.todos.length }} 待办</text>
            </view>
            <view class="action-btns">
              <view class="action-btn edit" @click.stop="goToEdit(meeting.meetingId)">
                <text class="action-icon">✏️</text>
                <text class="action-text">编辑</text>
              </view>
              <view class="action-btn delete" @click.stop="handleDelete(meeting.meetingId, meeting.meetingTheme)">
                <text class="action-icon">🗑️</text>
                <text class="action-text">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <view class="empty-icon-wrap">
        <text class="empty-icon">📋</text>
      </view>
      <text class="empty-title">暂无会议记录</text>
      <text class="empty-desc">点击下方按钮创建第一条会议记录</text>
      <button class="empty-btn" @click="goToAdd">
        <text class="btn-icon">+</text>
        <text class="btn-text">新建会议记录</text>
      </button>
    </view>
    
    <view class="loading-mask" v-if="isExporting">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在导出...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MeetingRecord } from '@/types/meeting'
import { getMeetingList, deleteMeeting, initMockData } from '@/utils/storage'
import { exportMeetings } from '@/utils/export'

const meetings = ref<MeetingRecord[]>([])
const keyword = ref('')
const showFilter = ref(false)
const statusIndex = ref(0)
const statusOptions = ['全部', '草稿', '已提交']
const dateStart = ref('')
const dateEnd = ref('')
const selectedIds = ref<string[]>([])
const isExporting = ref(false)

const isAllSelected = computed(() => {
  return meetings.value.length > 0 && selectedIds.value.length === meetings.value.length
})

function loadMeetings(query?: { keyword?: string; dateRange?: { start: string; end: string }; status?: 'draft' | 'submitted' | 'all' }) {
  const params: { keyword?: string; dateRange?: { start: string; end: string }; status?: 'draft' | 'submitted' | 'all' } = {}
  
  if (query) {
    if (query.keyword) params.keyword = query.keyword
    if (query.dateRange) params.dateRange = query.dateRange
    if (query.status) params.status = query.status
  } else {
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    if (dateStart.value && dateEnd.value) {
      params.dateRange = { start: dateStart.value, end: dateEnd.value }
    }
    const statusMap: Record<number, 'draft' | 'submitted' | 'all'> = {
      0: 'all',
      1: 'draft',
      2: 'submitted'
    }
    params.status = statusMap[statusIndex.value]
  }
  
  meetings.value = getMeetingList(params)
  selectedIds.value = []
}

function getCompletedCount(todos: MeetingRecord['todos']): number {
  return todos.filter(t => t.completed).length
}

function getProgress(todos: MeetingRecord['todos']): number {
  if (todos.length === 0) return 0
  return Math.round((getCompletedCount(todos) / todos.length) * 100)
}

function onStatusChange(e: any) {
  statusIndex.value = e.detail.value
}

function onDateStartChange(e: any) {
  dateStart.value = e.detail.value
}

function onDateEndChange(e: any) {
  dateEnd.value = e.detail.value
}

function resetFilter() {
  statusIndex.value = 0
  dateStart.value = ''
  dateEnd.value = ''
  keyword.value = ''
  loadMeetings()
}

function applyFilter() {
  loadMeetings()
  showFilter.value = false
}

function goToAdd() {
  uni.navigateTo({ url: '/pages/meeting-form/index' })
}

function goToDetail(meetingId: string) {
  uni.navigateTo({ url: `/pages/meeting-detail/index?id=${meetingId}` })
}

function goToEdit(meetingId: string) {
  uni.navigateTo({ url: `/pages/meeting-form/index?id=${meetingId}` })
}

function handleDelete(meetingId: string, theme: string) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除会议"${theme}"吗？`,
    success: (res) => {
      if (res.confirm) {
        deleteMeeting(meetingId)
        selectedIds.value = selectedIds.value.filter(id => id !== meetingId)
        loadMeetings()
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

function handleCardHover(e: any, isHover: boolean) {
  const target = e.currentTarget
  if (target) {
    target.style.transform = isHover ? 'scale(0.98)' : 'scale(1)'
    target.style.boxShadow = isHover ? '0 4rpx 20rpx rgba(0, 0, 0, 0.1)' : '0 4rpx 16rpx rgba(0, 0, 0, 0.06)'
  }
}

function toggleSelect(meetingId: string) {
  const index = selectedIds.value.indexOf(meetingId)
  if (index === -1) {
    selectedIds.value.push(meetingId)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = meetings.value.map(m => m.meetingId)
  }
}

function clearSelection() {
  selectedIds.value = []
}

function handleExportSelected() {
  if (selectedIds.value.length === 0) {
    uni.showToast({
      title: '请选择要导出的会议',
      icon: 'none'
    })
    return
  }
  
  isExporting.value = true
  
  setTimeout(() => {
    const selectedMeetings = meetings.value.filter(m => selectedIds.value.includes(m.meetingId))
    exportMeetings(selectedMeetings)
    isExporting.value = false
    selectedIds.value = []
  }, 500)
}

onMounted(() => {
  initMockData()
  loadMeetings()
})

uni.$on('meetingUpdated', () => loadMeetings())
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding-bottom: 40rpx;
}

.header-section {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 60rpx 32rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
}

.header-right {
  display: flex;
  gap: 16rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  padding: 16rpx 28rpx;
  
  .btn-icon {
    font-size: 32rpx;
    font-weight: 600;
  }
  
  .btn-text {
    font-size: 28rpx;
    font-weight: 500;
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: rgba(255, 255, 255, 0.95);
  color: #4f46e5;
  border: none;
  border-radius: 24rpx;
  padding: 16rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(79, 70, 229, 0.2);
  
  .btn-icon {
    font-size: 28rpx;
  }
  
  .btn-text {
    font-size: 28rpx;
    font-weight: 500;
  }
  
  &:active {
    opacity: 0.9;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 20rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(79, 70, 229, 0.15);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 30rpx;
  background: transparent;
  color: #1e293b;
}

.filter-section {
  padding: 20rpx 32rpx;
}

.filter-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.filter-item {
  flex: 1;
}

.filter-label {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 12rpx;
  display: block;
  font-weight: 500;
}

.filter-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
}

.filter-value {
  font-size: 28rpx;
  color: #1e293b;
}

.filter-arrow {
  font-size: 20rpx;
  color: #94a3b8;
}

.filter-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #e2e8f0;
  margin: 0 24rpx;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.date-picker {
  flex: 1;
  padding: 20rpx 20rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
  text-align: center;
  font-size: 26rpx;
  color: #1e293b;
}

.date-separator {
  font-size: 24rpx;
  color: #94a3b8;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
}

.filter-btn {
  flex: 1;
  padding: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 12rpx;
  border: none;
  
  &.reset {
    background-color: #f8fafc;
    color: #64748b;
  }
  
  &.confirm {
    background-color: #4f46e5;
    color: #ffffff;
  }
  
  &:active {
    opacity: 0.85;
  }
}

.filter-toggle {
  padding: 20rpx 32rpx;
  background-color: transparent;
}

.toggle-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.toggle-icon {
  font-size: 20rpx;
  color: #64748b;
}

.toggle-text {
  font-size: 26rpx;
  color: #64748b;
}

.select-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f1f5f9;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #ffffff;
  
  &.checked {
    background-color: #4f46e5;
    border-color: #4f46e5;
  }
}

.select-text {
  font-size: 28rpx;
  color: #475569;
}

.select-actions {
  display: flex;
  gap: 24rpx;
}

.select-action {
  font-size: 26rpx;
  color: #64748b;
  
  &.export {
    color: #4f46e5;
    font-weight: 500;
  }
  
  &:active {
    opacity: 0.7;
  }
}

.list-container {
  padding: 0 32rpx;
}

.meeting-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  
  &.selected {
    background-color: #f0f5ff;
    border: 2rpx solid #4f46e5;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  }
}

.card-main {
  padding: 28rpx;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.checkbox-wrap {
  flex-shrink: 0;
  margin-top: 4rpx;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.theme-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  
  &.draft {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  &.submitted {
    background-color: #eff6ff;
    color: #2563eb;
  }
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.date-icon {
  font-size: 24rpx;
}

.date-text {
  font-size: 26rpx;
  color: #64748b;
}

.card-body {
  padding: 20rpx 0;
  border-top: 1rpx solid #f1f5f9;
  border-bottom: 1rpx solid #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 24rpx;
}

.info-text {
  font-size: 26rpx;
  color: #475569;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
}

.todo-progress {
  flex: 1;
  margin-right: 20rpx;
}

.progress-bar {
  height: 8rpx;
  background-color: #e2e8f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #64748b;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  
  &.edit {
    background-color: #eff6ff;
    
    .action-text {
      color: #2563eb;
    }
  }
  
  &.delete {
    background-color: #fef2f2;
    
    .action-text {
      color: #dc2626;
    }
  }
  
  &:active {
    opacity: 0.7;
  }
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 40rpx;
}

.empty-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  border-radius: 32rpx;
  padding: 24rpx 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 70, 229, 0.3);
  
  .btn-icon {
    font-size: 32rpx;
    font-weight: 600;
  }
  
  .btn-text {
    font-size: 30rpx;
    font-weight: 500;
  }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.loading-mask {
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
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 64rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.loading-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.loading-text {
  font-size: 30rpx;
  color: #475569;
}
</style>