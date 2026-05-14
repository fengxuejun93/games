export interface SignatureRecord {
  signerName: string
  signTime: string
  signatureData: string
}

export interface Item {
  id: string
  name: string
  quantity: number
  category: string
  remark: string
  completed: boolean
  signed: boolean
  signatureRecords: SignatureRecord[]
}

const STORAGE_KEY = 'item_list'
const SIGNATURE_KEY = 'item_signatures'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getItems(): Item[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveItems(items: Item[]): void {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(items))
  } catch {
    console.error('Failed to save items to storage')
  }
}

export function addItem(item: Omit<Item, 'id' | 'completed' | 'signed' | 'signatureRecords'>): Item {
  const newItem: Item = {
    ...item,
    id: generateId(),
    completed: false,
    signed: false,
    signatureRecords: []
  }
  const items = getItems()
  items.unshift(newItem)
  saveItems(items)
  return newItem
}

export function updateItem(id: string, updates: Partial<Omit<Item, 'id'>>): boolean {
  const items = getItems()
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return false
  
  items[index] = {
    ...items[index],
    ...updates
  }
  saveItems(items)
  return true
}

export function deleteItem(id: string): boolean {
  const items = getItems()
  const filtered = items.filter(item => item.id !== id)
  if (filtered.length === items.length) return false
  saveItems(filtered)
  return true
}

export function toggleComplete(id: string): boolean {
  const items = getItems()
  const item = items.find(item => item.id === id)
  if (!item) return false
  item.completed = !item.completed
  saveItems(items)
  return true
}

export function addSignature(itemId: string, signature: Omit<SignatureRecord, 'signTime'>): boolean {
  const items = getItems()
  const item = items.find(item => item.id === itemId)
  if (!item) return false
  
  const record: SignatureRecord = {
    ...signature,
    signTime: new Date().toISOString()
  }
  
  item.signatureRecords.push(record)
  item.signed = true
  saveItems(items)
  return true
}

export function getSignatureRecords(itemId: string): SignatureRecord[] {
  const items = getItems()
  const item = items.find(item => item.id === itemId)
  return item ? item.signatureRecords : []
}

export function revokeSignature(itemId: string): boolean {
  const items = getItems()
  const item = items.find(item => item.id === itemId)
  if (!item) return false
  
  item.signatureRecords = []
  item.signed = false
  saveItems(items)
  return true
}

export function filterItemsByCategory(items: Item[], category: string): Item[] {
  if (!category) return items
  return items.filter(item => item.category === category)
}

export function searchItems(items: Item[], keyword: string): Item[] {
  if (!keyword.trim()) return items
  const lowerKeyword = keyword.toLowerCase()
  return items.filter(item => 
    item.name.toLowerCase().includes(keyword) ||
    item.remark.toLowerCase().includes(keyword)
  )
}

export function clearCompleted(): number {
  const items = getItems()
  const completedCount = items.filter(item => item.completed).length
  const filtered = items.filter(item => !item.completed)
  saveItems(filtered)
  return completedCount
}

export function initMockItems(): void {
  const existing = getItems()
  if (existing.length > 0) return
  
  const mockData: Item[] = [
    { id: '1', name: '牛奶', quantity: 2, category: 'food', remark: '低脂牛奶，早餐必备', completed: false, signed: false, signatureRecords: [] },
    { id: '2', name: '牙膏', quantity: 1, category: 'daily', remark: '', completed: true, signed: true, signatureRecords: [
      { signerName: '张经理', signTime: '2026-05-10T10:30:00.000Z', signatureData: '' }
    ]},
    { id: '3', name: '手机充电器', quantity: 1, category: 'electronics', remark: '65W快充', completed: false, signed: false, signatureRecords: [] },
    { id: '4', name: 'T恤', quantity: 3, category: 'clothes', remark: '夏季新款纯棉', completed: false, signed: true, signatureRecords: [
      { signerName: '李主任', signTime: '2026-05-12T14:20:00.000Z', signatureData: '' }
    ]},
    { id: '5', name: '笔记本', quantity: 5, category: 'other', remark: 'A5大小，横线本', completed: true, signed: false, signatureRecords: [] }
  ]
  
  saveItems(mockData)
}

export function validateItem(item: Omit<Item, 'id' | 'completed' | 'signed' | 'signatureRecords'>): { isValid: boolean; message: string } {
  if (!item.name.trim()) {
    return { isValid: false, message: '物品名称不能为空' }
  }
  
  if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
    return { isValid: false, message: '数量必须为正整数' }
  }
  
  return { isValid: true, message: '' }
}