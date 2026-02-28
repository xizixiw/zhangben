<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '../stores/data'
import type { BackupInfo } from '../types'

const store = useDataStore()

const appVersion = ref('')
const dataPath = ref('')
const backups = ref<BackupInfo[]>([])
const isLoadingBackups = ref(false)

const loadAppInfo = async () => {
  try {
    appVersion.value = await window.ledgerAPI.getAppVersion()
    dataPath.value = await window.ledgerAPI.getDataPath()
  } catch (error) {
    console.error('Failed to load app info:', error)
  }
}

const loadBackups = async () => {
  isLoadingBackups.value = true
  try {
    backups.value = await window.ledgerAPI.listBackups()
  } catch (error) {
    console.error('Failed to load backups:', error)
  } finally {
    isLoadingBackups.value = false
  }
}

const handleExport = async () => {
  try {
    const filePath = await window.ledgerAPI.selectExportPath()
    if (filePath) {
      await window.ledgerAPI.exportData(filePath)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('Export failed:', error)
  }
}

const handleImport = async () => {
  try {
    const filePath = await window.ledgerAPI.selectImportPath()
    if (filePath) {
      ElMessageBox.confirm(
        '导入数据将覆盖当前所有数据，是否继续？',
        '导入确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await window.ledgerAPI.importData(filePath)
          await store.loadData()
          ElMessage.success('导入成功')
        } catch (error) {
          ElMessage.error('导入失败，请检查文件格式')
        }
      }).catch(() => {})
    }
  } catch (error) {
    console.error('Import failed:', error)
  }
}

const handleCreateBackup = async () => {
  try {
    await window.ledgerAPI.createBackup()
    ElMessage.success('备份创建成功')
    await loadBackups()
  } catch (error) {
    ElMessage.error('备份失败')
    console.error('Backup failed:', error)
  }
}

const handleRestoreBackup = async (backup: BackupInfo) => {
  ElMessageBox.confirm(
    '恢复备份将覆盖当前所有数据，是否继续？',
    '恢复确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await window.ledgerAPI.restoreBackup(backup.filePath)
      await store.loadData()
      ElMessage.success('恢复成功')
    } catch (error) {
      ElMessage.error('恢复失败')
    }
  }).catch(() => {})
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadAppInfo()
  loadBackups()
})
</script>

<template>
  <div class="settings-page">
    <el-card class="info-card">
      <template #header>
        <span>应用信息</span>
      </template>
      <div class="info-list">
        <div class="info-item">
          <span class="label">版本号</span>
          <span class="value">{{ appVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据路径</span>
          <span class="value">{{ dataPath }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="data-card">
      <template #header>
        <span>数据管理</span>
      </template>
      <div class="data-actions">
        <div class="action-item">
          <div class="action-info">
            <div class="title">导出数据</div>
            <div class="desc">将账本数据导出为 JSON 文件</div>
          </div>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>

        <div class="action-item">
          <div class="action-info">
            <div class="title">导入数据</div>
            <div class="desc">从 JSON 文件导入账本数据</div>
          </div>
          <el-button type="warning" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
        </div>

        <div class="action-item">
          <div class="action-info">
            <div class="title">创建备份</div>
            <div class="desc">手动创建数据备份</div>
          </div>
          <el-button type="success" @click="handleCreateBackup">
            <el-icon><DocumentCopy /></el-icon>
            备份
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="backup-card">
      <template #header>
        <div class="backup-header">
          <span>备份列表</span>
          <el-button link type="primary" @click="loadBackups" :loading="isLoadingBackups">
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="backups" v-loading="isLoadingBackups" empty-text="暂无备份">
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleRestoreBackup(row)">
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 80px;
  color: #909399;
}

.info-item .value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.action-info .title {
  font-weight: 500;
  color: #303133;
}

.action-info .desc {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
