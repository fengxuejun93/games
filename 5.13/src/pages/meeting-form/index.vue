<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-content">
      <view class="form-section basic-info">
        <view class="section-header">
          <view class="section-icon">📋</view>
          <view class="section-title-wrap">
            <text class="section-title">基础信息</text>
            <text class="section-desc">会议基本信息设置</text>
          </view>
        </view>
        
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">会议主题</text>
            <text class="label-required">*</text>
            <input class="form-input" placeholder="请输入会议主题" v-model="formData.meetingTheme" />
          </view>
          
          <view class="form-row">
            <view class="form-item flex-1">
              <text class="form-label">会议日期</text>
              <text class="label-required">*</text>
              <picker mode="date" :value="formData.meetingDate" @change="onDateChange">
                <view class="form-picker">
                  <text class="picker-value">{{ formData.meetingDate || '选择日期' }}</text>
                  <text class="picker-icon">📅</text>
                </view>
              </picker>
            </view>
            <view class="form-item flex-1">
              <text class="form-label">开始时间</text>
              <text class="label-required">*</text>
              <picker mode="time" :value="formData.startTime" @change="onStartTimeChange">
                <view class="form-picker">
                  <text class="picker-value">{{ formData.startTime || '开始时间' }}</text>
                  <text class="picker-icon">🕐</text>
                </view>
              </picker>
            </view>
            <view class="form-item flex-1">
              <text class="form-label">结束时间</text>
              <text class="label-required">*</text>
              <picker mode="time" :value="formData.endTime" @change="onEndTimeChange">
                <view class="form-picker">
                  <text class="picker-value">{{ formData.endTime || '结束时间' }}</text>
                  <text class="picker-icon">🕐</text>
                </view>
              </picker>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">会议地点</text>
            <text class="label-required">*</text>
            <input class="form-input" placeholder="请输入会议地点" v-model="formData.location" />
          </view>
          
          <view class="form-row">
            <view class="form-item flex-1">
              <text class="form-label">主持人</text>
              <text class="label-required">*</text>
              <input class="form-input" placeholder="请输入主持人" v-model="formData.host" />
            </view>
            <view class="form-item flex-1">
              <text class="form-label">记录人</text>
              <text class="label-required">*</text>
              <input class="form-input" placeholder="请输入记录人" v-model="formData.recorder" />
            </view>
          </view>
        </view>
      </view>
      
      <view class="form-section attendees-info">
        <view class="section-header">
          <view class="section-icon">👥</view>
          <view class="section-title-wrap">
            <text class="section-title">参会人员</text>
            <text class="section-desc">管理参会与缺席人员</text>
          </view>
        </view>
        
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">参会人</text>
            <view class="tag-container">
              <view 
                class="tag present" 
                v-for="(person, index) in formData.attendees" 
                :key="'attend-' + index"
              >
                {{ person }}
                <text class="tag-close" @click="removeAttendee(index)">×</text>
              </view>
              <input 
                class="tag-input" 
                placeholder="添加参会人" 
                v-model="newAttendee"
                @confirm="addAttendee"
              />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">缺席人</text>
            <view class="tag-container">
              <view 
                class="tag absent" 
                v-for="(person, index) in formData.absentees" 
                :key="'absent-' + index"
              >
                {{ person }}
                <text class="tag-close" @click="removeAbsentee(index)">×</text>
              </view>
              <input 
                class="tag-input" 
                placeholder="添加缺席人" 
                v-model="newAbsentee"
                @confirm="addAbsentee"
              />
            </view>
          </view>
        </view>
      </view>
      
      <view class="form-section meeting-content">
        <view class="section-header">
          <view class="section-icon">📝</view>
          <view class="section-title-wrap">
            <text class="section-title">会议纪要</text>
            <text class="section-desc">记录会议议题与结论</text>
          </view>
        </view>
        
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">会议议题</text>
            <view class="tag-container">
              <view 
                class="tag topic" 
                v-for="(topic, index) in formData.topics" 
                :key="'topic-' + index"
              >
                {{ topic }}
                <text class="tag-close" @click="removeTopic(index)">×</text>
              </view>
              <input 
                class="tag-input" 
                placeholder="添加议题" 
                v-model="newTopic"
                @confirm="addTopic"
              />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">讨论内容</text>
            <textarea 
              class="form-textarea" 
              placeholder="请输入讨论内容..." 
              v-model="formData.discussion"
              :maxlength="-1"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">会议结论</text>
            <textarea 
              class="form-textarea" 
              placeholder="请输入会议结论..." 
              v-model="formData.conclusion"
              :maxlength="-1"
            />
          </view>
        </view>
      </view>
      
      <view class="form-section todo-section">
        <view class="section-header">
          <view class="section-icon">✅</view>
          <view class="section-title-wrap">
            <text class="section-title">待办任务</text>
            <text class="section-desc">分配任务与跟进进度</text>
          </view>
          <button class="add-todo-btn" @click="showAddTodo = true">
            <text class="btn-icon">+</text>
            <text class="btn-text">添加任务</text>
          </button>
        </view>
        
        <view class="form-content">
          <view class="todo-list" v-if="formData.todos.length > 0">
            <view class="todo-item" v-for="(todo, index) in formData.todos" :key="index">
              <view class="todo-checkbox" :class="{ checked: todo.completed }">
                <text v-if="todo.completed">✓</text>
              </view>
              <view class="todo-info">
                <text class="todo-content">{{ todo.content }}</text>
                <view class="todo-meta">
                  <view class="meta-item">
                    <text class="meta-icon">👤</text>
                    <text class="meta-text">{{ todo.responsible }}</text>
                  </view>
                  <view class="meta-item">
                    <text class="meta-icon">📅</text>
                    <text class="meta-text">{{ todo.deadline }}</text>
                  </view>
                </view>
              </view>
              <view class="todo-actions">
                <text class="action-btn delete" @click="removeTodo(index)">删除</text>
              </view>
            </view>
          </view>
          <view class="empty-todo" v-else>
            <text class="empty-icon">📋</text>
            <text class="empty-text">暂无待办任务</text>
            <text class="empty-hint">点击右上角按钮添加</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="footer-btn-wrap">
      <button class="footer-btn draft" @click="handleSave('draft')">
        <text class="btn-icon">📌</text>
        <text class="btn-text">保存草稿</text>
      </button>
      <button class="footer-btn save" @click="handleSave('save')">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存</text>
      </button>
      <button class="footer-btn submit" @click="handleSave('submit')">
        <text class="btn-icon">🚀</text>
        <text class="btn-text">提交</text>
      </button>
    </view>
    
    <view class="modal-mask" v-if="showAddTodo" @click="showAddTodo = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <view class="modal-icon">➕</view>
          <view class="modal-title-wrap">
            <text class="modal-title">添加待办任务</text>
            <text class="modal-desc">填写任务详情</text>
          </view>
          <text class="modal-close" @click="showAddTodo = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">任务内容</text>
            <text class="label-required">*</text>
            <input class="form-input" placeholder="请输入任务内容" v-model="todoForm.content" />
          </view>
          <view class="form-row">
            <view class="form-item flex-1">
              <text class="form-label">负责人</text>
              <text class="label-required">*</text>
              <input class="form-input" placeholder="请输入负责人" v-model="todoForm.responsible" />
            </view>
            <view class="form-item flex-1">
              <text class="form-label">截止日期</text>
              <text class="label-required">*</text>
              <picker mode="date" :value="todoForm.deadline" @change="onTodoDateChange">
                <view class="form-picker modal-picker">
                  <text class="picker-value">{{ todoForm.deadline || '选择日期' }}</text>
                  <text class="picker-icon">📅</text>
                </view>
              </picker>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showAddTodo = false">取消</button>
          <button class="modal-btn confirm" @click="handleAddTodo">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { MeetingRecord, MeetingFormData } from '@/types/meeting'
