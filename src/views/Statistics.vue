<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '../stores/data'
import * as echarts from 'echarts'

const store = useDataStore()

const dateRange = ref<[string, string]>([
  new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
])

const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const filteredEntries = computed(() => {
  return store.entries.filter(e => {
    return e.date >= dateRange.value[0] && e.date <= dateRange.value[1]
  })
})

const totalIncome = computed(() => {
  return filteredEntries.value
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
})

const totalExpense = computed(() => {
  return filteredEntries.value
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

const expenseByCategory = computed(() => {
  const map = new Map<string, number>()
  filteredEntries.value
    .filter(e => e.type === 'expense')
    .forEach(e => {
      const current = map.get(e.categoryId) || 0
      map.set(e.categoryId, current + e.amount)
    })

  return Array.from(map.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      name: store.categories.find(c => c.id === categoryId)?.name || '未知分类',
      color: store.categories.find(c => c.id === categoryId)?.color || '#909399'
    }))
    .sort((a, b) => b.amount - a.amount)
})

const incomeByCategory = computed(() => {
  const map = new Map<string, number>()
  filteredEntries.value
    .filter(e => e.type === 'income')
    .forEach(e => {
      const current = map.get(e.categoryId) || 0
      map.set(e.categoryId, current + e.amount)
    })

  return Array.from(map.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      name: store.categories.find(c => c.id === categoryId)?.name || '未知分类',
      color: store.categories.find(c => c.id === categoryId)?.color || '#909399'
    }))
    .sort((a, b) => b.amount - a.amount)
})

const dailyExpense = computed(() => {
  const map = new Map<string, number>()
  filteredEntries.value
    .filter(e => e.type === 'expense')
    .forEach(e => {
      const current = map.get(e.date) || 0
      map.set(e.date, current + e.amount)
    })

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({
      date,
      amount
    }))
})

const formatMoney = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const initCharts = () => {
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
  }
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
  }
  updateCharts()
}

const updateCharts = () => {
  if (pieChart) {
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          name: '支出分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: expenseByCategory.value.map(item => ({
            value: item.amount,
            name: item.name,
            itemStyle: { color: item.color }
          }))
        }
      ]
    })
  }

  if (barChart) {
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dailyExpense.value.map(d => d.date.slice(5)),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => (value / 100).toFixed(0)
        }
      },
      series: [
        {
          name: '支出',
          type: 'bar',
          data: dailyExpense.value.map(d => d.amount),
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    })
  }
}

const handleDateChange = () => {
  updateCharts()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    pieChart?.resize()
    barChart?.resize()
  })
})
</script>

<template>
  <div class="statistics-page">
    <el-card class="filter-card">
      <div class="filter-row">
        <span class="label">统计周期：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
      </div>
    </el-card>

    <div class="summary-cards">
      <el-card class="summary-card income">
        <div class="card-content">
          <div class="label">总收入</div>
          <div class="amount">{{ formatMoney(totalIncome) }}</div>
        </div>
        <el-icon class="card-icon"><TrendCharts /></el-icon>
      </el-card>

      <el-card class="summary-card expense">
        <div class="card-content">
          <div class="label">总支出</div>
          <div class="amount">{{ formatMoney(totalExpense) }}</div>
        </div>
        <el-icon class="card-icon"><ShoppingCart /></el-icon>
      </el-card>

      <el-card class="summary-card balance" :class="{ positive: balance >= 0, negative: balance < 0 }">
        <div class="card-content">
          <div class="label">结余</div>
          <div class="amount">{{ formatMoney(Math.abs(balance)) }}</div>
          <div class="sub">{{ balance >= 0 ? '盈利' : '亏损' }}</div>
        </div>
        <el-icon class="card-icon"><Wallet /></el-icon>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card class="chart-card">
        <template #header>
          <span>支出分布</span>
        </template>
        <div ref="pieChartRef" class="chart" />
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <span>每日支出趋势</span>
        </template>
        <div ref="barChartRef" class="chart" />
      </el-card>
    </div>

    <div class="detail-row">
      <el-card class="detail-card">
        <template #header>
          <span>支出分类明细</span>
        </template>
        <div class="category-list">
          <div v-for="item in expenseByCategory" :key="item.categoryId" class="category-item">
            <span class="dot" :style="{ backgroundColor: item.color }" />
            <span class="name">{{ item.name }}</span>
            <span class="amount">{{ formatMoney(item.amount) }}</span>
            <span class="percent">{{ ((item.amount / totalExpense) * 100).toFixed(1) }}%</span>
          </div>
          <el-empty v-if="expenseByCategory.length === 0" description="暂无数据" />
        </div>
      </el-card>

      <el-card class="detail-card">
        <template #header>
          <span>收入分类明细</span>
        </template>
        <div class="category-list">
          <div v-for="item in incomeByCategory" :key="item.categoryId" class="category-item">
            <span class="dot" :style="{ backgroundColor: item.color }" />
            <span class="name">{{ item.name }}</span>
            <span class="amount">{{ formatMoney(item.amount) }}</span>
            <span class="percent">{{ totalIncome > 0 ? ((item.amount / totalIncome) * 100).toFixed(1) : 0 }}%</span>
          </div>
          <el-empty v-if="incomeByCategory.length === 0" description="暂无数据" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
}

.filter-card {
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-row .label {
  font-weight: 500;
  color: #606266;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.summary-card {
  position: relative;
  overflow: hidden;
}

.summary-card .card-content {
  position: relative;
  z-index: 1;
}

.summary-card .label {
  font-size: 14px;
  color: #909399;
}

.summary-card .amount {
  font-size: 28px;
  font-weight: 600;
  margin-top: 8px;
}

.summary-card .sub {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.summary-card .card-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 60px;
  opacity: 0.1;
}

.summary-card.income .amount {
  color: #67C23A;
}

.summary-card.expense .amount {
  color: #F56C6C;
}

.summary-card.balance.positive .amount {
  color: #67C23A;
}

.summary-card.balance.negative .amount {
  color: #F56C6C;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  min-height: 350px;
}

.chart {
  height: 280px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-card {
  max-height: 400px;
  overflow-y: auto;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.category-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.category-item .name {
  flex: 1;
  font-weight: 500;
}

.category-item .amount {
  font-weight: 600;
  color: #303133;
}

.category-item .percent {
  font-size: 12px;
  color: #909399;
  min-width: 50px;
  text-align: right;
}
</style>
