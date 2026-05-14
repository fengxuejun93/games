import type { MeetingRecord } from '@/types/meeting'
import type { Application } from '@/types/supplies'

export function generateExcelContent(meetings: MeetingRecord[]): string {
  let content = '\uFEFF'
  const headers = [
    '会议主题',
    '会议日期',
    '开始时间',
    '结束时间',
    '参会人',
    '主持人',
    '记录人',
    '会议地点',
    '会议议题',
    '讨论内容',
    '会议结论',
    '待办任务',
    '负责人',
    '截止时间',
    '完成状态'
  ]
  
  content += headers.join('\t') + '\n'
  
  meetings.forEach(meeting => {
    const todos = meeting.todos
    
    if (todos.length === 0) {
      content += formatRow([
        meeting.meetingTheme,
        meeting.meetingDate,
        meeting.startTime,
        meeting.endTime,
        meeting.attendees.join('; '),
        meeting.host,
        meeting.recorder,
        meeting.location,
        meeting.topics.join('; '),
        meeting.discussion || '',
        meeting.conclusion || '',
        '-',
        '-',
        '-',
        '-'
      ])
    } else {
      todos.forEach((todo, index) => {
        content += formatRow([
          index === 0 ? meeting.meetingTheme : '',
          index === 0 ? meeting.meetingDate : '',
          index === 0 ? meeting.startTime : '',
          index === 0 ? meeting.endTime : '',
          index === 0 ? meeting.attendees.join('; ') : '',
          index === 0 ? meeting.host : '',
          index === 0 ? meeting.recorder : '',
          index === 0 ? meeting.location : '',
          index === 0 ? meeting.topics.join('; ') : '',
          index === 0 ? (meeting.discussion || '') : '',
          index === 0 ? (meeting.conclusion || '') : '',
          todo.content,
          todo.responsible,
          todo.deadline,
          todo.completed ? '已完成' : '未完成'
        ])
      })
    }
  })
  
  return content
}

function formatRow(row: string[]): string {
  return row.map(cell => {
    const escaped = cell.replace(/\t/g, ' ').replace(/\n/g, ' ')
    if (escaped.includes(',')) {
      return `"${escaped}"`
    }
    return escaped
  }).join('\t') + '\n'
}

export function generateFileName(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `会议记录_${year}${month}${day}.csv`
}

export function downloadFile(content: string, filename: string): void {
  #ifdef H5
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  #endif
  
  #ifndef H5
  uni.showToast({
    title: '正在导出...',
    icon: 'loading',
    duration: 1500
  })
  
  setTimeout(() => {
    uni.setClipboardData({
      data: content,
      success: () => {
        uni.showToast({
          title: '导出成功，内容已复制',
          icon: 'success'
        })
      },
      fail: () => {
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    })
  }, 1000)
  #endif
}

export function exportMeetings(meetings: MeetingRecord[]): void {
  if (meetings.length === 0) {
    uni.showToast({
      title: '没有可导出的会议记录',
      icon: 'none'
    })
    return
  }
  
  try {
    const content = generateExcelContent(meetings)
    const filename = generateFileName()
    downloadFile(content, filename)
  } catch (error) {
    uni.showToast({
      title: '导出失败',
      icon: 'none'
    })
  }
}

export function generateSupplyContent(applications: Application[]): string {
  let content = '\uFEFF'
  const headers = [
    '申请单号',
    '物品名称',
    '规格型号',
    '单位',
    '申领数量',
    '申领用途',
    '备注',
    '申领人',
    '部门',
    '申请时间',
    '审批状态',
    '审批意见',
    '审批人',
    '发放状态',
    '发放人'
  ]
  
  content += headers.join('\t') + '\n'
  
  applications.forEach(app => {
    const statusLabels: Record<string, string> = {
      pending: '待审批',
      approved: '审批通过',
      rejected: '审批驳回',
      issued: '已发放',
      withdrawn: '已撤回',
      draft: '草稿'
    }
    
    app.items.forEach((item, index) => {
      content += formatRow([
        index === 0 ? app.id : '',
        item.supplyName,
        item.spec,
        item.unit,
        String(item.quantity),
        item.reason,
        item.remark || '',
        index === 0 ? app.applicant : '',
        index === 0 ? app.department : '',
        index === 0 ? app.createdAt : '',
        index === 0 ? (statusLabels[app.status] || app.status) : '',
        index === 0 ? (app.approvalComment || '') : '',
        index === 0 ? (app.approverName || '') : '',
        index === 0 ? (app.status === 'issued' ? '已发放' : '未发放') : '',
        index === 0 ? (app.issuerName || '') : ''
      ])
    })
  })
  
  return content
}

export function generateSupplyFileName(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `办公用品申领记录_${year}${month}${day}.csv`
}

export function exportSupplyApplications(applications: Application[]): void {
  if (applications.length === 0) {
    uni.showToast({
      title: '没有可导出的申领记录',
      icon: 'none'
    })
    return
  }
  
  try {
    const content = generateSupplyContent(applications)
    const filename = generateSupplyFileName()
    downloadFile(content, filename)
  } catch (error) {
    uni.showToast({
      title: '导出失败',
      icon: 'none'
    })
  }
}