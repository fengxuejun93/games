import type { Contract } from '@/types/contract'

export const mockContracts: Contract[] = [
  {
    id: '1',
    contractNo: 'HT-2024-001',
    title: '2024年度办公设备采购合同',
    type: 'purchase',
    status: 'active',
    approvalStatus: 'approved',
    partyA: '北京科技有限公司',
    partyB: '上海数码科技有限公司',
    amount: 580000,
    claimedAmount: 320000,
    currency: 'CNY',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    signingDate: '2023-12-20',
    description: '采购办公电脑、打印机、投影仪等办公设备共计150台',
    attachments: [
      { id: 'a1', name: '合同正文.pdf', url: '#', size: 2048000, type: 'pdf', uploadedAt: '2023-12-20' },
      { id: 'a2', name: '设备清单.xlsx', url: '#', size: 512000, type: 'xlsx', uploadedAt: '2023-12-20' }
    ],
    versions: [
      { id: 'v1', version: 'v1.0', content: '初始版本', updatedAt: '2023-12-20', updatedBy: '张三' },
      { id: 'v2', version: 'v1.1', content: '修改设备数量', updatedAt: '2023-12-22', updatedBy: '李四' }
    ],
    approvalFlow: {
      currentNode: 5,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '财务', role: 'finance', required: true },
        { id: '4', name: '法务', role: 'legal', required: true },
        { id: '5', name: '总经理', role: 'general_manager', required: true }
      ],
      history: [
        { id: 'h1', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '张三', operatedAt: '2023-12-18', status: 'completed' },
        { id: 'h2', nodeId: '2', nodeName: '部门主管', action: 'approve', comment: '同意', operator: '李四', operatedAt: '2023-12-19', status: 'completed' },
        { id: 'h3', nodeId: '3', nodeName: '财务', action: 'approve', comment: '预算已确认', operator: '王五', operatedAt: '2023-12-19', status: 'completed' },
        { id: 'h4', nodeId: '4', nodeName: '法务', action: 'approve', comment: '条款审核通过', operator: '赵六', operatedAt: '2023-12-20', status: 'completed' },
        { id: 'h5', nodeId: '5', nodeName: '总经理', action: 'approve', comment: '同意执行', operator: '钱七', operatedAt: '2023-12-20', status: 'completed' }
      ]
    },
    claims: [
      { id: 'c1', contractId: '1', claimer: '张三', claimerId: 'user001', amount: 150000, currency: 'CNY', purpose: '设备预付款', status: 'confirmed', claimedAt: '2024-01-15', confirmedAt: '2024-01-16', confirmedBy: '李四' },
      { id: 'c2', contractId: '1', claimer: '李四', claimerId: 'user002', amount: 170000, currency: 'CNY', purpose: '中期付款', status: 'confirmed', claimedAt: '2024-06-01', confirmedAt: '2024-06-02', confirmedBy: '王五' }
    ],
    createdAt: '2023-12-20',
    updatedAt: '2023-12-22'
  },
  {
    id: '2',
    contractNo: 'HT-2024-002',
    title: '软件技术服务合同',
    type: 'service',
    status: 'pending_approval',
    approvalStatus: 'approving',
    partyA: '北京科技有限公司',
    partyB: '深圳软件技术有限公司',
    amount: 1200000,
    claimedAmount: 0,
    currency: 'CNY',
    startDate: '2024-02-01',
    endDate: '2024-05-15',
    signingDate: '',
    description: '提供企业管理系统开发及技术支持服务',
    attachments: [
      { id: 'a3', name: '技术服务协议.pdf', url: '#', size: 1536000, type: 'pdf', uploadedAt: '2024-01-25' }
    ],
    versions: [
      { id: 'v3', version: 'v1.0', content: '初始版本', updatedAt: '2024-01-25', updatedBy: '张三' }
    ],
    approvalFlow: {
      currentNode: 2,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '法务', role: 'legal', required: true }
      ],
      history: [
        { id: 'h6', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '张三', operatedAt: '2024-01-25', status: 'completed' },
        { id: 'h7', nodeId: '2', nodeName: '部门主管', action: 'approve', comment: '项目已立项', operator: '李四', operatedAt: '2024-01-26', status: 'completed' }
      ]
    },
    claims: [],
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  },
  {
    id: '3',
    contractNo: 'HT-2024-003',
    title: '产品销售合同',
    type: 'sales',
    status: 'approved',
    approvalStatus: 'approved',
    partyA: '北京科技有限公司',
    partyB: '广州贸易有限公司',
    amount: 850000,
    claimedAmount: 425000,
    currency: 'CNY',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    signingDate: '2024-02-28',
    description: '销售智能终端设备500台',
    attachments: [
      { id: 'a4', name: '销售合同.pdf', url: '#', size: 1024000, type: 'pdf', uploadedAt: '2024-02-28' },
      { id: 'a5', name: '产品规格书.pdf', url: '#', size: 768000, type: 'pdf', uploadedAt: '2024-02-28' }
    ],
    versions: [
      { id: 'v4', version: 'v1.0', content: '初始版本', updatedAt: '2024-02-28', updatedBy: '王五' }
    ],
    approvalFlow: {
      currentNode: 4,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '财务', role: 'finance', required: true },
        { id: '4', name: '法务', role: 'legal', required: true }
      ],
      history: [
        { id: 'h8', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '王五', operatedAt: '2024-02-26', status: 'completed' },
        { id: 'h9', nodeId: '2', nodeName: '部门主管', action: 'approve', comment: '同意', operator: '李四', operatedAt: '2024-02-27', status: 'completed' },
        { id: 'h10', nodeId: '3', nodeName: '财务', action: 'approve', comment: '回款计划已确认', operator: '赵六', operatedAt: '2024-02-27', status: 'completed' },
        { id: 'h11', nodeId: '4', nodeName: '法务', action: 'approve', comment: '审核通过', operator: '孙八', operatedAt: '2024-02-28', status: 'completed' }
      ]
    },
    claims: [
      { id: 'c3', contractId: '3', claimer: '王五', claimerId: 'user003', amount: 425000, currency: 'CNY', purpose: '首批货款', status: 'pending', claimedAt: '2024-04-15' }
    ],
    createdAt: '2024-02-28',
    updatedAt: '2024-02-28'
  },
  {
    id: '4',
    contractNo: 'HT-2024-004',
    title: '员工劳动合同',
    type: 'hr',
    status: 'active',
    approvalStatus: 'approved',
    partyA: '北京科技有限公司',
    partyB: '李明',
    amount: 240000,
    claimedAmount: 0,
    currency: 'CNY',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    signingDate: '2023-12-15',
    description: '技术岗位劳动合同',
    attachments: [
      { id: 'a6', name: '劳动合同.pdf', url: '#', size: 512000, type: 'pdf', uploadedAt: '2023-12-15' }
    ],
    versions: [
      { id: 'v5', version: 'v1.0', content: '初始版本', updatedAt: '2023-12-15', updatedBy: '赵六' }
    ],
    approvalFlow: {
      currentNode: 3,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '总经理', role: 'general_manager', required: true }
      ],
      history: [
        { id: 'h12', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '新员工入职', operator: '赵六', operatedAt: '2023-12-14', status: 'completed' },
        { id: 'h13', nodeId: '2', nodeName: '部门主管', action: 'approve', comment: '同意录用', operator: '李四', operatedAt: '2023-12-14', status: 'completed' },
        { id: 'h14', nodeId: '3', nodeName: '总经理', action: 'approve', comment: '同意', operator: '钱七', operatedAt: '2023-12-15', status: 'completed' }
      ]
    },
    claims: [],
    createdAt: '2023-12-15',
    updatedAt: '2023-12-15'
  },
  {
    id: '5',
    contractNo: 'HT-2024-005',
    title: '服务器托管服务合同',
    type: 'service',
    status: 'archived',
    approvalStatus: 'approved',
    partyA: '北京科技有限公司',
    partyB: '阿里云科技有限公司',
    amount: 360000,
    claimedAmount: 360000,
    currency: 'CNY',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    signingDate: '2022-12-20',
    description: '云服务器托管及运维服务',
    attachments: [
      { id: 'a7', name: '托管协议.pdf', url: '#', size: 1024000, type: 'pdf', uploadedAt: '2022-12-20' }
    ],
    versions: [
      { id: 'v6', version: 'v1.0', content: '初始版本', updatedAt: '2022-12-20', updatedBy: '张三' },
      { id: 'v7', version: 'v1.1', content: '续约补充协议', updatedAt: '2023-06-15', updatedBy: '张三' }
    ],
    approvalFlow: {
      currentNode: 3,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '法务', role: 'legal', required: true }
      ],
      history: [
        { id: 'h15', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '张三', operatedAt: '2022-12-18', status: 'completed' },
        { id: 'h16', nodeId: '2', nodeName: '部门主管', action: 'approve', comment: '同意', operator: '李四', operatedAt: '2022-12-19', status: 'completed' },
        { id: 'h17', nodeId: '3', nodeName: '法务', action: 'approve', comment: '审核通过', operator: '赵六', operatedAt: '2022-12-20', status: 'completed' }
      ]
    },
    claims: [
      { id: 'c4', contractId: '5', claimer: '张三', claimerId: 'user001', amount: 360000, currency: 'CNY', purpose: '年度服务费', status: 'confirmed', claimedAt: '2023-01-15', confirmedAt: '2023-01-16', confirmedBy: '李四' }
    ],
    createdAt: '2022-12-20',
    updatedAt: '2023-06-15'
  },
  {
    id: '6',
    contractNo: 'HT-2024-006',
    title: '原材料采购框架协议',
    type: 'purchase',
    status: 'draft',
    approvalStatus: 'pending',
    partyA: '北京科技有限公司',
    partyB: '天津材料科技有限公司',
    amount: 2000000,
    claimedAmount: 0,
    currency: 'CNY',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    signingDate: '',
    description: '年度原材料采购框架协议',
    attachments: [],
    versions: [
      { id: 'v8', version: 'v1.0', content: '草稿版本', updatedAt: '2024-03-10', updatedBy: '李四' }
    ],
    approvalFlow: {
      currentNode: 0,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '财务', role: 'finance', required: true },
        { id: '4', name: '法务', role: 'legal', required: true },
        { id: '5', name: '总经理', role: 'general_manager', required: true }
      ],
      history: []
    },
    claims: [],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10'
  },
  {
    id: '7',
    contractNo: 'HT-2024-007',
    title: '广告服务合同',
    type: 'service',
    status: 'cancelled',
    approvalStatus: 'rejected',
    partyA: '北京科技有限公司',
    partyB: '上海广告传媒有限公司',
    amount: 150000,
    claimedAmount: 0,
    currency: 'CNY',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    signingDate: '2023-12-10',
    description: '线上广告投放服务',
    attachments: [
      { id: 'a8', name: '广告合同.pdf', url: '#', size: 768000, type: 'pdf', uploadedAt: '2023-12-10' }
    ],
    versions: [
      { id: 'v9', version: 'v1.0', content: '初始版本', updatedAt: '2023-12-10', updatedBy: '王五' }
    ],
    approvalFlow: {
      currentNode: 2,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '法务', role: 'legal', required: true }
      ],
      history: [
        { id: 'h18', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '王五', operatedAt: '2023-12-08', status: 'completed' },
        { id: 'h19', nodeId: '2', nodeName: '部门主管', action: 'reject', comment: '预算不足，暂缓执行', operator: '李四', operatedAt: '2023-12-09', status: 'rejected' }
      ]
    },
    claims: [],
    createdAt: '2023-12-10',
    updatedAt: '2023-12-10'
  },
  {
    id: '8',
    contractNo: 'HT-2024-008',
    title: '咨询服务合同',
    type: 'service',
    status: 'pending_approval',
    approvalStatus: 'approving',
    partyA: '北京科技有限公司',
    partyB: '国际咨询管理有限公司',
    amount: 450000,
    claimedAmount: 0,
    currency: 'CNY',
    startDate: '2024-05-01',
    endDate: '2024-05-20',
    signingDate: '',
    description: '企业管理咨询服务',
    attachments: [
      { id: 'a9', name: '咨询合同.pdf', url: '#', size: 512000, type: 'pdf', uploadedAt: '2024-04-25' }
    ],
    versions: [
      { id: 'v10', version: 'v1.0', content: '初始版本', updatedAt: '2024-04-25', updatedBy: '赵六' }
    ],
    approvalFlow: {
      currentNode: 1,
      nodes: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '法务', role: 'legal', required: true }
      ],
      history: [
        { id: 'h20', nodeId: '1', nodeName: '发起人', action: 'approve', comment: '提交审批', operator: '赵六', operatedAt: '2024-04-25', status: 'completed' }
      ]
    },
    claims: [],
    createdAt: '2024-04-25',
    updatedAt: '2024-04-25'
  }
]