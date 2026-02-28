<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDataStore } from '../stores/data'
import type { Entry } from '../types'

const props = defineProps<{
  entry?: Entry | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'cancel'): void
}>()

const store = useDataStore()

const form = ref({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  categoryId: '',
  accountId: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  remark: ''
})

const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const formRef = ref()

const categories = computed(() => {
  return form.value.type === 'expense' ? store.expenseCategories : store.incomeCategories
})

watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    form.value = {
      type: newEntry.type,
      amount: newEntry.amount / 100,
      categoryId: newEntry.categoryId,
      accountId: newEntry.accountId,
      date: newEntry.date,
      time: newEntry.time || '',
      remark: newEntry.remark || ''
    }
  } else {
    form.value = {
      type: 'expense',
      amount: 0,
      categoryId: '',
      accountId: store.defaultAccount?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      remark: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit', {
        type: form.value.type,
        amount: Math.round(form.value.amount * 100),
        categoryId: form.value.categoryId,
        accountId: form.value.accountId,
        date: form.value.date,
        time: form.value.time,
        remark: form.value.remark
      })
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="类型" prop="type">
      <el-radio-group v-model="form.type">
        <el-radio-button label="expense">支出</el-radio-button>
        <el-radio-button label="income">收入</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="金额" prop="amount">
      <el-input-number
        v-model="form.amount"
        :precision="2"
        :min="0"
        :max="999999999"
        :controls="false"
        placeholder="请输入金额"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="分类" prop="categoryId">
      <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        >
          <span :style="{ color: cat.color }">{{ cat.name }}</span>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="账户" prop="accountId">
      <el-select v-model="form.accountId" placeholder="请选择账户" style="width: 100%">
        <el-option
          v-for="acc in store.accounts"
          :key="acc.id"
          :label="acc.name"
          :value="acc.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="日期" prop="date">
      <el-date-picker
        v-model="form.date"
        type="date"
        placeholder="请选择日期"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="时间">
      <el-time-select
        v-model="form.time"
        placeholder="请选择时间"
        start="00:00"
        step="00:15"
        end="23:45"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="form.remark"
        type="textarea"
        :rows="2"
        placeholder="请输入备注"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        {{ entry ? '保存' : '添加' }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
