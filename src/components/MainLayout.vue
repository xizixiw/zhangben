<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'

const route = useRoute()
const router = useRouter()
const store = useDataStore()

const isCollapse = ref(false)

const menuItems = [
  { path: '/', icon: 'Tickets', title: '账目' },
  { path: '/statistics', icon: 'DataAnalysis', title: '统计' },
  { path: '/categories', icon: 'Menu', title: '分类' },
  { path: '/accounts', icon: 'Wallet', title: '账户' },
  { path: '/settings', icon: 'Setting', title: '设置' }
]

const activeMenu = computed(() => route.path)

const handleSelect = (path: string) => {
  router.push(path)
}

const totalIncome = computed(() => {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return store.entries
    .filter(e => e.type === 'income' && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0)
})

const totalExpense = computed(() => {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return store.entries
    .filter(e => e.type === 'expense' && e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0)
})

const formatMoney = (amount: number) => {
  return (amount / 100).toFixed(2)
}
</script>

<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <el-icon :size="24"><Wallet /></el-icon>
        <span v-show="!isCollapse" class="logo-text">本地账本</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        @select="handleSelect"
        class="side-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>

      <div class="toggle-btn" @click="isCollapse = !isCollapse">
        <el-icon>
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>{{ route.meta.title }}</h2>
        </div>
        <div class="header-right">
          <div class="summary">
            <div class="summary-item income">
              <span class="label">本月收入</span>
              <span class="amount">{{ formatMoney(totalIncome) }}</span>
            </div>
            <div class="summary-item expense">
              <span class="label">本月支出</span>
              <span class="amount">{{ formatMoney(totalExpense) }}</span>
            </div>
          </div>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout {
  height: 100%;
}

.aside {
  background-color: #304156;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #3a4a5e;
}

.logo-text {
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
}

.side-menu {
  flex: 1;
  border-right: none;
  background-color: #304156;
}

.side-menu:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  background-color: #263445;
  color: #409EFF;
}

.toggle-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfcbd9;
  cursor: pointer;
  border-top: 1px solid #3a4a5e;
}

.toggle-btn:hover {
  background-color: #263445;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left h2 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.summary {
  display: flex;
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.summary-item .label {
  font-size: 12px;
  color: #909399;
}

.summary-item .amount {
  font-size: 16px;
  font-weight: 600;
}

.summary-item.income .amount {
  color: #67C23A;
}

.summary-item.expense .amount {
  color: #F56C6C;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