import { saveMeeting, updateMeeting, getMeetingById } from '@/utils/storage'

const isEdit = ref(false)
const meetingId = ref('')
const showAddTodo = ref(false)

const formData = reactive<MeetingFormData>({
  meetingTheme: '',
  meetingDate: '',
  startTime: '',
  endTime: '',
  location: '',
  attendees: [],
  absentees: [],
  host: '',
  recorder: '',
  topics: [],
  discussion: '',
  conclusion: '',
  todos: [],
  status: 'draft'
})

const newAttendee = ref('')
const newAbsentee = ref('')
const newTopic = ref('')

const todoForm = reactive({
  content: '',
  responsible: '',
  deadline: ''
})

function onDateChange(e: any) {
  formData.meetingDate = e.detail.value
}

function onStartTimeChange(e: any) {
  formData.startTime = e.detail.value
}

function onEndTimeChange(e: any) {
  formData.endTime = e.detail.value
}

function onTodoDateChange(e: any) {
  todoForm.deadline = e.detail.value
}

function addAttendee() {
  const name = newAttendee.value.trim()
  if (name && !formData.attendees.includes(name)) {
    formData.attendees.push(name)
    newAttendee.value = ''
  }
}

function removeAttendee(index: number) {
  formData.attendees.splice(index, 1)
}

