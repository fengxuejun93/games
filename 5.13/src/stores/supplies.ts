import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SupplyItem, Application, ApplicationStatus, User, UserRole, SupplyCategory, ApplicationItem, Notification, NotificationType } from '@/types/supplies'
import { mockSupplyItems, mockApplications, mockUsers, departments, mockNotifications } from '@/data/suppliesMockData'

export const useSuppliesStore = defineStore('supplies', () => {
  const supplyItems = ref<SupplyItem[]>([...mockSupplyItems])
  const applications = ref<Application[]>([...mockApplications])
  const users = ref<User[]>([...mockUsers])
  const currentUser = ref<User>(mockUsers[0])
  const notifications = ref<Notification[]>([...mockNotifications])

  const pendingApplications = computed(() => 
    applications.value.filter(a => a.status === 'pending')
  )

  const approvedApplications = computed(() => 
    applications.value.filter(a => a.status === 'approved')
  )

  const issuedApplications = computed(() => 
    applications.value.filter(a => a.status === 'issued')
  )

  const rejectedApplications = computed(() => 
    applications.value.filter(a => a.status === 'rejected')
  )

  const withdrawnApplications = computed(() => 
    applications.value.filter(a => a.status === 'withdrawn')
  )

  const draftApplications = computed(() => 
    applications.value.filter(a => a.status === 'draft')
  )

  const lowStockItems = computed(() => 
    supplyItems.value.filter(item => item.stock <= item.minStock)
  )

  const myApplications = computed(() => 
    applications.value.filter(a => a.applicantId === currentUser.value.id)
  )

  const myDepartmentApplications = computed(() => 
    applications.value.filter(a => a.departmentId === currentUser.value.departmentId && a.status === 'pending')
  )

  const myNotifications = computed(() => 
    notifications.value.filter(n => n.isRead === false).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const allMyNotifications = computed(() => 
    notifications.value.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const unreadCount = computed(() => 
    notifications.value.filter(n => n.isRead === false).length
  )

  function setCurrentUser(user: User) {
    currentUser.value = user
  }

  function getSupplyItemById(id: string): SupplyItem | undefined {
    return supplyItems.value.find(item => item.id === id)
  }

  function getApplicationById(id: string): Application | undefined {
    return applications.value.find(app => app.id === id)
  }

  function getUserById(id: string): User | undefined {
    return users.value.find(user => user.id === id)
  }

  function getUsersByRole(role: UserRole): User[] {
    return users.value.filter(user => user.role === role)
  }

  function getUsersByDepartment(departmentId: string): User[] {
    return users.value.filter(user => user.departmentId === departmentId)
  }

  function getSupplyItemsByCategory(category: SupplyCategory): SupplyItem[] {
    return supplyItems.value.filter(item => item.category === category)
  }

  function addApplication(items: ApplicationItem[], status: ApplicationStatus = 'pending') {
    const now = new Date().toLocaleString('zh-CN')
    const newApplication: Application = {
      id: Date.now().toString(),
      items: items.map(item => ({
        ...item,
        currentStock: getSupplyItemById(item.supplyId)?.stock || 0
      })),
      applicant: currentUser.value.name,
      applicantId: currentUser.value.id,
      department: currentUser.value.department,
      departmentId: currentUser.value.departmentId,
      status,
      approvalComment: '',
      approverId: '',
      approverName: '',
      issuedItems: [],
      issuerId: '',
      issuerName: '',
      createdAt: now,
      updatedAt: now
    }
    applications.value.unshift(newApplication)
    return newApplication
  }

  function saveDraft(items: ApplicationItem[]): Application {
    const existingDraft = applications.value.find(
      a => a.applicantId === currentUser.value.id && a.status === 'draft'
    )
    
    if (existingDraft) {
      const index = applications.value.findIndex(a => a.id === existingDraft.id)
      if (index !== -1) {
        applications.value[index] = {
          ...existingDraft,
          items: items.map(item => ({
            ...item,
            currentStock: getSupplyItemById(item.supplyId)?.stock || 0
          })),
          updatedAt: new Date().toLocaleString('zh-CN')
        }
        return applications.value[index]
      }
    }
    
    return addApplication(items, 'draft')
  }

  function submitFromDraft(draftId: string) {
    const index = applications.value.findIndex(a => a.id === draftId)
    if (index !== -1 && applications.value[index].status === 'draft') {
      applications.value[index] = {
        ...applications.value[index],
        status: 'pending',
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      return applications.value[index]
    }
    return undefined
  }

  function approveApplication(id: string, comment: string) {
    const index = applications.value.findIndex(a => a.id === id)
    if (index !== -1) {
      applications.value[index] = {
        ...applications.value[index],
        status: 'approved',
        approvalComment: comment,
        approverId: currentUser.value.id,
        approverName: currentUser.value.name,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      return applications.value[index]
    }
    return undefined
  }

  function rejectApplication(id: string, comment: string) {
    const index = applications.value.findIndex(a => a.id === id)
    if (index !== -1) {
      applications.value[index] = {
        ...applications.value[index],
        status: 'rejected',
        approvalComment: comment,
        approverId: currentUser.value.id,
        approverName: currentUser.value.name,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      return applications.value[index]
    }
    return undefined
  }

  function issueApplication(id: string, issuedItems: { supplyId: string; quantity: number }[]) {
    const index = applications.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const application = applications.value[index]
      
      let allIssued = true
      for (const issued of issuedItems) {
        const supplyIndex = supplyItems.value.findIndex(item => item.id === issued.supplyId)
        if (supplyIndex !== -1 && supplyItems.value[supplyIndex].stock >= issued.quantity) {
          supplyItems.value[supplyIndex] = {
            ...supplyItems.value[supplyIndex],
            stock: supplyItems.value[supplyIndex].stock - issued.quantity,
            updatedAt: new Date().toLocaleString('zh-CN')
          }
        } else {
          allIssued = false
        }
      }

      if (allIssued) {
        applications.value[index] = {
          ...application,
          status: 'issued',
          issuedItems,
          issuerId: currentUser.value.id,
          issuerName: currentUser.value.name,
          updatedAt: new Date().toLocaleString('zh-CN')
        }
        return applications.value[index]
      }
    }
    return undefined
  }

  function withdrawApplication(id: string) {
    const index = applications.value.findIndex(a => a.id === id)
    if (index !== -1 && applications.value[index].status === 'pending') {
      applications.value[index] = {
        ...applications.value[index],
        status: 'withdrawn',
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      return applications.value[index]
    }
    return undefined
  }

  function addSupplyItem(item: Omit<SupplyItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toLocaleString('zh-CN')
    const newItem: SupplyItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    }
    supplyItems.value.push(newItem)
    return newItem
  }

  function updateSupplyItem(id: string, updates: Partial<SupplyItem>) {
    const index = supplyItems.value.findIndex(item => item.id === id)
    if (index !== -1) {
      supplyItems.value[index] = {
        ...supplyItems.value[index],
        ...updates,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
      return supplyItems.value[index]
    }
    return undefined
  }

  function deleteSupplyItem(id: string) {
    const index = supplyItems.value.findIndex(item => item.id === id)
    if (index !== -1) {
      supplyItems.value.splice(index, 1)
      return true
    }
    return false
  }

  function searchApplications(keyword: string, status?: ApplicationStatus, departmentId?: string): Application[] {
    let result = [...applications.value]
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      result = result.filter(a => 
        a.items.some(item => 
          item.supplyName.toLowerCase().includes(lowerKeyword)
        ) ||
        a.applicant.toLowerCase().includes(lowerKeyword) ||
        a.department.toLowerCase().includes(lowerKeyword)
      )
    }
    
    if (status) {
      result = result.filter(a => a.status === status)
    }
    
    if (departmentId) {
      result = result.filter(a => a.departmentId === departmentId)
    }
    
    return result
  }

  function searchSupplyItems(keyword: string, category?: SupplyCategory): SupplyItem[] {
    let result = supplyItems.value
    if (category) {
      result = result.filter(item => item.category === category)
    }
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.spec.toLowerCase().includes(lowerKeyword)
      )
    }
    return result
  }

  function getMyDraft(): Application | undefined {
    return applications.value.find(
      a => a.applicantId === currentUser.value.id && a.status === 'draft'
    )
  }

  function addNotification(type: NotificationType, title: string, content: string, applicationId?: string, supplyId?: string) {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      content,
      applicationId,
      supplyId,
      isRead: false,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    notifications.value.unshift(newNotification)
    return newNotification
  }

  function markNotificationAsRead(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value[index].isRead = true
    }
  }

  function markAllNotificationsAsRead() {
    notifications.value.forEach(n => {
      n.isRead = true
    })
  }

  function createReplication(applicationId: string): Application {
    const original = applications.value.find(a => a.id === applicationId)
    if (!original) {
      throw new Error('申请单不存在')
    }

    const now = new Date().toLocaleString('zh-CN')
    const replicatedItems = original.items.map(item => {
      const supply = getSupplyItemById(item.supplyId)
      return {
        ...item,
        currentStock: supply?.stock || 0
      }
    })

    const newApplication: Application = {
      id: Date.now().toString(),
      items: replicatedItems,
      applicant: currentUser.value.name,
      applicantId: currentUser.value.id,
      department: currentUser.value.department,
      departmentId: currentUser.value.departmentId,
      status: 'draft',
      approvalComment: '',
      approverId: '',
      approverName: '',
      issuedItems: [],
      issuerId: '',
      issuerName: '',
      createdAt: now,
      updatedAt: now
    }

    applications.value.unshift(newApplication)
    return newApplication
  }

  return {
    supplyItems,
    applications,
    users,
    currentUser,
    notifications,
    departments,
    pendingApplications,
    approvedApplications,
    issuedApplications,
    rejectedApplications,
    withdrawnApplications,
    draftApplications,
    lowStockItems,
    myApplications,
    myDepartmentApplications,
    myNotifications,
    allMyNotifications,
    unreadCount,
    setCurrentUser,
    getSupplyItemById,
    getApplicationById,
    getUserById,
    getUsersByRole,
    getUsersByDepartment,
    getSupplyItemsByCategory,
    addApplication,
    saveDraft,
    submitFromDraft,
    approveApplication,
    rejectApplication,
    issueApplication,
    withdrawApplication,
    addSupplyItem,
    updateSupplyItem,
    deleteSupplyItem,
    searchApplications,
    searchSupplyItems,
    getMyDraft,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createReplication
  }
})
