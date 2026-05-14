export interface TodoItem {
  todoId: string
  content: string
  responsible: string
  deadline: string
  completed: boolean
}

export interface MeetingRecord {
  meetingId: string
  meetingTheme: string
  meetingDate: string
  startTime: string
  endTime: string
  location: string
  attendees: string[]
  absentees: string[]
  host: string
  recorder: string
  topics: string[]
  discussion: string
  conclusion: string
  todos: TodoItem[]
  status: 'draft' | 'submitted'
  createdAt: string
  updatedAt: string
}

export type MeetingFormData = Omit<MeetingRecord, 'meetingId' | 'createdAt' | 'updatedAt'>

export interface MeetingListQuery {
  page: number
  pageSize: number
  keyword?: string
  dateRange?: { start: string; end: string }
  status?: 'draft' | 'submitted' | 'all'
}