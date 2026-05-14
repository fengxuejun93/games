export type ContractType = 'purchase' | 'sales' | 'service' | 'hr'

export type ContractStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'archived' | 'cancelled'

export type ApprovalStatus = 'pending' | 'approving' | 'approved' | 'rejected' | 'withdrawn'

export type ApprovalAction = 'approve' | 'reject' | 'transfer' | 'add_sign' | 'withdraw'

export type ClaimStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Contract {
  id: string
  contractNo: string
  title: string
  type: ContractType
  status: ContractStatus
  approvalStatus: ApprovalStatus
  partyA: string
  partyB: string
  amount: number
  claimedAmount: number
  currency: string
  startDate: string
  endDate: string
  signingDate: string
  description: string
  attachments: Attachment[]
  versions: Version[]
  approvalFlow: ApprovalFlow
  claims: Claim[]
  createdAt: string
  updatedAt: string
}

export interface Claim {
  id: string
  contractId: string
  claimer: string
  claimerId: string
  amount: number
  currency: string
  purpose: string
  status: ClaimStatus
  claimedAt: string
  confirmedAt?: string
  confirmedBy?: string
  cancelledAt?: string
  cancelledBy?: string
  cancelReason?: string
}

export interface ClaimStatusOption {
  value: ClaimStatus
  label: string
  color: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export interface Version {
  id: string
  version: string
  content: string
  updatedAt: string
  updatedBy: string
}

export interface ApprovalFlow {
  currentNode: number
  nodes: ApprovalNode[]
  history: ApprovalRecord[]
}

export interface ApprovalNode {
  id: string
  name: string
  role: ApprovalRole
  assignee?: string
  required: boolean
}

export interface ApprovalRecord {
  id: string
  nodeId: string
  nodeName: string
  action: ApprovalAction
  comment: string
  operator: string
  operatedAt: string
  status: 'completed' | 'pending' | 'rejected'
}

export type ApprovalRole = 'initiator' | 'department_head' | 'finance' | 'legal' | 'general_manager'

export interface ApprovalRoleOption {
  value: ApprovalRole
  label: string
}

export interface ContractTypeOption {
  value: ContractType
  label: string
  color: string
}

export interface ContractStatusOption {
  value: ContractStatus
  label: string
  color: string
}

export interface ApprovalStatusOption {
  value: ApprovalStatus
  label: string
  color: string
}

export const CONTRACT_TYPE_OPTIONS: ContractTypeOption[] = [
  { value: 'purchase', label: '采购合同', color: '#4080ff' },
  { value: 'sales', label: '销售合同', color: '#52c41a' },
  { value: 'service', label: '服务合同', color: '#faad14' },
  { value: 'hr', label: '人事合同', color: '#ff4d4f' }
]

export const CONTRACT_STATUS_OPTIONS: ContractStatusOption[] = [
  { value: 'draft', label: '草稿', color: '#999999' },
  { value: 'pending_approval', label: '审批中', color: '#faad14' },
  { value: 'approved', label: '已通过', color: '#52c41a' },
  { value: 'active', label: '生效中', color: '#52c41a' },
  { value: 'archived', label: '已归档', color: '#4080ff' },
  { value: 'cancelled', label: '已作废', color: '#ff4d4f' }
]

export const APPROVAL_STATUS_OPTIONS: ApprovalStatusOption[] = [
  { value: 'pending', label: '待审批', color: '#faad14' },
  { value: 'approving', label: '审批中', color: '#1890ff' },
  { value: 'approved', label: '已通过', color: '#52c41a' },
  { value: 'rejected', label: '已驳回', color: '#ff4d4f' },
  { value: 'withdrawn', label: '已撤回', color: '#999999' }
]

export const APPROVAL_ROLE_OPTIONS: ApprovalRoleOption[] = [
  { value: 'initiator', label: '发起人' },
  { value: 'department_head', label: '部门主管' },
  { value: 'finance', label: '财务' },
  { value: 'legal', label: '法务' },
  { value: 'general_manager', label: '总经理' }
]

export const CLAIM_STATUS_OPTIONS: ClaimStatusOption[] = [
  { value: 'pending', label: '待确认', color: '#f59e0b' },
  { value: 'confirmed', label: '已确认', color: '#10b981' },
  { value: 'cancelled', label: '已取消', color: '#6b7280' }
]

export function getClaimStatusLabel(status: ClaimStatus): string {
  const option = CLAIM_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || status
}

export function getClaimStatusColor(status: ClaimStatus): string {
  const option = CLAIM_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.color || '#9ca3af'
}

export function getContractTypeLabel(type: ContractType): string {
  const option = CONTRACT_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

export function getContractTypeColor(type: ContractType): string {
  const option = CONTRACT_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.color || '#999999'
}

export function getContractStatusLabel(status: ContractStatus): string {
  const option = CONTRACT_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || status
}

export function getContractStatusColor(status: ContractStatus): string {
  const option = CONTRACT_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.color || '#999999'
}

export function getApprovalStatusLabel(status: ApprovalStatus): string {
  const option = APPROVAL_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || status
}

export function getApprovalStatusColor(status: ApprovalStatus): string {
  const option = APPROVAL_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.color || '#999999'
}

export function getApprovalRoleLabel(role: ApprovalRole): string {
  const option = APPROVAL_ROLE_OPTIONS.find(opt => opt.value === role)
  return option?.label || role
}