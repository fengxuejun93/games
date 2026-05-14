import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FamilyMember, FamilyMemberForm, PageRequest, PageResponse } from '../types/family'
import { mockFamilyMembers, generateId } from '../data/familyMockData'

export const useFamilyStore = defineStore('family', () => {
  const members = ref<FamilyMember[]>([...mockFamilyMembers])
  
  const pageNum = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const selectedHeadId = ref<string | undefined>()

  const filteredMembers = computed(() => {
    let result = [...members.value]
    
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      result = result.filter(member => 
        member.name.toLowerCase().includes(kw) ||
        member.idCard.includes(kw) ||
        member.phone.includes(kw)
      )
    }
    
    if (selectedHeadId.value) {
      result = result.filter(member => member.headId === selectedHeadId.value)
    }
    
    return result
  })

  const total = computed(() => filteredMembers.value.length)

  const paginatedMembers = computed(() => {
    const start = (pageNum.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredMembers.value.slice(start, end)
  })

  const heads = computed(() => {
    return members.value.filter(member => member.isHead === 1)
  })

  const familyGroups = computed(() => {
    const groups: { head: FamilyMember; members: FamilyMember[] }[] = []
    const headList = heads.value
    
    headList.forEach(head => {
      const groupMembers = members.value.filter(member => member.headId === head.id || member.id === head.id)
      groups.push({ head, members: groupMembers })
    })
    
    return groups
  })

  function list(request: PageRequest): PageResponse<FamilyMember> {
    pageNum.value = request.pageNum
    pageSize.value = request.pageSize
    keyword.value = request.keyword || ''
    selectedHeadId.value = request.headId
    
    return {
      list: paginatedMembers.value,
      total: total.value
    }
  }

  function getById(id: string): FamilyMember | undefined {
    return members.value.find(member => member.id === id)
  }

  function save(form: FamilyMemberForm): FamilyMember {
    const now = new Date().toLocaleString('zh-CN')
    
    if (form.id) {
      const index = members.value.findIndex(member => member.id === form.id)
      if (index !== -1) {
        members.value[index] = {
          ...members.value[index],
          ...form,
          updated_at: now
        }
        return members.value[index]
      }
    } else {
      const newMember: FamilyMember = {
        ...form,
        id: generateId(),
        created_at: now,
        updated_at: now
      } as FamilyMember
      members.value.push(newMember)
      return newMember
    }
    
    throw new Error('保存失败')
  }

  function deleteById(id: string): void {
    const index = members.value.findIndex(member => member.id === id)
    if (index !== -1) {
      const member = members.value[index]
      if (member.isHead === 1) {
        const dependentMembers = members.value.filter(m => m.headId === id)
        dependentMembers.forEach(m => {
          m.headId = null
          m.relation = 'self'
          m.isHead = 1
        })
      }
      members.value.splice(index, 1)
    }
  }

  return {
    members,
    pageNum,
    pageSize,
    keyword,
    selectedHeadId,
    filteredMembers,
    total,
    paginatedMembers,
    heads,
    familyGroups,
    list,
    getById,
    save,
    deleteById
  }
})