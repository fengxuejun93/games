export type UserRole = 'employee' | 'department_approver' | 'admin'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'issued' | 'withdrawn' | 'draft'

export type SupplyUnit = '个' | '件' | '箱' | '盒' | '支' | '本' | '套' | '台'

export type SupplyCategory = 'stationery' | 'consumables' | 'living' | 'computer' | 'furniture' | 'other'

export interface SupplyItem {
  id: string
  name: string
  spec: string
  unit: SupplyUnit
  stock: number
  minStock: number
  category: SupplyCategory
  createdAt: string
  updatedAt: string
}

export interface ApplicationItem {
  supplyId: string
  supplyName: string
  spec: string
  unit: SupplyUnit
  quantity: number
  currentStock: number
  reason: string
  remark: string
}

export interface Application {
  id: string
  items: ApplicationItem[]
  applicant: string
  applicantId: string
  department: string
  departmentId: string
  status: ApplicationStatus
  approvalComment: string
  approverId: string
  approverName: string
  issuedItems: { supplyId: string; quantity: number }[]
  issuerId: string
  issuerName: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  role: UserRole
  department: string
  departmentId: string
  createdAt: string
}

export interface ApplicationStatusOption {
  value: ApplicationStatus
  label: string
  color: string
}

export interface SupplyUnitOption {
  value: SupplyUnit
  label: string
}

export interface UserRoleOption {
  value: UserRole
  label: string
}

export interface SupplyCategoryOption {
  value: SupplyCategory
  label: string
  icon: string
}

export type NotificationType = 'submit_success' | 'pending' | 'approved' | 'rejected' | 'issued' | 'low_stock'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  applicationId?: string
  supplyId?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationOption {
  value: NotificationType
  label: string
  icon: string
}

export const NOTIFICATION_TYPE_OPTIONS: NotificationOption[] = [
  { value: 'submit_success', label: '提交成功', icon: '✅' },
  { value: 'pending', label: '待审批', icon: '⏳' },
  { value: 'approved', label: '审批通过', icon: '👍' },
  { value: 'rejected', label: '审批驳回', icon: '👎' },
  { value: 'issued', label: '已发放', icon: '📦' },
  { value: 'low_stock', label: '库存预警', icon: '⚠️' }
]

export function getNotificationTypeLabel(type: NotificationType): string {
  const option = NOTIFICATION_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

export function getNotificationTypeIcon(type: NotificationType): string {
  const option = NOTIFICATION_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.icon || '📌'
}

export const APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] = [
  { value: 'pending', label: '待审批', color: '#faad14' },
  { value: 'approved', label: '审批通过', color: '#52c41a' },
  { value: 'rejected', label: '审批驳回', color: '#ff4d4f' },
  { value: 'issued', label: '已发放', color: '#4080ff' },
  { value: 'withdrawn', label: '已撤回', color: '#999999' },
  { value: 'draft', label: '草稿', color: '#722ed1' }
]

export const SUPPLY_UNIT_OPTIONS: SupplyUnitOption[] = [
  { value: '个', label: '个' },
  { value: '件', label: '件' },
  { value: '箱', label: '箱' },
  { value: '盒', label: '盒' },
  { value: '支', label: '支' },
  { value: '本', label: '本' },
  { value: '套', label: '套' },
  { value: '台', label: '台' }
]

export const USER_ROLE_OPTIONS: UserRoleOption[] = [
  { value: 'employee', label: '普通员工' },
  { value: 'department_approver', label: '部门审批人' },
  { value: 'admin', label: '系统管理员' }
]

export const SUPPLY_CATEGORY_OPTIONS: SupplyCategoryOption[] = [
  { value: 'stationery', label: '文具', icon: '✏️' },
  { value: 'consumables', label: '办公耗材', icon: '📦' },
  { value: 'living', label: '生活用品', icon: '🧴' },
  { value: 'computer', label: '电脑配件', icon: '💻' },
  { value: 'furniture', label: '办公家具', icon: '🪑' },
  { value: 'other', label: '其他', icon: '📋' }
]

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const option = APPLICATION_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || status
}

export function getApplicationStatusColor(status: ApplicationStatus): string {
  const option = APPLICATION_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.color || '#999999'
}

export function getUserRoleLabel(role: UserRole): string {
  const option = USER_ROLE_OPTIONS.find(opt => opt.value === role)
  return option?.label || role
}

export function getSupplyCategoryLabel(category: SupplyCategory): string {
  const option = SUPPLY_CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option?.label || category
}

export function getSupplyCategoryIcon(category: SupplyCategory): string {
  const option = SUPPLY_CATEGORY_OPTIONS.find(opt => opt.value