<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDataStore } from './stores/data'
import MainLayout from './components/MainLayout.vue'

const isLoading = ref(true)

onMounted(async () => {
  const store = useDataStore()
  await store.loadData()
  isLoading.value = false
})
</script>

<template>
  <el-config-provider>
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading" :size="48">
        <Loading />
      </el-icon>
      <p>加载中...</p>
    </div>
    <MainLayout v-else />
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.loading-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #409EFF;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}
</style>
