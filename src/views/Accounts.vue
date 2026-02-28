<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '../stores/data'
import type { Account } from '../types'
import { v4 as uuidv4 } from 'uuid'

const store = useDataStore()

const showDialog = ref(false)
const editingAccount = ref<Account | null>(null)

const form = ref({
  name: '',
  type: 'cash' as Account['type'],
  initialBalance: 0,
  remark: '',
  isDefault: false
})

const accountTypes = [
  { value: 'cash', label: '现金' },
  { value: 'debit_card', label: '借记卡' },
  { value: 'credit_card', label: '信用卡' },
  { value: 'e_wallet', label: '电子钱包' },
  { value: 'other', label: '其他' }
]

const getTypeName = (type: string) => {
  return accountTypes.find(t => t.value === type)?.label || type
}

const formatMoney = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const handleAdd = () => {
  editingAccount.value = null
  form.value = {
    name: '',
    type: 'cash',
    initialBalance: 0,
    remark: '',
    isDefault: store.accounts.length === 0
  }
  showDialog.value = true
}

const handleEdit = (account: Account) => {
  editingAccount.value = account
  form.value = {
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance / 100,
    remark: account.remark || '',
    isDefault: account.isDefault
  }
  showDialog.value = true
}

const handleDelete = (account: Account) => {
  const inUse = store.entries.some(e => e.accountId === account.id)

  if (inUse) {
    ElMessage.warning('该账户有账目记录关联，无法删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除账户"${account.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.deleteAccount(account.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入账户名称')
    return
  }

  const now = new Date().toISOString()

  if (editingAccount.value) {
    store.updateAccount(editingAccount.value.id, {
      name: form.value.name,
      type: form.value.type,
      initialBalance: Math.round(form.value.initialBalance * 100),
      remark: form.value.remark,
      isDefault: form.value.isDefault
    })
    ElMessage.success('修改成功')
  } else {
    const newAccount: Account = {
      id: uuidv4(),
      name: form.value.name,
      type: form.value.type,
      initialBalance: Math.round(form.value.initialBalance * 100),
      remark: form.value.remark,
      isDefault: form.value.isDefault,
      createdAt: now,
      updatedAt: now
    }
    store.addAccount(newAccount)
    ElMessage.success('添加成功')
  }

  showDialog.value = false
}
</script>

<template>
  <div class="accounts-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加账户
          </el-button>
        </div>
      </template>

      <div class="account-list">
        <div
          v-for="account in store.accounts"
          :key="account.id"
          class="account-item"
        >
          <div class="account-icon">
            <el-icon :size="24"><Wallet /></el-icon>
          </div>
          <div class="account-info">
            <div class="account-header">
              <span class="name">{{ account.name }}</span>
              <el-tag v-if="account.isDefault" type="success" size="small">默认</el-tag>
              <el-tag type="info" size="small">{{ getTypeName(account.type) }}</el-tag>
            </div>
            <div v-if="account.remark" class="remark">{{ account.remark }}</div>
          </div>
          <div class="account-balance">
            <div class="label">当前余额</div>
            <div class="amount" :class="{ positive: store.getAccountBalance(account.id) >= 0, negative: store.getAccountBalance(account.id) < 0 }">
              {{ formatMoney(store.getAccountBalance(account.id)) }}
            </div>
          </div>
          <div class="actions">
            <el-button link type="primary" @click="handleEdit(account)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" @click="handleDelete(account)" :disabled="account.isDefault && store.accounts.length === 1">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <el-empty v-if="store.accounts.length === 0" description="暂无账户" />
      </div>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="editingAccount ? '编辑账户' : '添加账户'"
      width="450px"
    >
      <el-form label-width="80px">
        <el-form-item label="账户名称" required>
          <el-input v-model="form.name" placeholder="请输入账户名称" maxlength="20" />
        </el-form-item>

        <el-form-item label="账户类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option
              v-for="type in accountTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="初始余额">
          <el-input-number
            v-model="form.initialBalance"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>

        <el-form-item label="默认账户">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.accounts-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.account-item:hover {
  background: #eef1f6;
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.account-info {
  flex: 1;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-header .name {
  font-weight: 600;
  font-size: 16px;
}

.account-info .remark {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.account-balance {
  text-align: right;
  margin-right: 20px;
}

.account-balance .label {
  font-size: 12px;
  color: #909399;
}

.account-balance .amount {
  font-size: 20px;
  font-weight: 600;
  margin-top: 4px;
}

.account-balance .amount.positive {
  color: #67C23A;
}

.account-balance .amount.negative {
  color: #F56C6C;
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.account-item:hover .actions {
  opacity: 1;
}
</style>
