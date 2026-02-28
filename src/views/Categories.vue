<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '../stores/data'
import type { Category } from '../types'
import { v4 as uuidv4 } from 'uuid'

const store = useDataStore()

const showDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const activeType = ref<'expense' | 'income'>('expense')

const form = ref({
  name: '',
  type: 'expense' as 'income' | 'expense',
  icon: '',
  color: '#409EFF'
})

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6'
]

const handleAdd = (type: 'income' | 'expense') => {
  editingCategory.value = null
  form.value = {
    name: '',
    type,
    icon: '',
    color: colors[Math.floor(Math.random() * colors.length)]
  }
  showDialog.value = true
}

const handleEdit = (category: Category) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    type: category.type,
    icon: category.icon || '',
    color: category.color || '#409EFF'
  }
  showDialog.value = true
}

const handleDelete = (category: Category) => {
  const inUse = store.entries.some(e => e.categoryId === category.id)

  if (inUse) {
    ElMessage.warning('该分类正在使用中，无法删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除分类"${category.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.deleteCategory(category.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  if (editingCategory.value) {
    store.updateCategory(editingCategory.value.id, {
      name: form.value.name,
      icon: form.value.icon,
      color: form.value.color
    })
    ElMessage.success('修改成功')
  } else {
    const maxSort = Math.max(...store.categories.filter(c => c.type === form.value.type).map(c => c.sort), 0)
    const newCategory: Category = {
      id: uuidv4(),
      name: form.value.name,
      type: form.value.type,
      icon: form.value.icon,
      color: form.value.color,
      sort: maxSort + 1
    }
    store.addCategory(newCategory)
    ElMessage.success('添加成功')
  }

  showDialog.value = false
}
</script>

<template>
  <div class="categories-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
        </div>
      </template>

      <el-tabs v-model="activeType">
        <el-tab-pane label="支出分类" name="expense">
          <div class="category-grid">
            <div
              v-for="cat in store.expenseCategories"
              :key="cat.id"
              class="category-item"
            >
              <div class="color-dot" :style="{ backgroundColor: cat.color }" />
              <span class="name">{{ cat.name }}</span>
              <div class="actions">
                <el-button link type="primary" @click="handleEdit(cat)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" @click="handleDelete(cat)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="category-item add-item" @click="handleAdd('expense')">
              <el-icon><Plus /></el-icon>
              <span>添加分类</span>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="收入分类" name="income">
          <div class="category-grid">
            <div
              v-for="cat in store.incomeCategories"
              :key="cat.id"
              class="category-item"
            >
              <div class="color-dot" :style="{ backgroundColor: cat.color }" />
              <span class="name">{{ cat.name }}</span>
              <div class="actions">
                <el-button link type="primary" @click="handleEdit(cat)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" @click="handleDelete(cat)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="category-item add-item" @click="handleAdd('income')">
              <el-icon><Plus /></el-icon>
              <span>添加分类</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" />
        </el-form-item>

        <el-form-item label="颜色">
          <div class="color-picker">
            <div
              v-for="color in colors"
              :key="color"
              class="color-item"
              :class="{ active: form.color === color }"
              :style="{ backgroundColor: color }"
              @click="form.color = color"
            />
          </div>
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
.categories-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.category-item:hover {
  background: #eef1f6;
}

.category-item .color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

.category-item .name {
  flex: 1;
  font-weight: 500;
}

.category-item .actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.category-item:hover .actions {
  opacity: 1;
}

.add-item {
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  background: transparent;
  justify-content: center;
  color: #909399;
}

.add-item:hover {
  border-color: #409EFF;
  color: #409EFF;
  background: transparent;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-item {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: #303133;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #409EFF;
}
</style>
