import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Contract, ContractType, ContractStatus, ApprovalAction, Claim, ClaimStatus } from '@/types/contract'
import { mockContracts } from '@/data/mockData'

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([...mockContracts])

  const activeContracts = computed(() => 
    contracts.value.filter(c => c.status === 'active')
  )

  const draftContracts = computed(() => 
    contracts.value.filter(c => c.status === 'draft')
  )

  const archivedContracts = computed(() => 
    contracts.value.filter(c => c.status === 'archived')
  )

  const cancelledContracts = computed(() => 
    contracts.value.filter(c => c.status === 'cancelled')
  )

  const pendingApprovalContracts = computed(() => 
    contracts.value.filter(c => c.status === 'pending_approval' || c.approvalStatus === 'pending' || c.approvalStatus === 'approving')
  )

  const expiringContracts = computed(() => {
    const now = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
    
    return contracts.value.filter(c => {
      if (c.status !== 'active') return false
      const endDate = new Date(c.endDate)
      return endDate >= now && endDate <= thirtyDaysLater
    }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  })

  function getById(id: string): Contract | undefined {
    return contracts.value.find(c => c.id === id)
  }

  function add(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'approvalFlow'>) {
    const now = new Date().toISOString()
    const defaultFlow = getDefaultApprovalFlow(contract.type)
    const newContract: Contract = {
      ...contract,
      id: Date.now().toString(),
      versions: [{
        id: '1',
        version: 'v1.0',
        content: '初始版本',
        updatedAt: now,
        updatedBy: 'admin'
      }],
      approvalFlow: defaultFlow,
      createdAt: now,
      updatedAt: now
    }
    contracts.value.unshift(newContract)
    return newContract
  }

  function getDefaultApprovalFlow(type: ContractType) {
    const flows: Record<ContractType, Contract['approvalFlow']['nodes']> = {
      purchase: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '财务', role: 'finance', required: true },
        { id: '4', name: '法务', role: 'legal', required: true },
        { id: '5', name: '总经理', role: 'general_manager', required: true }
      ],
      sales: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '财务', role: 'finance', required: true },
        { id: '4', name: '法务', role: 'legal', required: true }
      ],
      service: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '法务', role: 'legal', required: true }
      ],
      hr: [
        { id: '1', name: '发起人', role: 'initiator', required: true },
        { id: '2', name: '部门主管', role: 'department_head', required: true },
        { id: '3', name: '总经理', role: 'general_manager', required: true }
      ]
    }
    
    return {
      currentNode: 0,
      nodes: flows[type],
      history: []
    }
  }

  function update(id: string, updates: Partial<Contract>) {
    const index = contracts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const current = contracts.value[index]
      const newVersion: Contract['versions'][0] = {
        id: Date.now().toString(),
        version: `v${current.versions.length + 1}.0`,
        content: '版本更新',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      }
      contracts.value[index] = {
        ...current,
        ...updates,
        versions: [...current.versions, newVersion],
        updatedAt: new Date().toISOString()
      }
      return contracts.value[index]
    }
    return undefined
  }

  function remove(id: string) {
    const index = contracts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contracts.value.splice(index, 1)
      return true
    }
    return false
  }

  function archive(id: string) {
    return update(id, { status: 'archived' })
  }

  function cancel(id: string) {
    return update(id, { status: 'cancelled' })
  }

  function unarchive(id: string) {
    return update(id, { status: 'active' })
  }

  function submitForApproval(id: string) {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    const firstNode = contract.approvalFlow.nodes[0]
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: firstNode.id,
      nodeName: firstNode.name,
      action: 'approve',
      comment: '提交审批',
      operator: 'admin',
      operatedAt: now,
      status: 'completed'
    }
    
    return update(id, {
      status: 'pending_approval',
      approvalStatus: 'approving',
      approvalFlow: {
        ...contract.approvalFlow,
        currentNode: 1,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function approve(id: string, comment: string = '') {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    const currentNodeIndex = contract.approvalFlow.currentNode
    const currentNode = contract.approvalFlow.nodes[currentNodeIndex]
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      action: 'approve',
      comment,
      operator: 'admin',
      operatedAt: now,
      status: 'completed'
    }
    
    const nextNodeIndex = currentNodeIndex + 1
    
    if (nextNodeIndex >= contract.approvalFlow.nodes.length) {
      return update(id, {
        status: 'approved',
        approvalStatus: 'approved',
        approvalFlow: {
          ...contract.approvalFlow,
          currentNode: nextNodeIndex,
          history: [...contract.approvalFlow.history, record]
        }
      })
    }
    
    return update(id, {
      approvalFlow: {
        ...contract.approvalFlow,
        currentNode: nextNodeIndex,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function reject(id: string, comment: string) {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    const currentNode = contract.approvalFlow.nodes[contract.approvalFlow.currentNode]
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      action: 'reject',
      comment,
      operator: 'admin',
      operatedAt: now,
      status: 'rejected'
    }
    
    return update(id, {
      status: 'draft',
      approvalStatus: 'rejected',
      approvalFlow: {
        ...contract.approvalFlow,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function transfer(id: string, targetRole: string, comment: string = '') {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    const currentNode = contract.approvalFlow.nodes[contract.approvalFlow.currentNode]
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      action: 'transfer',
      comment: `转交给${targetRole}，${comment}`,
      operator: 'admin',
      operatedAt: now,
      status: 'completed'
    }
    
    return update(id, {
      approvalFlow: {
        ...contract.approvalFlow,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function addSign(id: string, targetRole: string, comment: string = '') {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    const currentNode = contract.approvalFlow.nodes[contract.approvalFlow.currentNode]
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      action: 'add_sign',
      comment: `加签给${targetRole}，${comment}`,
      operator: 'admin',
      operatedAt: now,
      status: 'pending'
    }
    
    return update(id, {
      approvalFlow: {
        ...contract.approvalFlow,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function withdraw(id: string, comment: string = '') {
    const contract = getById(id)
    if (!contract) return undefined
    
    const now = new Date().toISOString()
    
    const record: Contract['approvalFlow']['history'][0] = {
      id: Date.now().toString(),
      nodeId: 'withdraw',
      nodeName: '撤回',
      action: 'withdraw',
      comment,
      operator: 'admin',
      operatedAt: now,
      status: 'completed'
    }
    
    return update(id, {
      status: 'draft',
      approvalStatus: 'withdrawn',
      approvalFlow: {
        ...contract.approvalFlow,
        currentNode: 0,
        history: [...contract.approvalFlow.history, record]
      }
    })
  }

  function activate(id: string) {
    return update(id, { status: 'active' })
  }

  function addClaim(id: string, amount: number, purpose: string) {
    const contract = getById(id)
    if (!contract) return undefined

    if (contract.claimedAmount + amount > contract.amount) {
      throw new Error('认领金额不能超过合同金额')
    }

    const now = new Date().toISOString()
    const newClaim: Claim = {
      id: Date.now().toString(),
      contractId: id,
      claimer: '当前用户',
      claimerId: 'user001',
      amount,
      currency: contract.currency,
      purpose,
      status: 'pending',
      claimedAt: now
    }

    return update(id, {
      claimedAmount: contract.claimedAmount + amount,
      claims: [...contract.claims, newClaim]
    })
  }

  function confirmClaim(contractId: string, claimId: string) {
    const contract = getById(contractId)
    if (!contract) return undefined

    const claimIndex = contract.claims.findIndex(c => c.id === claimId)
    if (claimIndex === -1) return undefined

    const claim = contract.claims[claimIndex]
    if (claim.status !== 'pending') {
      throw new Error('只能确认待确认状态的认领')
    }

    const now = new Date().toISOString()
    const updatedClaim: Claim = {
      ...claim,
      status: 'confirmed',
      confirmedAt: now,
      confirmedBy: 'admin'
    }

    const updatedClaims = [...contract.claims]
    updatedClaims[claimIndex] = updatedClaim

    return update(contractId, {
      claims: updatedClaims
    })
  }

  function cancelClaim(contractId: string, claimId: string, reason: string) {
    const contract = getById(contractId)
    if (!contract) return undefined

    const claimIndex = contract.claims.findIndex(c => c.id === claimId)
    if (claimIndex === -1) return undefined

    const claim = contract.claims[claimIndex]
    if (claim.status !== 'pending') {
      throw new Error('只能取消待确认状态的认领')
    }

    const now = new Date().toISOString()
    const updatedClaim: Claim = {
      ...claim,
      status: 'cancelled',
      cancelledAt: now,
      cancelledBy: 'admin',
      cancelReason: reason
    }

    const updatedClaims = [...contract.claims]
    updatedClaims[claimIndex] = updatedClaim

    return update(contractId, {
      claimedAmount: contract.claimedAmount - claim.amount,
      claims: updatedClaims
    })
  }

  const pendingClaims = computed(() => {
    const claims: (Claim & { contract: Contract })[] = []
    contracts.value.forEach(contract => {
      contract.claims.forEach(claim => {
        if (claim.status === 'pending') {
          claims.push({ ...claim, contract })
        }
      })
    })
    return claims.sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
  })

  const confirmedClaims = computed(() => {
    const claims: (Claim & { contract: Contract })[] = []
    contracts.value.forEach(contract => {
      contract.claims.forEach(claim => {
        if (claim.status === 'confirmed') {
          claims.push({ ...claim, contract })
        }
      })
    })
    return claims.sort((a, b) => new Date(b.confirmedAt || b.claimedAt).getTime() - new Date(a.confirmedAt || a.claimedAt).getTime())
  })

  function getClaimsByContract(contractId: string): Claim[] {
    const contract = getById(contractId)
    return contract?.claims || []
  }

  function getClaimById(contractId: string, claimId: string): Claim | undefined {
    const contract = getById(contractId)
    return contract?.claims.find(c => c.id === claimId)
  }

  function search(keyword: string, type?: ContractType, status?: ContractStatus): Contract[] {
    let result = [...contracts.value]
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      result = result.filter(c => 
        c.title.toLowerCase().includes(lowerKeyword) ||
        c.contractNo.toLowerCase().includes(lowerKeyword) ||
        c.partyA.toLowerCase().includes(lowerKeyword) ||
        c.partyB.toLowerCase().includes(lowerKeyword)
      )
    }
    
    if (type) {
      result = result.filter(c => c.type === type)
    }
    
    if (status) {
      result = result.filter(c => c.status === status)
    }
    
    return result
  }

  return {
    contracts,
    activeContracts,
    draftContracts,
    archivedContracts,
    cancelledContracts,
    pendingApprovalContracts,
    expiringContracts,
    pendingClaims,
    confirmedClaims,
    getById,
    add,
    update,
    remove,
    archive,
    cancel,
    unarchive,
    submitForApproval,
    approve,
    reject,
    transfer,
    addSign,
    withdraw,
    activate,
    addClaim,
    confirmClaim,
    cancelClaim,
    getClaimsByContract,
    getClaimById,
    search
  }
})