<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useDataStore } from '../stores/data'
import type { Entry } from '../types'

const props = defineProps<{
  entries: Entry[]
}>()

const emit = defineEmits<{
  (e: 'edit', entry: Entry): void
  (e: 'delete', id: string): void
}>()

const store = useDataStore()

const getCategoryName = (id: string) => {
  return store.categories.find(c => c.id === id)?.name || '未知分类'
}

const getCategoryColor = (id: string) => {
  return store.categories.find(c => c.id === id)?.color || '#909399'
}

const getAccountName = (id: string) => {
  return store.accounts.find(a => a.id === id)?.name || '未知账户'
}

const formatMoney = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const handleEdit = (entry: Entry) => {
  emit('edit', entry)
}

const handleDelete = (entry: Entry) => {
  ElMessageBox.confirm(
    `确定要删除这笔${entry.type === 'income' ? '收入' : '支出'}记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete', entry.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消
  })
}

const groupedEntries = computed(() => {
  const groups: Record<string, Entry[]> = {}

  props.entries.forEach(entry => {
    if (!groups[entry.date]) {
      groups[entry.date] = []
    }
    groups[entry.date].push(entry)
  })

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({
      date,
      entries: groups[date].sort((a, b) => {
        const timeA = a.time || '00:00'
        const timeB = b.time || '00:00'
        return timeB.localeCompare(timeA)
      }),
      income: groups[date]
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0),
      expense: groups[date]
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0)
    }))
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  if (dateStr === today) {
    return `今天 ${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
  } else if (dateStr === yesterday) {
    return `昨天 ${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}
</script>

<template>
  <div class="entry-list">
    <el-empty v-if="entries.length === 0" description="暂无账目记录" />

    <div v-else class="entry-groups">
      <div v-for="group in groupedEntries" :key="group.date" class="entry-group">
        <div class="group-header">
          <span class="date">{{ formatDate(group.date) }}</span>
          <div class="summary">
            <span v-if="group.income > 0" class="income">
              收入: {{ formatMoney(group.income) }}
            </span>
            <span v-if="group.expense > 0" class="expense">
              支出: {{ formatMoney(group.expense) }}
            </span>
          </div>
        </div>

        <div class="group-entries">
          <div
            v-for="entry in group.entries"
            :key="entry.id"
            class="entry-item"
          >
            <div class="entry-icon">
              <span
                class="category-dot"
                :style="{ backgroundColor: getCategoryColor(entry.categoryId) }"
              />
            </div>
            <div class="entry-info">
              <div class="entry-main">
                <span class="category">{{ getCategoryName(entry.categoryId) }}</span>
                <span class="account">{{ getAccountName(entry.accountId) }}</span>
              </div>
              <div v-if="entry.remark" class="entry-remark">{{ entry.remark }}</div>
            </div>
            <div class="entry-amount" :class="entry.type">
              {{ entry.type === 'income' ? '+' : '-' }}{{ formatMoney(entry.amount) }}
            </div>
            <div class="entry-actions">
              <el-button link type="primary" @click="handleEdit(entry)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button link type="danger" @click="handleDelete(entry)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-list {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
}

.entry-groups {
  padding: 0;
}

.entry-group {
  border-bottom: 1px solid #f0f0f0;
}

.entry-group:last-child {
  border-bottom: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.date {
  font-weight: 500;
  color: #303133;
}

.summary {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.income {
  color: #67C23A;
}

.expense {
  color: #F56C6C;
}

.group-entries {
  padding: 8px 0;
}

.entry-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  transition: background-color 0.2s;
}

.entry-item:hover {
  background-color: #f5f7fa;
}

.entry-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category {
  font-weight: 500;
  color: #303133;
}

.account {
  font-size: 12px;
  color: #909399;
  padding: 2px 6px;
  background: #f4f4f5;
  border-radius: 4px;
}

.entry-remark {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-amount {
  font-size: 16px;
  font-weight: 600;
  margin-right: 16px;
}

.entry-amount.income {
  color: #67C23A;
}

.entry-amount.expense {
  color: #F56C6C;
}

.entry-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.entry-item:hover .entry-actions {
  opacity: 1;
}
</style>
