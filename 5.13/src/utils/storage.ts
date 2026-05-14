import type { MeetingRecord, MeetingFormData, TodoItem } from '@/types/meeting'

const STORAGE_KEY = 'meeting_records'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getMeetingList(query?: { keyword?: string; dateRange?: { start: string; end: string }; status?: 'draft' | 'submitted' | 'all' }): MeetingRecord[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    let list: MeetingRecord[] = data ? JSON.parse(data) : []
    
    if (query) {
      if (query.keyword) {
        list = list.filter(m => m.meetingTheme.includes(query.keyword!))
      }
      if (query.dateRange && query.dateRange.start && query.dateRange.end) {
        list = list.filter(m => m.meetingDate >= query.dateRange.start && m.meetingDate <= query.dateRange.end)
      }
      if (query.status && query.status !== 'all') {
        list = list.filter(m => m.status === query.status)
      }
    }
    
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export function saveMeeting(record: MeetingFormData): MeetingRecord {
  const now = new Date().toISOString()
  const meeting: MeetingRecord = {
    ...record,
    meetingId: generateId(),
    createdAt: now,
    updatedAt: now
  }
  const list = getMeetingList()
  list.unshift(meeting)
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  return meeting
}

export function updateMeeting(meetingId: string, record: Partial<MeetingRecord>): boolean {
  const list = getMeetingList()
  const index = list.findIndex(m => m.meetingId === meetingId)
  if (index === -1) return false
  list[index] = {
    ...list[index],
    ...record,
    updatedAt: new Date().toISOString()
  }
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  return true
}

export function deleteMeeting(meetingId: string): boolean {
  const list = getMeetingList()
  const filtered = list.filter(m => m.meetingId !== meetingId)
  if (filtered.length === list.length) return false
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function getMeetingById(meetingId: string): MeetingRecord | null {
  const list = getMeetingList()
  return list.find(m => m.meetingId === meetingId) || null
}

export function toggleTodoStatus(meetingId: string, todoId: string): boolean {
  const list = getMeetingList()
  const meeting = list.find(m => m.meetingId === meetingId)
  if (!meeting) return false
  const todo = meeting.todos.find(t => t.todoId === todoId)
  if (!todo) return false
  todo.completed = !todo.completed
  meeting.updatedAt = new Date().toISOString()
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  return true
}

export function addTodo(meetingId: string, todo: Omit<TodoItem, 'todoId' | 'completed'>): boolean {
  const list = getMeetingList()
  const meeting = list.find(m => m.meetingId === meetingId)
  if (!meeting) return false
  meeting.todos.push({
    ...todo,
    todoId: generateId(),
    completed: false
  })
  meeting.updatedAt = new Date().toISOString()
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  return true
}

export function removeTodo(meetingId: string, todoId: string): boolean {
  const list = getMeetingList()
  const meeting = list.find(m => m.meetingId === meetingId)
  if (!meeting) return false
  const index = meeting.todos.findIndex(t => t.todoId === todoId)
  if (index === -1) return false
  meeting.todos.splice(index, 1)
  meeting.updatedAt = new Date().toISOString()
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  return true
}

export function initMockData(): void {
  const existing = getMeetingList()
  if (existing.length > 0) return
  
  const mockData: MeetingRecord[] = [
    {
      meetingId: 'mock1',
      meetingTheme: 'Q2产品规划会议',
      meetingDate: '2026-05-10',
      startTime: '14:00',
      endTime: '16:00',
      location: '三楼会议室A',
      attendees: ['张三', '李四', '王五', '赵六'],
      absentees: ['孙七'],
      host: '张三',
      recorder: '李四',
      topics: ['Q2季度产品迭代计划', '新功能开发优先级', '技术架构优化方案'],
      discussion: '1. 讨论了Q2季度产品迭代计划，确定了3个核心功能\n2. 确定了新功能开发优先级，用户管理模块优先\n3. 讨论了技术架构优化方案，计划引入微服务架构',
      conclusion: '1. Q2季度计划发布3个核心功能\n2. 用户管理模块作为Q2首月重点\n3. 技术架构优化方案待进一步评估后实施',
      todos: [
        { todoId: 't1', content: '完成产品需求文档', responsible: '张三', deadline: '2026-05-15', completed: true },
        { todoId: 't2', content: '设计系统架构方案', responsible: '李四', deadline: '2026-05-18', completed: false },
        { todoId: 't3', content: '制定测试计划', responsible: '王五', deadline: '2026-05-20', completed: false }
      ],
      status: 'submitted',
      createdAt: '2026-05-10T06:00:00.000Z',
      updatedAt: '2026-05-10T06:00:00.000Z'
    },
    {
      meetingId: 'mock2',
      meetingTheme: '项目进度周例会',
      meetingDate: '2026-05-12',
      startTime: '09:00',
      endTime: '10:00',
      location: '二楼会议室B',
      attendees: ['张三', '李四', '王五', '赵六', '孙七'],
      absentees: [],
      host: '李四',
      recorder: '王五',
      topics: ['各模块进度汇报', '技术难点讨论', '下周工作计划'],
      discussion: '1. 各模块进度汇报：前端完成80%，后端完成75%\n2. 讨论了当前遇到的技术难点：接口性能优化问题\n3. 调整了下周工作计划，优先解决性能问题',
      conclusion: '1. 整体进度符合预期\n2. 接口性能优化列为最高优先级\n3. 下周完成性能优化方案并开始实施',
      todos: [
        { todoId: 't4', content: '修复登录模块bug', responsible: '赵六', deadline: '2026-05-14', completed: true },
        { todoId: 't5', content: '优化首页加载性能', responsible: '孙七', deadline: '2026-05-16', completed: false }
      ],
      status: 'submitted',
      createdAt: '2026-05-12T01:00:00.000Z',
      updatedAt: '2026-05-13T02:00:00.000Z'
    },
    {
      meetingId: 'mock3',
      meetingTheme: '需求评审会议',
      meetingDate: '2026-05-15',
      startTime: '10:00',
      endTime: '11:30',
      location: '一楼大会议室',
      attendees: ['张三', '李四', '王五'],
      absentees: ['赵六'],
      host: '张三',
      recorder: '王五',
      topics: ['新功能需求评审', '技术方案讨论'],
      discussion: '1. 评审了新功能需求文档\n2. 讨论了技术实现方案\n3. 初步确定了开发周期',
      conclusion: '1. 需求文档基本通过，需补充部分细节\n2. 技术方案采用React + Node.js架构\n3. 预计开发周期4周',
      todos: [
        { todoId: 't6', content: '补充需求文档细节', responsible: '李四', deadline: '2026-05-17', completed: false },
        { todoId: 't7', content: '完成技术方案设计', responsible: '王五', deadline: '2026-05-19', completed: false }
      ],
      status: 'draft',
      createdAt: '2026-05-13T08:00:00.000Z',
      updatedAt: '2026-05-13T08:00:00.000Z'
    }
  ]
  
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(mockData))
}