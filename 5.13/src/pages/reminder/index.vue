<template>
  <view class="page">
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title-section">
          <view class="title-icon-wrap">
            <text class="title-icon">🔔</text>
          </view>
          <view class="title-text">
            <text class="page-title">合同到期提醒</text>
            <text class="page-subtitle">最近30天内到期：{{ expiringContracts.length }} 份</text>
          </view>
        </view>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-card urgent">
        <view class="stat-header">
          <view class="stat-icon-wrap urgent">
            <text class="stat-icon">🔥</text>
          </view>
          <view class="stat-badge urgent">紧急</view>
        </view>
        <view class="stat-body">
          <text class="stat-value">{{ urgentCount }}</text>
          <text class="stat-label">7天内到期</text>
        </view>
      </view>
      
      <view class="stat-card warning">
        <view class="stat-header">
          <view class="stat-icon-wrap warning">
            <text class="stat-icon">⚠️</text>
          </view>
          <view class="stat-badge warning">提醒</view>
        </view>
        <view class="stat-body">
          <text class="stat-value">{{ warningCount }}</text>
          <text class="stat-label">30天内到期</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-icon-wrap">
          <text class="section-icon">📅</text>
        </view>
        <text class="section-title">到期时间线</text>
      </view>
      <view class="timeline">
        <view 
          class="timeline-item" 
          v-for="(contract, index) in sortedContracts" 
          :key="contract.id"
          :class="{ urgent: getDaysRemaining(contract.endDate) <= 7, warning: getDaysRemaining(contract.endDate) > 7 && getDaysRemaining(contract.endDate) <= 14 }"
          @click="handleContractClick(contract)"
        >
          <view class="timeline-connector">
            <view class="timeline-dot">
              <text class="dot-inner">{{ index + 1 }}</text>
            </view>
            <view class="timeline-line" v-if="index < sortedContracts.length - 1"></view>
          </view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="contract-title">{{ contract.title }}</text>
              <view class="days-badge" :class="{ urgent: getDaysRemaining(contract.endDate) <= 7, warning: getDaysRemaining(contract.endDate) > 7 && getDaysRemaining(contract.endDate) <= 14 }">
                {{ getDaysRemaining(contract.endDate) }}天后到期
              </view>
            </view>
            <view class="timeline-meta">
              <text class="contract-no">{{ contract.contractNo }}</text>
              <text class="divider">|</text>
              <text class="end-date">{{ contract.endDate }}</text>
            </view>
            <view class="timeline-parties">
              <text class="party">{{ contract.partyA }}</text>
              <text class="party-arrow">与</text>
              <text class="party">{{ contract.partyB }}</text>
            </view>
          </view>
        </view>

        <view class="empty-timeline" v-if="expiringContracts.length === 0">
          <view class="empty-icon-wrap">
            <text class="empty-icon">🎉</text>
          </view>
          <text class="empty-text">太棒了！近期没有即将到期的合同</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-icon-wrap">
          <text class="section-icon">📆</text>
        </view>
        <text class="section-title">到期日历</text>
        <text class="section-subtitle">{{ currentMonth }}</text>
      </view>
      <view class="calendar-container">
        <view class="calendar-header">
          <view class="calendar-nav" @click="prevMonth">‹</view>
          <text class="calendar-title">{{ currentMonth }}</text>
          <view class="calendar-nav" @click="nextMonth">›</view>
        </view>
        <view class="calendar-grid">
          <view class="calendar-weekday" v-for="day in weekdays" :key="day">{{ day }}</view>
          <view 
            class="calendar-day" 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="{ 
              empty: !day.date, 
              today: day.isToday,
              hasExpiring: day.hasExpiring,
              urgent: day.isUrgent,
              warning: day.hasExpiring && !day.isUrgent
            }"
            @click="day.date && handleDateClick(day)"
          >
            <text class="day-number" v-if="day.date">{{ day.date }}</text>
            <view class="day-dots" v-if="day.hasExpiring">
              <view 
                class="dot" 
                :class="{ urgent: day.isUrgent }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <view class="section-icon-wrap">
          <text class="section-icon">📋</text>
        </view>
        <text class="section-title">即将到期合同</text>
        <text class="section-count">{{ expiringContracts.length }} 份</text>
      </view>
      <view class="expiring-list">
        <view 
          class="expiring-item" 
          v-for="contract in sortedContracts" 
          :key="contract.id"
          :class="{ urgent: getDaysRemaining(contract.endDate) <= 7 }"
          @click="handleContractClick(contract)"
        >
          <view class="expiring-priority" :class="{ urgent: getDaysRemaining(contract.endDate) <= 7 }">
            <text class="priority-icon">{{ getDaysRemaining(contract.endDate) <= 7 ? '🔥' : '⚠️' }}</text>
          </view>
          <view class="expiring-info">
            <text class="expiring-title">{{ contract.title }}</text>
            <text class="expiring-desc">{{ contract.partyB }}</text>
            <view class="expiring-meta">
              <text class="contract-no-text">{{ contract.contractNo }}</text>
              <text class="amount-text">{{ contract.currency }} {{ formatAmount(contract.amount) }}</text>
            </view>
          </view>
          <view class="expiring-date" :class="{ urgent: getDaysRemaining(contract.endDate) <= 7 }">
            <text class="date-value">{{ formatDate(contract.endDate) }}</text>
            <text class="date-label">到期</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="expiringContracts.length === 0">
        <view class="empty-icon-wrap">
          <text class="empty-icon">✅</text>
        </view>
        <text class="empty-text">暂无即将到期的合同</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onShow } from '@dcloudio/uni-app'