function addAbsentee() {
  const name = newAbsentee.value.trim()
  if (name && !formData.absentees.includes(name)) {
    formData.absentees.push(name)
    newAbsentee.value = ''
  }
}

function removeAbsentee(index: number) {
  formData.absentees.splice(index, 1)
}

function addTopic() {
  const topic = newTopic.value.trim()
  if (topic && !formData.topics.includes(topic)) {
    formData.topics.push(topic)
    newTopic.value = ''
  }
}

function removeTopic(index: number) {
  formData.topics.splice(index, 1)
}

function handleAddTodo() {
  if (!todoForm.content || !todoForm.responsible || !todoForm.deadline) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  
  formData.todos.push({
    todoId: '',
    content: todoForm.content,
    responsible: todoForm.responsible,
    deadline: todoForm.deadline,
    completed: false
  })
  
  todoForm.content = ''
  todoForm.responsible = ''
  todoForm.deadline = ''
  showAddTodo.value = false
}

function removeTodo(index: number) {
  formData.todos.splice(index, 1)
}

function validateForm(): boolean {
  if (!formData.meetingTheme.trim()) {
    uni.showToast({ title: '请输入会议主题', icon: 'none' })
    return false
  }
  if (!formData.meetingDate) {
    uni.showToast({ title: '请选择会议日期', icon: 'none' })
    return false
  }
  if (!formData.startTime) {
    uni.showToast({ title: '请选择开始时间', icon: 'none' })
    return false
  }
  if (!formData.endTime) {
    uni.showToast({ title: '请选择结束时间', icon: 'none' })
    return false
  }
  if (!formData.location.trim()) {
    uni.showToast({ title: '请输入会议地点', icon: 'none' })
    return false
  }
  if (!formData.host.trim()) {
    uni.showToast({ title: '请输入主持人', icon: 'none' })
    return false
  }
  if (!formData.recorder.trim()) {
    uni.showToast({ title: '请输入记录人', icon: 'none' })
    return false
  }
  return true
}

function handleSave(action: 'draft' | 'save' | 'submit') {
  if (action !== 'draft' && !validateForm()) return
  
  const status = action === 'submit' ? 'submitted' : 'draft'
  
  if (isEdit.value) {
    const record: Partial<MeetingRecord> = {
      ...formData,
      status,
      todos: formData.todos.map(t => ({ ...t, todoId: t.todoId || Date.now().toString(36) }))
    }
    updateMeeting(meetingId.value, record)
    uni.showToast({ title: action === 'submit' ? '提交成功' : '保存成功', icon: 'success' })
  } else {
    const record: MeetingFormData = {
      ...formData,
      status,
      todos: formData.todos.map(t => ({ ...t, todoId: Date.now().toString(36) }))
    }
    saveMeeting(record)
    uni.showToast({ title: action === 'submit' ? '提交成功' : '保存成功', icon: 'success' })
  }
  
  setTimeout(() => {
    uni.$emit('meetingUpdated')
    uni.navigateBack()
  }, 1500)
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  
  if (options.id) {
    isEdit.value = true
    meetingId.value = options.id
    const meeting = getMeetingById(options.id)
    if (meeting) {
      formData.meetingTheme = meeting.meetingTheme
      formData.meetingDate = meeting.meetingDate
      formData.startTime = meeting.startTime
      formData.endTime = meeting.endTime
      formData.location = meeting.location
      formData.attendees = [...meeting.attendees]
      formData.absentees = [...meeting.absentees]
      formData.host = meeting.host
      formData.recorder = meeting.recorder
      formData.topics = [...meeting.topics]
      formData.discussion = meeting.discussion
      formData.conclusion = meeting.conclusion
      formData.todos = [...meeting.todos]
      formData.status = meeting.status
    }
  }
})
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.scroll-content {
  flex: 1;
  padding: 24rpx;
}

