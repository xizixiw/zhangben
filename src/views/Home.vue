<script setup lang="ts">
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useDataStore } from '../stores/data'
import type { Entry } from '../types'
import EntryForm from '../components/EntryForm.vue'
import EntryList from '../components/EntryList.vue'

const store = useDataStore()

const showForm = ref(false)
const editingEntry = ref<Entry | null>(null)
const filterType = ref<'all' | 'income' | 'expense'>('all')
const filterDate = ref<[string, string] | null>(null)

const filteredEntries = computed(() => {
  let result = store.entries

  if (filterType.value !== 'all') {
    result = result.filter(e => e.type === filterType.value)
  }

  if (filterDate.value && filterDate.value[0] && filterDate.value[1]) {
    result = result.filter(e => {
      return e.date >= filterDate.value![0] && e.date <= filterDate.value![1]
    })
  }

  return result
})

const handleAdd = () => {
  editingEntry.value = null
  showForm.value = true
}

const handleEdit = (entry: Entry) => {
  editingEntry.value = { ...entry }
  showForm.value = true
}

const handleDelete = (id: string) => {
  store.deleteEntry(id)
}

const handleSubmit = (entryData: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingEntry.value) {
    store.updateEntry(editingEntry.value.id, entryData)
  } else {
    const now = new Date().toISOString()
    const newEntry: Entry = {
      ...entryData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    }
    store.addEntry(newEntry)
  }
  showForm.value = false
  editingEntry.value = null
}

const handleCancel = () => {
  showForm.value = false
  editingEntry.value = null
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const setQuickDate = (type: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date()
  let start: Date, end: Date

  switch (type) {
    case 'today':
      start = end = now
      break
    case 'week':
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      start = new Date(now.setDate(diff))
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      break
  }

  filterDate.value = [formatDate(start), formatDate(end)]
}
</script>

<template>
  <div class="home-page">
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增账目
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
            <el-radio-button label="expense">支出</el-radio-button>
          </el-radio-group>
          <el-button-group size="small" class="quick-date">
            <el-button @click="setQuickDate('today')">今日</el-button>
            <el-button @click="setQuickDate('week')">本周</el-button>
            <el-button @click="setQuickDate('month')">本月</el-button>
            <el-button @click="setQuickDate('year')">本年</el-button>
          </el-button-group>
          <el-date-picker
            v-model="filterDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            size="small"
            clearable
          />
        </div>
      </div>
    </el-card>

    <EntryList
      :entries="filteredEntries"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <el-dialog
      v-model="showForm"
      :title="editingEntry ? '编辑账目' : '新增账目'"
      width="500px"
      :close-on-click-modal="false"
    >
      <EntryForm
        :entry="editingEntry"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.toolbar-card {
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-date {
  margin-left: 8px;
}
</style>
