import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'
import type { LedgerData, LedgerMeta, Category, Account, Settings } from '../types'
import { v4 as uuidv4 } from 'uuid'

const DATA_FILE = 'ledger.json'
const DATA_VERSION = '1.0.0'

export class FileService {
  private dataDir: string
  private dataPath: string

  constructor(dataDir: string) {
    this.dataDir = dataDir
    this.dataPath = join(dataDir, DATA_FILE)
    this.ensureDataDir()
  }

  private ensureDataDir() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true })
    }
  }

  private getDefaultData(): LedgerData {
    const now = new Date().toISOString()
    const meta: LedgerMeta = {
      createdAt: now,
      updatedAt: now
    }

    const defaultCategories: Category[] = [
      { id: uuidv4(), name: '餐饮', type: 'expense', icon: 'food', color: '#FF6B6B', sort: 1 },
      { id: uuidv4(), name: '交通', type: 'expense', icon: 'car', color: '#4ECDC4', sort: 2 },
      { id: uuidv4(), name: '购物', type: 'expense', icon: 'shopping', color: '#45B7D1', sort: 3 },
      { id: uuidv4(), name: '娱乐', type: 'expense', icon: 'game', color: '#96CEB4', sort: 4 },
      { id: uuidv4(), name: '医疗', type: 'expense', icon: 'hospital', color: '#FFEAA7', sort: 5 },
      { id: uuidv4(), name: '教育', type: 'expense', icon: 'book', color: '#DDA0DD', sort: 6 },
      { id: uuidv4(), name: '其他支出', type: 'expense', icon: 'other', color: '#B0B0B0', sort: 99 },
      { id: uuidv4(), name: '工资', type: 'income', icon: 'money', color: '#2ECC71', sort: 1 },
      { id: uuidv4(), name: '奖金', type: 'income', icon: 'gift', color: '#F39C12', sort: 2 },
      { id: uuidv4(), name: '投资收益', type: 'income', icon: 'chart', color: '#9B59B6', sort: 3 },
      { id: uuidv4(), name: '其他收入', type: 'income', icon: 'other', color: '#95A5A6', sort: 99 }
    ]

    const defaultAccounts: Account[] = [
      {
        id: uuidv4(),
        name: '现金',
        type: 'cash',
        icon: 'cash',
        color: '#27AE60',
        initialBalance: 0,
        isDefault: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    const defaultSettings: Settings = {
      theme: 'light',
      language: 'zh-CN',
      currency: 'CNY',
      firstDayOfWeek: 1,
      autoBackup: true,
      backupInterval: 7
    }

    return {
      version: DATA_VERSION,
      meta,
      entries: [],
      categories: defaultCategories,
      accounts: defaultAccounts,
      settings: defaultSettings
    }
  }

  async loadData(): Promise<LedgerData> {
    try {
      if (!existsSync(this.dataPath)) {
        const defaultData = this.getDefaultData()
        await this.saveData(defaultData)
        return defaultData
      }

      const content = readFileSync(this.dataPath, 'utf-8')
      const data = JSON.parse(content) as LedgerData

      if (!data.version || !data.meta || !data.entries || !data.categories || !data.accounts) {
        throw new Error('Invalid data format')
      }

      return data
    } catch (error) {
      console.error('Failed to load data:', error)
      const defaultData = this.getDefaultData()
      await this.saveData(defaultData)
      return defaultData
    }
  }

  async saveData(data: LedgerData): Promise<void> {
    this.ensureDataDir()
    data.meta.updatedAt = new Date().toISOString()
    const content = JSON.stringify(data, null, 2)
    writeFileSync(this.dataPath, content, 'utf-8')
  }

  async exportData(filePath: string): Promise<void> {
    if (!existsSync(this.dataPath)) {
      throw new Error('No data to export')
    }
    copyFileSync(this.dataPath, filePath)
  }

  async importData(filePath: string): Promise<LedgerData> {
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content) as LedgerData

    if (!data.version || !data.meta || !data.entries || !data.categories || !data.accounts) {
      throw new Error('Invalid import file format')
    }

    await this.saveData(data)
    return data
  }

  getDataPath(): string {
    return this.dataPath
  }
}
