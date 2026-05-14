export type Gender = 1 | 2

export type MaritalStatus = 1 | 2 | 3 | 4

export type Relation = 'self' | 'spouse' | 'father' | 'mother' | 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'grandfather' | 'grandmother' | 'brother' | 'sister' | 'uncle' | 'aunt' | 'nephew' | 'niece' | 'other'

export type Nation = 'han' | 'manchu' | 'mongol' | 'hui' | 'tibetan' | 'uyghur' | 'miao' | 'yi' | 'zhuang' | 'buyi' | 'korean' | 'other'

export interface FamilyMember {
  id: string
  name: string
  gender: Gender
  age: number
  idCard: string
  relation: Relation
  phone: string
  nation: Nation
  address: string
  birthDate: string
  maritalStatus: MaritalStatus
  headId: string | null
  isHead: number
  created_at: string
  updated_at: string
}

export interface FamilyMemberForm {
  id?: string
  name: string
  gender: Gender
  age: number
  idCard: string
  relation: Relation
  phone: string
  nation: Nation
  address: string
  birthDate: string
  maritalStatus: MaritalStatus
  headId: string | null
  isHead: number
}

export interface PageRequest {
  pageNum: number
  pageSize: number
  keyword?: string
  headId?: string
}

export interface PageResponse<T> {
  list: T[]
  total: number
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 1, label: '男' },
  { value: 2, label: '女' }
]

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 1, label: '未婚' },
  { value: 2, label: '已婚' },
  { value: 3, label: '离异' },
  { value: 4, label: '丧偶' }
]

export const RELATION_OPTIONS: { value: Relation; label: string }[] = [
  { value: 'self', label: '本人（户主）' },
  { value: 'spouse', label: '配偶' },
  { value: 'father', label: '父亲' },
  { value: 'mother', label: '母亲' },
  { value: 'son', label: '儿子' },
  { value: 'daughter', label: '女儿' },
  { value: 'grandson', label: '孙子' },
  { value: 'granddaughter', label: '孙女' },
  { value: 'grandfather', label: '祖父' },
  { value: 'grandmother', label: '祖母' },
  { value: 'brother', label: '兄弟' },
  { value: 'sister', label: '姐妹' },
  { value: 'uncle', label: '伯父/叔父/舅父' },
  { value: 'aunt', label: '伯母/婶母/舅母' },
  { value: 'nephew', label: '侄子' },
  { value: 'niece', label: '侄女' },
  { value: 'other', label: '其他' }
]

export const NATION_OPTIONS: { value: Nation; label: string }[] = [
  { value: 'han', label: '汉族' },
  { value: 'manchu', label: '满族' },
  { value: 'mongol', label: '蒙古族' },
  { value: 'hui', label: '回族' },
  { value: 'tibetan', label: '藏族' },
  { value: 'uyghur', label: '维吾尔族' },
  { value: 'miao', label: '苗族' },
  { value: 'yi', label: '彝族' },
  { value: 'zhuang', label: '壮族' },
  { value: 'buyi', label: '布依族' },
  { value: 'korean', label: '朝鲜族' },
  { value: 'other', label: '其他民族' }
]

export function getGenderLabel(gender: Gender): string {
  const option = GENDER_OPTIONS.find(opt => opt.value === gender)
  return option?.label || ''
}

export function getMaritalStatusLabel(status: MaritalStatus): string {
  const option = MARITAL_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || ''
}

export function getRelationLabel(relation: Relation): string {
  const option = RELATION_OPTIONS.find(opt => opt.value === relation)
  return option?.label || ''
}

export function getNationLabel(nation: Nation): string {
  const option = NATION_OPTIONS.find(opt => opt.value === nation)
  return option?.label || ''
}

export function validateIdCard(idCard: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(idCard)
}

export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}