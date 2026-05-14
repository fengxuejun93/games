<template>
  <view class="page">
    <view class="detail-header" v-if="meeting">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-top">
          <view class="back-btn" @click="goBack">
            <text class="back-icon">←</text>
          </view>
          <view class="header-actions">
            <view class="action-btn export" @click="handleExportSingle">
              <text class="action-icon">📥</text>
              <text class="action-text">导出</text>
            </view>
            <view class="action-btn edit" @click="goToEdit">
              <text class="action-icon">✏️</text>
              <text class="action-text">编辑</text>
            </view>
            <view class="action-btn delete" @click="handleDelete">
              <text class="action-icon">🗑️</text>
              <text class="action-text">删除</text>
            </view>
          </view>
        </view>
        
        <view class="meeting-title-wrap">
          <text class="meeting-title">{{ meeting.meetingTheme }}</text>
          <view class="status-tag" :class="meeting.status">
            {{ meeting.status === 'draft' ? '草稿' : '已提交' }}
          </view>
        </view>
        
        <view class="meeting-meta-row">
          <view class="meta-item primary">
            <text class="meta-icon">📅</text>
            <view class="meta-content">
              <text class="meta-label">会议日期</text>
              <text class="meta-value">{{ meeting.meetingDate }}</text>
            </view>
          </view>
          <view class="meta-item primary">
            <text class="meta-icon">🕐</text>
            <view class="meta-content">
              <text class="meta-label">会议时间</text>
              <text class="meta-value">{{ meeting.startTime }} - {{ meeting.endTime }}</text>
            </view>
          </view>
        </view>
        
        <view class="meeting-meta-row">
          <view class="meta-item">
            <text class="meta-icon">📍</text>
            <view class="meta-content">
              <text class="meta-label">会议地点</text>
              <text class="meta-value">{{ meeting.location }}</text>
            </view>
          </view>
          <view class="meta-item">
            <text class="meta-icon">👤</text>
            <view class="meta-content">
              <text class="meta-label">主持人</text>
              <text class="meta-value">{{ meeting.host }}</text>
            </view>
          </view>
          <view class="meta-item">
            <text class="meta-icon">📝</text>
            <view class="meta-content">
              <text class="meta-label">记录人</text>
              <text class="meta-value">{{ meeting.recorder }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <scroll-view scroll-y class="detail-content" v-if="meeting">
      <view class="detail-section attendees-section">
        <view class="section-header">
          <view class="section-icon">👥</view>
          <view class="section-title-wrap">
            <text class="section-title">参会人员</text>
            <text class="section-count">{{ meeting.attendees.length }}人参会</text>
          </view>
        </view>
        <view class="section-body">
          <view class="attendee-group">
            <view class="group-header">
              <text class="group-label">参会人员</text>
              <text class="group-count">{{ meeting.attendees.length }}人</text>
            </view>
            <view class="person-tags">
              <view class="person-tag present" v-for="(person, index) in meeting.attendees" :key="'present-' + index">
                <text class="tag-icon">✓</text>
                <text class="tag-text">{{ person }}</text>
              </view>
            </view>
          </view>
          <view class="attendee-group" v-if="meeting.absentees.length > 0">
            <view class="group-header">
              <text class="group-label">缺席人员</text>
              <text class="group-count">{{ meeting.absentees.length }}人</text>
            </view>
            <view class="person-tags">
              <view class="person-tag absent" v-for="(person, index) in meeting.absentees" :key="'absent-' + index">
                <text class="tag-icon">✕</text>
                <text class="tag-text">{{ person }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="detail-section topics-section">
        <view class="section-header">
          <view class="section-icon">🎯</view>
          <view class="section-title-wrap">
            <text class="section-title">会议议题</text>
          </view>
        </view>
        <view class="section-body">
          <view class="topic-tags" v-if="meeting.topics.length > 0">
            <view class="topic-tag" v-for="(topic, index) in meeting.topics" :key="index">
              <text class="topic-number">{{ index + 1 }}</text>
              <text class="topic-text">{{ topic }}</text>
            </view>
          </view>
          <view class="empty-state" v-else>
            <text class="empty-text">暂无会议议题</text>
          </view>
        </view>
      </view>
      
      <view class="detail-section discussion-section">
        <view class="section-header">
          <view class="section-icon">💬</view>
          <view class="section-title-wrap">
            <text class="section-title">讨论内容</text>
          </view>
        </view>
        <view class="section-body">
          <text class="content-text">{{ meeting.discussion || '暂无讨论内容' }}</text>
        </view>
      </view>
      
      <view class="detail-section conclusion-section">
        <view class="section-header">
          <view class="section-icon">📌</view>
          <view class="section-title-wrap">
            <text class="section-title">会议结论</text>
          </view>
        </view>
        <view class="section-body">
          <text class="content-text">{{ meeting.conclusion || '暂无会议结论' }}</text>
        </view>
      </view>
      
      <view class="detail-section todos-section">
        <view class="section-header">
          <view class="section-icon">✅</view>
          <view class="section-title-wrap">
            <text class="section-title">待办任务</text>
            <text class="section-count">{{ completedCount }}/{{ meeting.todos.length }}</text>
          </view>
          <view class="progress-ring" :style="{ '--progress': getProgress(meeting.todos) }">
            <text class="progress-value">{{ getProgress(meeting.todos) }}%</text>
          </view>
        </view>
        <view class="section-body">
          <view class="todo-list" v-if="meeting.todos.length > 0">
            <view 
              class="todo-item" 
              v-for="todo in meeting.todos" 
              :key="todo.todoId"
              :class="{ completed: todo.completed }"
              @click="handleToggleTodo(todo.todoId)"
            >
              <view class="todo-checkbox" :class="{ checked: todo.completed }">
                <text v-if="todo.completed">✓</text>
              </view>
              <view class="todo-info">
                <text class="todo-content">{{ todo.content }}</text>
                <view class="todo-meta">
                  <view class="meta-tag">
                    <text class="meta-tag-icon">👤</text>
                    <text class="meta-tag-text">{{ todo.responsible }}</text>
                  </view>
                  <view class="meta-tag" :class="{ overdue: isOverdue(todo.deadline) && !todo.completed }">
                    <text class="meta-tag-icon">📅</text>
                    <text class="meta-tag-text">{{ todo.deadline }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="empty-state" v-else>
            <text class="empty-icon">📋</text>
            <text class="empty-text">暂无待办任务</text>
          </view>
        </view>
      </view>
      
      <view class="detail-section record-section">
        <view class="section-header">
          <view class="section-icon">📊</view>
          <view class="section-title-wrap">
            <text class="section-title">记录信息</text>
          </view>
        </view>
        <view class="section-body">
          <view class="record-item">
            <text class="record-label">创建时间</text>
            <text class="record-value">{{ formatDateTime(meeting.createdAt) }}</text>
          </view>
          <view class="record-item">
            <text class="record-label">最后更新</text>
            <text class="record-value">{{ formatDateTime(meeting.updatedAt) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="loading-state" v-else>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MeetingRecord } from '@/types/meeting'
import { getMeetingById, toggleTodoStatus, deleteMeeting } from '@/utils/storage'
import { exportMeetings } from '@/utils/export'

const meeting = ref<MeetingRecord | null>(null)

const completedCount = computed(() => {
  return meeting.value?.todos.filter(t => t.completed).length || 0
})

function getProgress(todos: MeetingRecord['todos']): number {
  if (todos.length === 0) return 0
  return Math.round((completedCount.value / todos.length) * 100)
}

function isOverdue(deadline: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return deadline < today
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function handleToggleTodo(todoId: string) {
  if (meeting.value) {
    toggleTodoStatus(meeting.value.meetingId, todoId)
    const todo = meeting.value.todos.find(t => t.todoId === todoId)
    if (todo) {
      todo.completed = !todo.completed
    }
    uni.showToast({ 
      title: todo?.completed ? '已标记完成' : '已取消完成', 
      icon: 'none',
      duration: 1000
    })
  }
}

function goBack() {
  uni.navigateBack()
}

function goToEdit() {
  if (meeting.value) {
    uni.navigateTo({ url: `/pages/meeting-form/index?id=${meeting.value.meetingId}` })
  }
}

function handleDelete() {
  if (meeting.value) {
    uni.showModal({
      title: '确认删除',
      content: `确定要删除会议"${meeting.value.meetingTheme}"吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteMeeting(meeting.value!.meetingId)
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.$emit('meetingUpdated')
            uni.navigateBack()
          }, 1500)
        }
      }
    })
  }
}

function handleExportSingle() {
  if (meeting.value) {
    uni.showLoading({ title: '正在导出...' })
    setTimeout(() => {
      exportMeetings([meeting.value!])
      uni.hideLoading()
    }, 500)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  
  if (options.id) {
    meeting.value = getMeetingById(options.id)
  }
})
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f1f5f9;
}

.detail-header {
  position: relative;
  padding-bottom: 32rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320rpx;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 0 0 48rpx 48rpx;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 60rpx 32rpx 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .back-icon {
    font-size: 36rpx;
    color: #ffffff;
    font-weight: 500;
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  
  .action-icon {
    font-size: 24rpx;
  }
  
  .action-text {
    font-size: 26rpx;
    color: #ffffff;
    font-weight: 500;
  }
  
  &.export {
    background-color: rgba(79, 70, 229, 0.8);
    
    .action-text {
      color: #ffffff;
    }
  }
  
  &.delete {
    .action-text {
      color: #fca5a5;
    }
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.meeting-title-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.meeting-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  flex: 1;
}

.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
  
  &.draft {
    background-color: rgba(252, 165, 165, 0.8);
    color: #dc2626;
  }
  
  &.submitted {
    background-color: rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }
}

.meeting-meta-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  
  &.primary {
    flex: none;
    width: calc(50% - 12rpx);
  }
  
  .meta-icon {
    font-size: 28rpx;
  }
}

.meta-content {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.meta-value {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.detail-content {
  flex: 1;
  padding: 24rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 2;
}

.detail-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1rpx solid #e2e8f0;
}

.section-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.section-title-wrap {
  flex: 1;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.section-count {
  font-size: 24rpx;
  color: #64748b;
  margin-left: 8rpx;
}

.progress-ring {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: conic-gradient(#4f46e5 calc(var(--progress) * 1%), #e2e8f0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background-color: #ffffff;
  }
}

.progress-value {
  position: relative;
  font-size: 18rpx;
  font-weight: 600;
  color: #4f46e5;
}

.section-body {
  padding: 24rpx 28rpx;
}

.attendee-group {
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.group-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #475569;
}

.group-count {
  font-size: 24rpx;
  color: #64748b;
}

.person-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.person-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 16rpx;
  border-radius: 20rpx;
  
  &.present {
    background-color: #eff6ff;
    
    .tag-icon {
      color: #2563eb;
    }
    
    .tag-text {
      color: #2563eb;
    }
  }
  
  &.absent {
    background-color: #fef2f2;
    
    .tag-icon {
      color: #dc2626;
    }
    
    .tag-text {
      color: #dc2626;
    }
  }
}

.tag-icon {
  font-size: 20rpx;
}

.tag-text {
  font-size: 26rpx;
  font-weight: 500;
}

.topic-tags {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.topic-tag {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
}

.topic-number {
  width: 36rpx;
  height: 36rpx;
  background-color: #4f46e5;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.topic-text {
  font-size: 28rpx;
  color: #1e293b;
}

.content-text {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.8;
  white-space: pre-wrap;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
  transition: all 0.2s ease;
  
  &.completed {
    opacity: 0.6;
    
    .todo-content {
      text-decoration: line-through;
      color: #94a3b8;
    }
    
    .todo-meta {
      opacity: 0.6;
    }
  }
  
  &:active {
    background-color: #f1f5f9;
  }
}

.todo-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
  transition: all 0.2s ease;
  
  &.checked {
    background-color: #4f46e5;
    border-color: #4f46e5;
    color: #ffffff;
    font-size: 24rpx;
  }
}

.todo-info {
  flex: 1;
}

.todo-content {
  font-size: 28rpx;
  color: #1e293b;
  font-weight: 500;
  display: block;
  margin-bottom: 10rpx;
}

.todo-meta {
  display: flex;
  gap: 16rpx;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  
  &.overdue {
    background-color: #fef2f2;
    
    .meta-tag-text {
      color: #dc2626;
    }
  }
}

.meta-tag-icon {
  font-size: 20rpx;
}

.meta-tag-text {
  font-size: 24rpx;
  color: #64748b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.empty-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #94a3b8;
}

.record-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx dashed #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.record-label {
  font-size: 26rpx;
  color: #64748b;
}

.record-value {
  font-size: 26rpx;
  color: #334155;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #94a3b8;
}
</style>