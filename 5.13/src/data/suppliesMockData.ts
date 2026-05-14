import type { SupplyItem, Application, User, Notification } from '@/types/supplies'

export const mockSupplyItems: SupplyItem[] = [
  { id: '1', name: 'A4打印纸', spec: '70g', unit: '箱', stock: 50, minStock: 10, category: 'consumables', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: '黑色签字笔', spec: '0.5mm', unit: '盒', stock: 120, minStock: 20, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: '文件夹', spec: 'A4', unit: '个', stock: 80, minStock: 15, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: '订书机', spec: '标准型', unit: '个', stock: 30, minStock: 5, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: '便签纸', spec: '3×3英寸', unit: '本', stock: 60, minStock: 10, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: '办公椅', spec: '人体工学', unit: '把', stock: 15, minStock: 3, category: 'furniture', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: '笔记本电脑', spec: 'ThinkPad X1', unit: '台', stock: 8, minStock: 2, category: 'computer', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '8', name: '打印机', spec: 'HP LaserJet', unit: '台', stock: 5, minStock: 1, category: 'computer', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', name: '鼠标', spec: '无线蓝牙', unit: '个', stock: 25, minStock: 5, category: 'computer', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '10', name: '键盘', spec: '机械键盘', unit: '个', stock: 20, minStock: 5, category: 'computer', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '11', name: '文件柜', spec: '四门', unit: '个', stock: 10, minStock: 2, category: 'furniture', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '12', name: '办公桌', spec: '1.2米', unit: '张', stock: 8, minStock: 2, category: 'furniture', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '13', name: '纸巾', spec: '抽纸', unit: '包', stock: 100, minStock: 20, category: 'living', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '14', name: '洗手液', spec: '500ml', unit: '瓶', stock: 40, minStock: 10, category: 'living', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '15', name: '垃圾袋', spec: '大号', unit: '卷', stock: 60, minStock: 15, category: 'living', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '16', name: 'U盘', spec: '128GB', unit: '个', stock: 30, minStock: 5, category: 'other', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '17', name: '移动硬盘', spec: '1TB', unit: '个', stock: 15, minStock: 3, category: 'other', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '18', name: '白板笔', spec: '可擦', unit: '支', stock: 50, minStock: 10, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '19', name: '胶带', spec: '透明', unit: '卷', stock: 45, minStock: 10, category: 'consumables', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '20', name: '剪刀', spec: '办公用', unit: '把', stock: 35, minStock: 8, category: 'stationery', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

export const mockUsers: User[] = [
  { id: 'u1', name: '张三', role: 'employee', department: '技术部', departmentId: 'd1', createdAt: '2024-01-01' },
  { id: 'u2', name: '李四', role: 'department_approver', department: '技术部', departmentId: 'd1', createdAt: '2024-01-01' },
  { id: 'u3', name: '王五', role: 'admin', department: '行政部', departmentId: 'd2', createdAt: '2024-01-01' },
  { id: 'u4', name: '赵六', role: 'employee', department: '市场部', departmentId: 'd3', createdAt: '2024-01-01' },
  { id: 'u5', name: '钱七', role: 'department_approver', department: '市场部', departmentId: 'd3', createdAt: '2024-01-01' },
  { id: 'u6', name: '孙八', role: 'employee', department: '人事部', departmentId: 'd4', createdAt: '2024-01-01' }
]

export const mockApplications: Application[] = [
  {
    id: 'app1',
    items: [
      { supplyId: '1', supplyName: 'A4打印纸', spec: '70g', unit: '箱', quantity: 5, currentStock: 50, reason: '项目需求，需要大量打印资料', remark: '优先配送' }
    ],
    applicant: '张三',
    applicantId: 'u1',
    department: '技术部',
    departmentId: 'd1',
    status: 'pending',
    approvalComment: '',
    approverId: '',
    approverName: '',
    issuedItems: [],
    issuerId: '',
    issuerName: '',
    createdAt: '2024-05-10 09:30:00',
    updatedAt: '2024-05-10 09:30:00'
  },
  {
    id: 'app2',
    items: [
      { supplyId: '2', supplyName: '黑色签字笔', spec: '0.5mm', unit: '盒', quantity: 10, currentStock: 120, reason: '部门员工日常办公使用', remark: '' },
      { supplyId: '5', supplyName: '便签纸', spec: '3×3英寸', unit: '本', quantity: 5, currentStock: 60, reason: '会议记录使用', remark: '' }
    ],
    applicant: '赵六',
    applicantId: 'u4',
    department: '市场部',
    departmentId: 'd3',
    status: 'approved',
    approvalComment: '同意申领',
    approverId: 'u5',
    approverName: '钱七',
    issuedItems: [],
    issuerId: '',
    issuerName: '',
    createdAt: '2024-05-09 14:20:00',
    updatedAt: '2024-05-09 15:00:00'
  },
  {
    id: 'app3',
    items: [
      { supplyId: '7', supplyName: '笔记本电脑', spec: 'ThinkPad X1', unit: '台', quantity: 2, currentStock: 8, reason: '新入职员工配备', remark: '需要预装办公软件' }
    ],
    applicant: '孙八',
    applicantId: 'u6',
    department: '人事部',
    departmentId: 'd4',
    status: 'issued',
    approvalComment: '同意配备',
    approverId: 'u2',
    approverName: '李四',
    issuedItems: [{ supplyId: '7', quantity: 2 }],
    issuerId: 'u3',
    issuerName: '王五',
    createdAt: '2024-05-08 10:00:00',
    updatedAt: '2024-05-08 16:00:00'
  },
  {
    id: 'app4',
    items: [
      { supplyId: '3', supplyName: '文件夹', spec: 'A4', unit: '个', quantity: 20, currentStock: 80, reason: '文件整理归档使用', remark: '' }
    ],
    applicant: '张三',
    applicantId: 'u1',
    department: '技术部',
    departmentId: 'd1',
    status: 'rejected',
    approvalComment: '库存充足，暂时不需要申领',
    approverId: 'u2',
    approverName: '李四',
    issuedItems: [],
    issuerId: '',
    issuerName: '',
    createdAt: '2024-05-07 11:30:00',
    updatedAt: '2024-05-07 14:00:00'
  },
  {
    id: 'app5',
    items: [
      { supplyId: '5', supplyName: '便签纸', spec: '3×3英寸', unit: '本', quantity: 15, currentStock: 60, reason: '会议记录使用', remark: '' }
    ],
    applicant: '赵六',
    applicantId: 'u4',
    department: '市场部',
    departmentId: 'd3',
    status: 'withdrawn',
    approvalComment: '',
    approverId: '',
    approverName: '',
    issuedItems: [],
    issuerId: '',
    issuerName: '',
    createdAt: '2024-05-06 09:00:00',
    updatedAt: '2024-05-06 10:30:00'
  },
  {
    id: 'app6',
    items: [
      { supplyId: '9', supplyName: '鼠标', spec: '无线蓝牙', unit: '个', quantity: 3, currentStock: 25, reason: '设备更新', remark: '' },
      { supplyId: '10', supplyName: '键盘', spec: '机械键盘', unit: '个', quantity: 2, currentStock: 20, reason: '设备更新', remark: '' },
      { supplyId: '13', supplyName: '纸巾', spec: '抽纸', unit: '包', quantity: 10, currentStock: 100, reason: '日常消耗补充', remark: '' }
    ],
    applicant: '张三',
    applicantId: 'u1',
    department: '技术部',
    departmentId: 'd1',
    status: 'draft',
    approvalComment: '',
    approverId: '',
    approverName: '',
    issuedItems: [],
    issuerId: '',
    issuerName: '',
    createdAt: '2024-05-11 16:00:00',
    updatedAt: '2024-05-11 16:30:00'
  }
]

export const departments = [
  { id: 'd1', name: '技术部' },
  { id: 'd2', name: '行政部' },
  { id: 'd3', name: '市场部' },
  { id: 'd4', name: '人事部' },
  { id: 'd5', name: '财务部' }
]

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'pending',
    title: '待审批提醒',
    content: '您有新的申领待审批：A4打印纸 ×5箱，请及时处理',
    applicationId: 'app1',
    isRead: false,
    createdAt: '2024-05-10 09:35:00'
  },
  {
    id: 'n2',
    type: 'approved',
    title: '审批通过',
    content: '您的申领（黑色签字笔×10盒、便签纸×5本）已通过审批',
    applicationId: 'app2',
    isRead: false,
    createdAt: '2024-05-09 15:05:00'
  },
  {
    id: 'n3',
    type: 'issued',
    title: '已发放',
    content: '您的申领（笔记本电脑×2台）已发放，请前往领取',
    applicationId: 'app3',
    isRead: false,
    createdAt: '2024-05-08 16:05:00'
  },
  {
    id: 'n4',
    type: 'rejected',
    title: '审批驳回',
    content: '您的申领（文件夹×20个）已被驳回，原因：库存充足，暂时不需要申领',
    applicationId: 'app4',
    isRead: true,
    createdAt: '2024-05-07 14:05:00'
  },
  {
    id: 'n5',
    type: 'low_stock',
    title: '库存预警',
    content: '办公用品库存不足预警：笔记本电脑当前库存8台，已低于最低库存标准',
    supplyId: '7',
    isRead: false,
    createdAt: '2024-05-10 08:00:00'
  },
  {
    id: 'n6',
    type: 'submit_success',
    title: '提交成功',
    content: '您的申领（A4打印纸×5箱）已提交成功，等待部门审批',
    applicationId: 'app1',
    isRead: true,
    createdAt: '2024-05-10 09:31:00'
  }
]
