import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LedgerData, Entry, Category, Account, Settings } from '../types'

declare global {
  interface Window {
    ledgerAPI: {
      loadData: () => Promise<LedgerData>
      saveData: (data: LedgerData) => Promise<void>
      exportData: (filePath: string) => Promise<void>
      importData: (filePath: string) => Promise<LedgerData>
      createBackup: () => Promise<string>
      restoreBackup: (filePath: string) => Promise<void>
      listBackups: () => Promise<BackupInfo[]>
      getDataPath: () => Promise<string>
      getAppVersion: () => Promise<string>
      selectExportPath: () => Promise<string | null>
      selectImportPath: () => Promise<string | null>
    }
  }
}

interface BackupInfo {
  fileName: string
  filePath: string
  createdAt: string
  size: number
}

export const useDataStore = defineStore('data', () => {
  const data = ref<LedgerData | null>(null)

  const entries = computed(() => data.value?.entries || [])
  const categories = computed(() => data.value?.categories || [])
  const accounts = computed(() => data.value?.accounts || [])
  const settings = computed(() => data.value?.settings)

  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense').sort((a, b) => a.sort - b.sort)
  )

  const incomeCategories = computed(() =>
    categories.value.filter(c => c.type === 'income').sort((a, b) => a.sort - b.sort)
  )

  const defaultAccount = computed(() =>
    accounts.value.find(a => a.isDefault) || accounts.value[0]
  )

  async function loadData() {
    try {
      data.value = await window.ledgerAPI.loadData()
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  async function saveData() {
    if (data.value) {
      await window.ledgerAPI.saveData(data.value)
    }
  }

  function addEntry(entry: Entry) {
    if (data.value) {
      data.value.entries.unshift(entry)
      saveData()
    }
  }

  function updateEntry(id: string, updates: Partial<Entry>) {
    if (data.value) {
      const index = data.value.entries.findIndex(e => e.id === id)
      if (index !== -1) {
        data.value.entries[index] = {
          ...data.value.entries[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveData()
      }
    }
  }

  function deleteEntry(id: string) {
    if (data.value) {
      data.value.entries = data.value.entries.filter(e => e.id !== id)
      saveData()
    }
  }

  function addCategory(category: Category) {
    if (data.value) {
      data.value.categories.push(category)
      saveData()
    }
  }

  function updateCategory(id: string, updates: Partial<Category>) {
    if (data.value) {
      const index = data.value.categories.findIndex(c => c.id === id)
      if (index !== -1) {
        data.value.categories[index] = {
          ...data.value.categories[index],
          ...updates
        }
        saveData()
      }
    }
  }

  function deleteCategory(id: string) {
    if (data.value) {
      data.value.categories = data.value.categories.filter(c => c.id !== id)
      saveData()
    }
  }

  function addAccount(account: Account) {
    if (data.value) {
      if (account.isDefault) {
        data.value.accounts.forEach(a => {
          a.isDefault = false
        })
      }
      data.value.accounts.push(account)
      saveData()
    }
  }

  function updateAccount(id: string, updates: Partial<Account>) {
    if (data.value) {
      const index = data.value.accounts.findIndex(a => a.id === id)
      if (index !== -1) {
        if (updates.isDefault) {
          data.value.accounts.forEach(a => {
            a.isDefault = false
          })
        }
        data.value.accounts[index] = {
          ...data.value.accounts[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        saveData()
      }
    }
  }

  function deleteAccount(id: string) {
    if (data.value) {
      data.value.accounts = data.value.accounts.filter(a => a.id !== id)
      saveData()
    }
  }

  function updateSettings(newSettings: Partial<Settings>) {
    if (data.value) {
      data.value.settings = {
        ...data.value.settings,
        ...newSettings
      }
      saveData()
    }
  }

  function getAccountBalance(accountId: string): number {
    const account = accounts.value.find(a => a.id === accountId)
    if (!account) return 0

    const initial = account.initialBalance
    const balance = entries.value
      .filter(e => e.accountId === accountId)
      .reduce((sum, e) => {
        return e.type === 'income' ? sum + e.amount : sum - e.amount
      }, initial)

    return balance
  }

  function getEntriesByDateRange(startDate: string, endDate: string): Entry[] {
    return entries.value.filter(e => {
      return e.date >= startDate && e.date <= endDate
    })
  }

  function getEntriesByCategory(categoryId: string): Entry[] {
    return entries.value.filter(e => e.categoryId === categoryId)
  }

  return {
    data,
    entries,
    categories,
    accounts,
    settings,
    expenseCategories,
    incomeCategories,
    defaultAccount,
    loadData,
    saveData,
    addEntry,
    updateEntry,
    deleteEntry,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccount,
    updateAccount,
    deleteAccount,
    updateSettings,
    getAccountBalance,
    getEntriesByDateRange,
    getEntriesByCategory
  }
})
