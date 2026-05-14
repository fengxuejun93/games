import { 
  Item, 
  getItems, 
  saveItems, 
  addItem, 
  updateItem, 
  deleteItem, 
  toggleComplete, 
  filterItemsByCategory, 
  searchItems, 
  clearCompleted, 
  validateItem,
  initMockItems
} from './itemStorage'

describe('物品清单存储工具测试', () => {
  const TEST_STORAGE_KEY = 'item_list'
  
  beforeEach(() => {
    uni.setStorageSync(TEST_STORAGE_KEY, JSON.stringify([]))
  })

  describe('初始化Mock数据', () => {
    it('首次调用应初始化mock数据', () => {
      initMockItems()
      const items = getItems()
      expect(items.length).toBe(5)
      expect(items[0].name).toBe('牛奶')
    })

    it('已有数据时不应覆盖', () => {
      const existing: Item[] = [{ id: 'test', name: 'test', quantity: 1, category: 'food', remark: '', completed: false }]
      saveItems(existing)
      initMockItems()
      const items = getItems()
      expect(items.length).toBe(1)
      expect(items[0].name).toBe('test')
    })
  })

  describe('新增物品', () => {
    it('正常新增物品', () => {
      const newItem = addItem({ name: '苹果', quantity: 5, category: 'food', remark: '红富士' })
      expect(newItem.id).toBeTruthy()
      expect(newItem.name).toBe('苹果')
      expect(newItem.quantity).toBe(5)
      expect(newItem.category).toBe('food')
      expect(newItem.remark).toBe('红富士')
      expect(newItem.completed).toBe(false)
      
      const items = getItems()
      expect(items.length).toBe(1)
      expect(items[0].id).toBe(newItem.id)
    })

    it('新增物品时remark为空', () => {
      const newItem = addItem({ name: '香蕉', quantity: 3, category: 'food', remark: '' })
      expect(newItem.remark).toBe('')
    })

    it('新增物品时category为空', () => {
      const newItem = addItem({ name: '测试物品', quantity: 1, category: '', remark: '' })
      expect(newItem.category).toBe('')
    })

    it('验证物品-名称为空应失败', () => {
      const result = validateItem({ name: '', quantity: 1, category: 'food', remark: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('物品名称不能为空')
    })

    it('验证物品-名称仅空格应失败', () => {
      const result = validateItem({ name: '   ', quantity: 1, category: 'food', remark: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('物品名称不能为空')
    })

    it('验证物品-数量为0应失败', () => {
      const result = validateItem({ name: '测试', quantity: 0, category: 'food', remark: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('数量必须为正整数')
    })

    it('验证物品-数量为负数应失败', () => {
      const result = validateItem({ name: '测试', quantity: -1, category: 'food', remark: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('数量必须为正整数')
    })

    it('验证物品-数量为小数应失败', () => {
      const result = validateItem({ name: '测试', quantity: 1.5, category: 'food', remark: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('数量必须为正整数')
    })

    it('验证物品-有效数据应通过', () => {
      const result = validateItem({ name: '有效物品', quantity: 10, category: 'food', remark: '测试' })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('')
    })
  })

  describe('编辑物品', () => {
    it('正常编辑物品', () => {
      const item = addItem({ name: '原始名称', quantity: 2, category: 'food', remark: '' })
      const success = updateItem(item.id, { name: '修改后名称', quantity: 5, remark: '修改备注' })
      
      expect(success).toBe(true)
      const items = getItems()
      expect(items[0].name).toBe('修改后名称')
      expect(items[0].quantity).toBe(5)
      expect(items[0].remark).toBe('修改备注')
      expect(items[0].category).toBe('food')
    })

    it('编辑不存在的物品应失败', () => {
      const success = updateItem('non-existent-id', { name: '测试' })
      expect(success).toBe(false)
    })

    it('仅修改部分字段', () => {
      const item = addItem({ name: '测试', quantity: 1, category: 'food', remark: '' })
      updateItem(item.id, { quantity: 10 })
      
      const items = getItems()
      expect(items[0].name).toBe('测试')
      expect(items[0].quantity).toBe(10)
      expect(items[0].category).toBe('food')
    })

    it('编辑时修改完成状态', () => {
      const item = addItem({ name: '测试', quantity: 1, category: 'food', remark: '' })
      updateItem(item.id, { completed: true })
      
      const items = getItems()
      expect(items[0].completed).toBe(true)
    })
  })

  describe('删除物品', () => {
    it('正常删除物品', () => {
      const item = addItem({ name: '要删除的物品', quantity: 1, category: 'food', remark: '' })
      const success = deleteItem(item.id)
      
      expect(success).toBe(true)
      const items = getItems()
      expect(items.length).toBe(0)
    })

    it('删除不存在的物品应失败', () => {
      const success = deleteItem('non-existent-id')
      expect(success).toBe(false)
    })

    it('删除列表中第一个物品', () => {
      addItem({ name: '物品1', quantity: 1, category: 'food', remark: '' })
      addItem({ name: '物品2', quantity: 2, category: 'daily', remark: '' })
      addItem({ name: '物品3', quantity: 3, category: 'electronics', remark: '' })
      
      const firstId = getItems()[0].id
      deleteItem(firstId)
      
      const items = getItems()
      expect(items.length).toBe(2)
      expect(items[0].name).toBe('物品2')
    })

    it('删除列表中最后一个物品', () => {
      addItem({ name: '物品1', quantity: 1, category: 'food', remark: '' })
      addItem({ name: '物品2', quantity: 2, category: 'daily', remark: '' })
      
      const lastId = getItems()[1].id
      deleteItem(lastId)
      
      const items = getItems()
      expect(items.length).toBe(1)
      expect(items[0].name).toBe('物品1')
    })
  })

  describe('勾选完成', () => {
    it('正常勾选完成', () => {
      const item = addItem({ name: '测试', quantity: 1, category: 'food', remark: '' })
      expect(item.completed).toBe(false)
      
      toggleComplete(item.id)
      const items = getItems()
      expect(items[0].completed).toBe(true)
    })

    it('取消完成状态', () => {
      const item = addItem({ name: '测试', quantity: 1, category: 'food', remark: '' })
      toggleComplete(item.id)
      toggleComplete(item.id)
      
      const items = getItems()
      expect(items[0].completed).toBe(false)
    })

    it('切换不存在物品的状态应失败', () => {
      const success = toggleComplete('non-existent-id')
      expect(success).toBe(false)
    })

    it('批量切换多个物品状态', () => {
      const item1 = addItem({ name: '物品1', quantity: 1, category: 'food', remark: '' })
      const item2 = addItem({ name: '物品2', quantity: 2, category: 'daily', remark: '' })
      const item3 = addItem({ name: '物品3', quantity: 3, category: 'electronics', remark: '' })
      
      toggleComplete(item1.id)
      toggleComplete(item3.id)
      
      const items = getItems()
      expect(items[0].completed).toBe(false)
      expect(items[1].completed).toBe(true)
      expect(items[2].completed).toBe(true)
    })
  })

  describe('分类筛选', () => {
    beforeEach(() => {
      addItem({ name: '苹果', quantity: 2, category: 'food', remark: '' })
      addItem({ name: '牙膏', quantity: 1, category: 'daily', remark: '' })
      addItem({ name: '手机', quantity: 1, category: 'electronics', remark: '' })
      addItem({ name: 'T恤', quantity: 3, category: 'clothes', remark: '' })
      addItem({ name: '笔记本', quantity: 5, category: 'other', remark: '' })
      addItem({ name: '香蕉', quantity: 4, category: 'food', remark: '' })
    })

    it('筛选所有物品', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, '')
      expect(result.length).toBe(6)
    })

    it('筛选食品分类', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, 'food')
      expect(result.length).toBe(2)
      expect(result.every(item => item.category === 'food')).toBe(true)
    })

    it('筛选日用品分类', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, 'daily')
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('牙膏')
    })

    it('筛选不存在的分类', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, 'nonexistent')
      expect(result.length).toBe(0)
    })

    it('空字符串应返回所有物品', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, '')
      expect(result.length).toBe(items.length)
    })

    it('空格字符串应视为空筛选', () => {
      const items = getItems()
      const result = filterItemsByCategory(items, '   ')
      expect(result.length).toBe(items.length)
    })
  })

  describe('搜索物品', () => {
    beforeEach(() => {
      addItem({ name: '牛奶', quantity: 2, category: 'food', remark: '低脂牛奶' })
      addItem({ name: '手机充电器', quantity: 1, category: 'electronics', remark: '65W快充' })
      addItem({ name: '笔记本', quantity: 5, category: 'other', remark: 'A5大小' })
      addItem({ name: '牛仔裤', quantity: 2, category: 'clothes', remark: '蓝色' })
    })

    it('按名称搜索', () => {
      const items = getItems()
      const result = searchItems(items, '牛奶')
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('牛奶')
    })

    it('按备注搜索', () => {
      const items = getItems()
      const result = searchItems(items, '快充')
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('手机充电器')
    })

    it('搜索不区分大小写', () => {
      const items = getItems()
      const result1 = searchItems(items, 'MILK')
      const result2 = searchItems(items, 'milk')
      expect(result1.length).toBe(1)
      expect(result2.length).toBe(1)
    })

    it('搜索部分匹配', () => {
      const items = getItems()
      const result = searchItems(items, '笔记')
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('笔记本')
    })

    it('搜索不存在的关键词', () => {
      const items = getItems()
      const result = searchItems(items, '不存在的物品')
      expect(result.length).toBe(0)
    })

    it('空搜索应返回所有物品', () => {
      const items = getItems()
      const result = searchItems(items, '')
      expect(result.length).toBe(items.length)
    })

    it('空格搜索应返回所有物品', () => {
      const items = getItems()
      const result = searchItems(items, '   ')
      expect(result.length).toBe(items.length)
    })

    it('搜索同时匹配名称和备注', () => {
      addItem({ name: '充电器', quantity: 1, category: 'electronics', remark: '手机配件' })
      const items = getItems()
      const result = searchItems(items, '手机')
      expect(result.length).toBe(2)
    })
  })

  describe('清空已完成', () => {
    beforeEach(() => {
      const item1 = addItem({ name: '未完成1', quantity: 1, category: 'food', remark: '' })
      const item2 = addItem({ name: '已完成1', quantity: 2, category: 'daily', remark: '' })
      const item3 = addItem({ name: '未完成2', quantity: 3, category: 'electronics', remark: '' })
      const item4 = addItem({ name: '已完成2', quantity: 4, category: 'clothes', remark: '' })
      
      toggleComplete(item2.id)
      toggleComplete(item4.id)
    })

    it('正常清空已完成物品', () => {
      const count = clearCompleted()
      expect(count).toBe(2)
      
      const items = getItems()
      expect(items.length).toBe(2)
      expect(items.every(item => !item.completed)).toBe(true)
    })

    it('没有已完成物品时返回0', () => {
      clearCompleted()
      const count = clearCompleted()
      expect(count).toBe(0)
      
      const items = getItems()
      expect(items.length).toBe(2)
    })

    it('所有物品都已完成时清空全部', () => {
      const items = getItems()
      items.forEach(item => toggleComplete(item.id))
      
      const count = clearCompleted()
      expect(count).toBe(4)
      
      const remaining = getItems()
      expect(remaining.length).toBe(0)
    })
  })

  describe('本地存储', () => {
    it('数据持久化到本地存储', () => {
      const item = addItem({ name: '持久化测试', quantity: 1, category: 'food', remark: '' })
      
      const stored = uni.getStorageSync(TEST_STORAGE_KEY)
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(1)
      expect(parsed[0].id).toBe(item.id)
      expect(parsed[0].name).toBe('持久化测试')
    })

    it('存储数据格式正确', () => {
      addItem({ name: '测试', quantity: 5, category: 'food', remark: '测试备注' })
      
      const stored = uni.getStorageSync(TEST_STORAGE_KEY)
      const parsed = JSON.parse(stored)
      
      expect(parsed[0]).toHaveProperty('id')
      expect(parsed[0]).toHaveProperty('name')
      expect(parsed[0]).toHaveProperty('quantity')
      expect(parsed[0]).toHaveProperty('category')
      expect(parsed[0]).toHaveProperty('remark')
      expect(parsed[0]).toHaveProperty('completed')
    })

    it('存储异常时应返回空数组', () => {
      uni.setStorageSync(TEST_STORAGE_KEY, 'invalid json')
      const items = getItems()
      expect(items).toEqual([])
    })

    it('大数据量存储测试', () => {
      for (let i = 0; i < 100; i++) {
        addItem({ name: `物品${i}`, quantity: i + 1, category: 'food', remark: `备注${i}` })
      }
      
      const items = getItems()
      expect(items.length).toBe(100)
    })
  })

  describe('综合场景测试', () => {
    it('完整的CRUD流程', () => {
      const item = addItem({ name: '初始物品', quantity: 1, category: 'food', remark: '' })
      expect(getItems().length).toBe(1)
      
      updateItem(item.id, { name: '修改后', quantity: 10 })
      expect(getItems()[0].name).toBe('修改后')
      expect(getItems()[0].quantity).toBe(10)
      
      toggleComplete(item.id)
      expect(getItems()[0].completed).toBe(true)
      
      deleteItem(item.id)
      expect(getItems().length).toBe(0)
    })

    it('筛选+搜索组合使用', () => {
      addItem({ name: '牛奶', quantity: 2, category: 'food', remark: '低脂' })
      addItem({ name: '面包', quantity: 3, category: 'food', remark: '全麦' })
      addItem({ name: '牙刷', quantity: 1, category: 'daily', remark: '软毛' })
      addItem({ name: '手机', quantity: 1, category: 'electronics', remark: '智能手机' })
      
      let items = getItems()
      items = filterItemsByCategory(items, 'food')
      items = searchItems(items, '牛')
      
      expect(items.length).toBe(1)
      expect(items[0].name).toBe('牛奶')
    })

    it('边界情况：空列表操作', () => {
      expect(getItems().length).toBe(0)
      expect(deleteItem('any-id')).toBe(false)
      expect(updateItem('any-id', { name: 'test' })).toBe(false)
      expect(toggleComplete('any-id')).toBe(false)
      expect(clearCompleted()).toBe(0)
    })
  })
})