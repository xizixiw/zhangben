/**
 * 类型定义 - Electron 端使用
 */

/**
 * 账目记录
 */
export interface Entry {
  id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  accountId: string
  date: string
  time?: string
  remark?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 分类
 */
export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
  parentId?: string
  sort: number
}

/**
 * 账户类型
 */
export type AccountType = 'cash' | 'debit_card' | 'credit_card' | 'e_wallet' | 'other'

/**
 * 账户
 */
export interface Account {
  id: string
  name: string
  type: AccountType
  icon?: string
  color?: string
  initialBalance: number
  remark?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 用户设置
 */
export interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  currency: string
  firstDayOfWeek: 0 | 1
  autoBackup: boolean
  backupInterval: number
}

/**
 * 账本元信息
 */
export interface LedgerMeta {
  createdAt: string
  updatedAt: string
  lastBackupAt?: string
}

/**
 * 账本完整数据结构
 */
export interface LedgerData {
  version: string
  meta: LedgerMeta
  entries: Entry[]
  categories: Category[]
  accounts: Account[]
  settings: Settings
}

/**
 * IPC 通信 API
 */
export interface LedgerAPI {
  loadData(): Promise<LedgerData>
  saveData(data: LedgerData): Promise<void>
  exportData(filePath: string): Promise<void>
  importData(filePath: string): Promise<LedgerData>
  createBackup(): Promise<string>
  restoreBackup(filePath: string): Promise<void>
  listBackups(): Promise<BackupInfo[]>
  getDataPath(): Promise<string>
  getAppVersion(): Promise<string>
  selectExportPath(): Promise<string | null>
  selectImportPath(): Promise<string | null>
}

/**
 * 备份信息
 */
export interface BackupInfo {
  fileName: string
  filePath: string
  createdAt: string
  size: number
}
