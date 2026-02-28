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
 * 备份信息
 */
export interface BackupInfo {
  fileName: string
  filePath: string
  createdAt: string
  size: number
}

/**
 * 错误码
 */
export enum ErrorCode {
  FILE_NOT_FOUND = 'E001',
  FILE_READ_ERROR = 'E002',
  FILE_WRITE_ERROR = 'E003',
  FILE_PARSE_ERROR = 'E004',
  VALIDATION_ERROR = 'E101',
  INVALID_DATA_FORMAT = 'E102',
  MISSING_REQUIRED_FIELD = 'E103',
  CATEGORY_IN_USE = 'E201',
  ACCOUNT_IN_USE = 'E202',
  DUPLICATE_NAME = 'E203',
  EXPORT_FAILED = 'E301',
  IMPORT_FAILED = 'E302',
  UNSUPPORTED_FORMAT = 'E303'
}

/**
 * 应用错误
 */
export interface AppError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

/**
 * 图表数据项
 */
export interface ChartDataItem {
  name: string
  value: number
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