import { useContractStore } from '@/stores/contract'
import type { Contract } from '@/types/contract'

const contractStore = useContractStore()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref(new Date())

const expiringContracts = computed(() => contractStore.expiringContracts)

const sortedContracts = computed(() => {
  return [...expiringContracts.value].sort((a, b) => {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  })
})

const urgentCount = computed(() => {
  return expiringContracts.value.filter(c => getDaysRemaining(c.endDate) <= 7).length
})

const warningCount = computed(() => {
  return expiringContracts.value.filter(c => getDaysRemaining(c.endDate) > 7 && getDaysRemaining(c.endDate) <= 30).length
})

const currentMonth = computed(() => {
  const now = currentDate.value
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

const calendarDays = computed(() => {
  const now = currentDate.value
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const today = new Date().toISOString().split('T')[0]
  
  const days: { date: number | null; isToday: boolean; hasExpiring: boolean; isUrgent: boolean }[] = []
  
  const startPadding = firstDay.getDay()
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isToday: false, hasExpiring: false, isUrgent: false })
  }
  
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const isToday = currentDateStr === today
    
    const expiringOnDate = expiringContracts.value.filter(c => c.endDate === currentDateStr)
    const hasExpiring = expiringOnDate.length > 0
    const isUrgent = expiringOnDate.some(c => getDaysRemaining(c.endDate) <= 7)
    
    days.push({ date, isToday, hasExpiring, isUrgent })
  }
  
  return days
})

onShow(() => {
  currentDate.value = new Date()
})

