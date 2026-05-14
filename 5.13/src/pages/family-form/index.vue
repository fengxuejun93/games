<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">← 返回</view>
      <view class="title">{{ isEdit ? '编辑成员' : '新增成员' }}</view>
      <view class="save-btn" @click="handleSave">保存</view>
    </view>

    <scroll-view scroll-y class="form-scroll">
      <view class="form-section">
        <view class="form-item">
          <view class="label">
            <text>姓名</text>
            <text class="required">*</text>
          </view>
          <input 
            class="input" 
            placeholder="请输入姓名" 
            v-model="form.name"
            :class="{ error: errors.name }"
          />
          <view v-if="errors.name" class="error-text">{{ errors.name }}</view>
        </view>

        <view class="form-row">
          <view class="form-item half">
            <view class="label">
              <text>性别</text>
              <text class="required">*</text>
            </view>
            <picker mode="selector" :range="genderOptions" @change="handleGenderChange">
              <view class="picker-input" :class="{ error: errors.gender }">
                {{ getGenderLabel(form.gender) || '请选择性别' }}
                <text class="arrow">▼</text>
              </view>
            </picker>
            <view v-if="errors.gender" class="error-text">{{ errors.gender }}</view>
          </view>
          <view class="form-item half">
            <view class="label">
              <text>年龄</text>
              <text class="required">*</text>
            </view>
            <input 
              class="input" 
              type="number"
              placeholder="请输入年龄" 
              v-model="form.age"
              :class="{ error: errors.age }"
            />
            <view v-if="errors.age" class="error-text">{{ errors.age }}</view>
          </view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>身份证号</text>
            <text class="required">*</text>
          </view>
          <input 
            class="input" 
            placeholder="请输入身份证号" 
            v-model="form.idCard"
            :class="{ error: errors.idCard }"
          />
          <view v-if="errors.idCard" class="error-text">{{ errors.idCard }}</view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>联系电话</text>
            <text class="required">*</text>
          </view>
          <input 
            class="input" 
            type="number"
            placeholder="请输入联系电话" 
            v-model="form.phone"
            :class="{ error: errors.phone }"
          />
          <view v-if="errors.phone" class="error-text">{{ errors.phone }}</view>
        </view>

        <view class="form-row">
          <view class="form-item half">
            <view class="label">
              <text>民族</text>
              <text class="required">*</text>
            </view>
            <picker mode="selector" :range="nationOptions" :range-key="'label'" @change="handleNationChange">
              <view class="picker-input" :class="{ error: errors.nation }">
                {{ getNationLabel(form.nation) || '请选择民族' }}
                <text class="arrow">▼</text>
              </view>
            </picker>
            <view v-if="errors.nation" class="error-text">{{ errors.nation }}</view>
          </view>
          <view class="form-item half">
            <view class="label">
              <text>婚姻状况</text>
              <text class="required">*</text>
            </view>
            <picker mode="selector" :range="maritalOptions" :range-key="'label'" @change="handleMaritalChange">
              <view class="picker-input" :class="{ error: errors.maritalStatus }">
                {{ getMaritalStatusLabel(form.maritalStatus) || '请选择婚姻状况' }}
                <text class="arrow">▼</text>
              </view>
            </picker>
            <view v-if="errors.maritalStatus" class="error-text">{{ errors.maritalStatus }}</view>
          </view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>出生日期</text>
            <text class="required">*</text>
          </view>
          <picker mode="date" :value="form.birthDate" @change="handleBirthDateChange">
            <view class="picker-input" :class="{ error: errors.birthDate }">
              {{ form.birthDate || '请选择出生日期' }}
              <text class="arrow">▼</text>
            </view>
          </picker>
          <view v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>与户主关系</text>
            <text class="required">*</text>
          </view>
          <picker mode="selector" :range="relationOptions" :range-key="'label'" @change="handleRelationChange">
            <view class="picker-input" :class="{ error: errors.relation }">
              {{ getRelationLabel(form.relation) || '请选择与户主关系' }}
              <text class="arrow">▼</text>
            </view>
          </picker>
          <view v-if="errors.relation" class="error-text">{{ errors.relation }}</view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>关联户主</text>
          </view>
          <picker mode="selector" :range="headOptions" :range-key="'label'" @change="handleHeadChange">
            <view class="picker-input">
              {{ selectedHeadName || '请选择户主（可选）' }}
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label">
            <text>是否户主</text>
          </view>
          <view class="switch-row">
            <view 
              class="switch-option" 
              :class="{ active: form.isHead === 1 }"
              @click="form.isHead = 1"
            >
              是
            </view>
            <view 
              class="switch-option" 
              :class="{ active: form.isHead === 0 }"
              @click="form.isHead = 0"
            >
              否
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="label">
            <text>住址</text>
            <text class="required">*</text>
          </view>
          <textarea 
            class="textarea" 
            placeholder="请输入住址" 
            v-model="form.address"
            :class="{ error: errors.address }"
          />
          <view v-if="errors.address" class="error-text">{{ errors.address }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '../../stores/family'
import { 
  type Gender, 
  type MaritalStatus, 
  type Relation, 
  type Nation,
  type FamilyMemberForm,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
  NATION_OPTIONS,
  getGenderLabel,
  getMaritalStatusLabel,
  getRelationLabel,
  getNationLabel,
  validateIdCard,
  validatePhone
} from '../../types/family'

const familyStore = useFamilyStore()

const isEdit = ref(false)
const memberId = ref('')

const form = ref<FamilyMemberForm>({
  name: '',
  gender: 1,
  age: 0,
  idCard: '',
  relation: 'self',
  phone: '',
  nation: 'han',
  address: '',
  birthDate: '',
  maritalStatus: 1,
  headId: null,
  isHead: 0
})

const errors = ref<Record<string, string>>({})

const genderOptions = ['男', '女']
const maritalOptions = computed(() => MARITAL_STATUS_OPTIONS)
const relationOptions = computed(() => RELATION_OPTIONS)
const nationOptions = computed(() => NATION_OPTIONS)

const headOptions = computed(() => {
  return [{ id: '', label: '无（作为新户主）' }, ...familyStore.heads.map(h => ({ id: h.id, label: h.name }))]
})

const selectedHeadName = computed(() => {
  if (!form.value.headId) return ''
  const head = familyStore.heads.find(h => h.id === form.value.headId)
  return head?.name || ''
})

function handleGenderChange(e: { detail: { value: number } }) {
  form.value.gender = (e.detail.value + 1) as Gender
}

function handleMaritalChange(e: { detail: { value: number } }) {
  form.value.maritalStatus = (e.detail.value + 1) as MaritalStatus
}

function handleRelationChange(e: { detail: { value: number } }) {
  form.value.relation = RELATION_OPTIONS[e.detail.value].value
}

function handleNationChange(e: { detail: { value: number } }) {
  form.value.nation = NATION_OPTIONS[e.detail.value].value
}

function handleBirthDateChange(e: { detail: { value: string } }) {
  form.value.birthDate = e.detail.value
}

function handleHeadChange(e: { detail: { value: number } }) {
  const selected = headOptions.value[e.detail.value]
  form.value.headId = selected.id || null
  if (form.value.headId) {
    form.value.isHead = 0
  }
}

function validate(): boolean {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = '请输入姓名'
  }
  
  if (!form.value.gender || (form.value.gender !== 1 && form.value.gender !== 2)) {
    errors.value.gender = '请选择性别'
  }
  
  if (!form.value.age || form.value.age < 1 || form.value.age > 150) {
    errors.value.age = '年龄必须在1-150之间'
  }
  
  if (!form.value.idCard.trim()) {
    errors.value.idCard = '请输入身份证号'
  } else if (!validateIdCard(form.value.idCard)) {
    errors.value.idCard = '请输入有效的身份证号'
  }
  
  if (!form.value.phone.trim()) {
    errors.value.phone = '请输入联系电话'
  } else if (!validatePhone(form.value.phone)) {
    errors.value.phone = '请输入有效的手机号'
  }
  
  if (!form.value.nation) {
    errors.value.nation = '请选择民族'
  }
  
  if (!form.value.maritalStatus || form.value.maritalStatus < 1 || form.value.maritalStatus > 4) {
    errors.value.maritalStatus = '请选择婚姻状况'
  }
  
  if (!form.value.birthDate) {
    errors.value.birthDate = '请选择出生日期'
  }
  
  if (!form.value.relation) {
    errors.value.relation = '请选择与户主关系'
  }
  
  if (!form.value.address.trim()) {
    errors.value.address = '请输入住址'
  }
  
  if (form.value.isHead === 1) {
    form.value.headId = null
    form.value.relation = 'self'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSave() {
  if (!validate()) {
    return
  }
  
  try {
    familyStore.save(form.value)
    uni.showToast({ 
      title: isEdit.value ? '修改成功' : '添加成功', 
      icon: 'success' 
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  
  if (options.id) {
    isEdit.value = true
    memberId.value = options.id
    const member = familyStore.getById(options.id)
    if (member) {
      form.value = {
        id: member.id,
        name: member.name,
        gender: member.gender,
        age: member.age,
        idCard: member.idCard,
        relation: member.relation,
        phone: member.phone,
        nation: member.nation,
        address: member.address,
        birthDate: member.birthDate,
        maritalStatus: member.maritalStatus,
        headId: member.headId,
        isHead: member.isHead
      }
    }
  } else if (options.headId) {
    form.value.headId = options.headId
    form.value.isHead = 0
  }
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .back-btn {
    font-size: 28rpx;
    color: #666;
    padding: 10rpx 20rpx;
  }
  
  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
  
  .save-btn {
    background-color: #4080ff;
    color: #fff;
    padding: 12rpx 32rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
  }
}

.form-scroll {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.form-item {
  margin-bottom: 24rpx;
  
  &.half {
    flex: 1;
  }
  
  .label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
    
    .required {
      color: #ff4d4f;
      margin-left: 8rpx;
    }
  }
  
  .input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 10rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    
    &.error {
      border-color: #ff4d4f;
    }
  }
  
  .textarea {
    width: 100%;
    height: 160rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 10rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    
    &.error {
      border-color: #ff4d4f;
    }
  }
  
  .picker-input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 10rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #333;
    box-sizing: border-box;
    
    &.error {
      border-color: #ff4d4f;
    }
    
    .arrow {
      font-size: 20rpx;
      color: #999;
    }
  }
  
  .error-text {
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 8rpx;
  }
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.switch-row {
  display: flex;
  gap: 20rpx;
  
  .switch-option {
    flex: 1;
    height: 72rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
    
    &.active {
      background-color: #4080ff;
      border-color: #4080ff;
      color: #fff;
    }
  }
}
</style>