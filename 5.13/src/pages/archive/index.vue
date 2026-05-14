<template>
  <view class="page">
    <view class="tab-header">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'archived' }"
        @click="activeTab = 'archived'"
      >
        已归档
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        已作废
      </view>
    </view>

    <SearchBar v-model="searchKeyword" @filter="showFilterModal = true" />

    <FilterModal 
      :visible="showFilterModal"
      :selected-type="selectedType"
      :selected-status="selectedStatus"
      @close="showFilterModal = false"
      @confirm="handleFilterConfirm"
    />

    <view class="contract-list">
      <ContractCard 
        v-for="contract in filteredContracts"
        :key="contract.id"
        :contract="contract"
        @click="handleContractClick"
      />
    </view>

    <EmptyState 
      v-if="filteredContracts.length === 0"
      :icon="activeTab === 'archived' ? '📦' : '❌'"
      :text="activeTab === 'archived' ? '暂无归档合同' : '暂无作废合同'"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onShow } from '@dcloudio/uni-app'
import { useContractStore } from '@/stores/contract'
import type { Contract, ContractType, ContractStatus } from '@/types/contract'
import ContractCard from '@/components/ContractCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterModal from '@/components/FilterModal.vue'
import EmptyState from '@/components/EmptyState.vue'

const contractStore = useContractStore()

const activeTab = ref<'archived' | 'cancelled'>('archived')
const searchKeyword = ref('')
const showFilterModal = ref(false)
const selectedType = ref<ContractType | undefined>()
const selectedStatus = ref<ContractStatus | undefined>()

const filteredContracts = computed(() => {
  const baseStatus: ContractStatus = activeTab.value === 'archived' ? 'archived' : 'cancelled'
  return contractStore.search(searchKeyword.value, selectedType.value, baseStatus)
})

onShow(() => {
  searchKeyword.value = ''
  selectedType.value = undefined
  selectedStatus.value = undefined
})

function handleFilterConfirm(type: ContractType | undefined, status: ContractStatus | undefined) {
  selectedType.value = type
  selectedStatus.value = status
  showFilterModal.value = false
}

function handleContractClick(contract: Contract) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${contract.id}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.tab-header {
  display: flex;
  background: #ffffff;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  padding: 28rpx 0;
  text-align: center;
  font-size: 30rpx;
  color: #666666;
  position: relative;

  &.active {
    color: #4080ff;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #4080ff;
      border-radius: 3rpx;
    }
  }
}

.contract-list {
  padding: 0 24rpx;
}
</style>