.form-section {
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
  font-size: 36rpx;
  margin-right: 16rpx;
}

.section-title-wrap {
  flex: 1;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.section-desc {
  font-size: 24rpx;
  color: #64748b;
}

.add-todo-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 24rpx;
  
  &:active {
    opacity: 0.85;
  }
}

.form-content {
  padding: 24rpx 28rpx;
}

.form-item {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-row {
  display: flex;
  gap: 16rpx;
}

.flex-1 {
  flex: 1;
}

.form-label {
  font-size: 26rpx;
  color: #475569;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: inline-block;
}

.label-required {
  color: #dc2626;
  margin-left: 4rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  background-color: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4f46e5;
    background-color: #ffffff;
  }
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
}

.picker-value {
  font-size: 28rpx;
  color: #1e293b;
}

.picker-icon {
  font-size: 24rpx;
}

.form-textarea {
  width: 100%;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  background-color: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  min-height: 180rpx;
  line-height: 1.6;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4f46e5;
    background-color: #ffffff;
  }
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 16rpx;
  background-color: #f8fafc;
  border: 1rpx dashed #cbd5e1;
  border-radius: 12rpx;
  min-height: 72rpx;
}

.tag {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 500;
  
  &.present {
    background-color: #eff6ff;
    color: #2563eb;
  }
  
  &.absent {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  &.topic {
    background-color: #ecfdf5;
    color: #059669;
  }
}

.tag-close {
  margin-left: 10rpx;
  font-size: 32rpx;
  line-height: 1;
  opacity: 0.7;
  
  &:active {
    opacity: 1;
  }
}

.tag-input {
  border: none;
  font-size: 26rpx;
  flex: 1;
  min-width: 180rpx;
  background: transparent;
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
  gap: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-icon {
  font-size: 22rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #64748b;
}

.todo-actions {
  margin-left: 12rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #64748b;
  padding: 8rpx 16rpx;
  
  &.delete {
    color: #dc2626;
  }
  
  &:active {
    opacity: 0.7;
  }
}

.empty-todo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.empty-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #94a3b8;
}

.footer-btn-wrap {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.footer-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  border: none;
  transition: all 0.2s ease;
  
  &.draft {
    background-color: #f8fafc;
    
    .btn-icon {
      font-size: 28rpx;
    }
    
    .btn-text {
      font-size: 26rpx;
      color: #64748b;
      font-weight: 500;
    }
  }
  
  &.save {
    background-color: #eff6ff;
    
    .btn-icon {
      font-size: 28rpx;
    }
    
    .btn-text {
      font-size: 26rpx;
      color: #2563eb;
      font-weight: 500;
    }
  }
  
  &.submit {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    
    .btn-icon {
      font-size: 28rpx;
    }
    
    .btn-text {
      font-size: 26rpx;
      color: #ffffff;
      font-weight: 500;
    }
  }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.modal-mask {
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

.modal-content {
  width: 100%;
  max-width: 640rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1rpx solid #e2e8f0;
}

.modal-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
  color: #4f46e5;
}

.modal-title-wrap {
  flex: 1;
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.modal-desc {
  font-size: 24rpx;
  color: #64748b;
}

.modal-close {
  font-size: 44rpx;
  color: #94a3b8;
  line-height: 1;
}

.modal-body {
  padding: 28rpx;
}

.modal-picker {
  justify-content: flex-start;
  gap: 12rpx;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #e2e8f0;
  
  .modal-btn {
    flex: 1;
    padding: 28rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
    
    &.cancel {
      color: #64748b;
      border-right: 1rpx solid #e2e8f0;
    }
    
    &.confirm {
      color: #4f46e5;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style>