function getDaysRemaining(endDateStr: string): number {
  const endDate = new Date(endDateStr)
  const now = new Date()
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function handleContractClick(contract: Contract) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${contract.id}`
  })
}

function handleDateClick(day: { date: number | null; isToday: boolean; hasExpiring: boolean; isUrgent: boolean }) {
}

function prevMonth() {
  const current = currentDate.value
  currentDate.value = new Date(current.getFullYear(), current.getMonth() - 1, 1)
}

function nextMonth() {
  const current = currentDate.value
  currentDate.value = new Date(current.getFullYear(), current.getMonth() + 1, 1)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
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

.stats-row {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  margin-top: -32rpx;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border-left: 8rpx solid transparent;

  &.urgent {
    border-left-color: #ef4444;
  }

  &.warning {
    border-left-color: #f59e0b;
  }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.stat-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.urgent {
    background: rgba(239, 68, 68, 0.08);
  }

  &.warning {
    background: rgba(245, 158, 11, 0.08);
  }
}

.stat-icon {
  font-size: 32rpx;
}

.stat-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.urgent {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
}

.stat-body {
}

.stat-value {
  font-size: 52rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.section-card {
  background: #ffffff;
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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

.section-subtitle {
  margin-left: auto;
  font-size: 26rpx;
  color: #9ca3af;
}

.section-count {
  margin-left: auto;
  font-size: 26rpx;
  color: #9ca3af;
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  position: relative;
  padding-bottom: 32rpx;

  &:last-child {
    padding-bottom: 0;

    .timeline-line {
      display: none;
    }
  }

  &.urgent {
    .timeline-dot {
      background: #ef4444;
    }

    .days-badge {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  &.warning {
    .timeline-dot {
      background: #f59e0b;
    }

    .days-badge {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
  }
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20rpx;
}

.timeline-dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);

  .dot-inner {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: 600;
  }
}

.timeline-line {
  width: 4rpx;
  flex: 1;
  background: #e5e7eb;
  margin-top: 12rpx;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.contract-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  margin-right: 12rpx;
  line-height: 1.4;
}

.days-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  white-space: nowrap;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.contract-no {
  font-size: 24rpx;
  color: #9ca3af;
  font-family: monospace;
}

.divider {
  font-size: 24rpx;
  color: #d1d5db;
}

.end-date {
  font-size: 24rpx;
  color: #6b7280;
}

.timeline-parties {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.party {
  font-size: 24rpx;
  color: #9ca3af;
}

.party-arrow {
  font-size: 22rpx;
  color: #d1d5db;
}

.empty-timeline {
  text-align: center;
  padding: 48rpx;
}

.empty-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.calendar-container {
  padding: 8rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calendar-nav {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #4b5563;
  transition: all 0.2s ease;

  &:active {
    background: #e5e7eb;
    transform: scale(0.95);
  }
}

.calendar-title {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 600;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.calendar-weekday {
  text-align: center;
  font-size: 24rpx;
  color: #9ca3af;
  padding: 12rpx 0;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  position: relative;
  transition: all 0.2s ease;

  &.empty {
    background: transparent;
  }

  &.today {
    background: rgba(37, 99, 235, 0.08);

    .day-number {
      color: #2563eb;
      font-weight: 600;
    }
  }

  &.hasExpiring {
    background: #fffbeb;
  }

  &.urgent {
    background: rgba(239, 68, 68, 0.08);
  }

  &:active {
    transform: scale(0.95);
  }
}

.day-number {
  font-size: 28rpx;
  color: #374151;
}

.day-dots {
  position: absolute;
  bottom: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #f59e0b;

  &.urgent {
    background: #ef4444;
  }
}

.expiring-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.expiring-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fafbfc;
  border-radius: 16rpx;
  border: 1rpx solid #f3f4f6;
  transition: all 0.2s ease;

  &:active {
    background: #f3f4f6;
    transform: scale(0.99);
  }

  &.urgent {
    background: rgba(239, 68, 68, 0.04);
    border-color: rgba(239, 68, 68, 0.15);
  }
}

.expiring-priority {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  background: rgba(245, 158, 11, 0.08);

  &.urgent {
    background: rgba(239, 68, 68, 0.08);
  }
}

.priority-icon {
  font-size: 36rpx;
}

.expiring-info {
  flex: 1;
}

.expiring-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 8rpx;
}

.expiring-desc {
  font-size: 26rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 10rpx;
}

.expiring-meta {
  display: flex;
  justify-content: space-between;
}

.contract-no-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.amount-text {
  font-size: 26rpx;
  color: #2563eb;
  font-weight: 500;
}

.expiring-date {
  text-align: right;
  padding-left: 20rpx;
  border-left: 1rpx solid #e5e7eb;

  &.urgent {
    .date-value {
      color: #ef4444;
    }
  }
}

.date-value {
  font-size: 32rpx;
  color: #1f2937;
  font-weight: 600;
  display: block;
}

.date-label {
  font-size: 22rpx;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 48rpx;
}
</style>