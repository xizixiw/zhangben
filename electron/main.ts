import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { LedgerData, LedgerAPI } from './types'
import { FileService } from './services/fileService'
import { BackupService } from './services/backupService'

let mainWindow: BrowserWindow | null = null
let fileService: FileService | null = null
let backupService: BackupService | null = null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: '本地账本',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

function initServices() {
  const userDataPath = app.getPath('documents')
  const dataDir = join(userDataPath, 'LocalLedger')

  fileService = new FileService(dataDir)
  backupService = new BackupService(dataDir)
}

function setupIPC() {
  const api: LedgerAPI = {
    async loadData() {
      return fileService!.loadData()
    },

    async saveData(data: LedgerData) {
      return fileService!.saveData(data)
    },

    async exportData(filePath: string) {
      return fileService!.exportData(filePath)
    },

    async importData(filePath: string) {
      return fileService!.importData(filePath)
    },

    async createBackup() {
      return backupService!.createBackup()
    },

    async restoreBackup(filePath: string) {
      return backupService!.restoreBackup(filePath)
    },

    async listBackups() {
      return backupService!.listBackups()
    },

    async getDataPath() {
      return fileService!.getDataPath()
    },

    async getAppVersion() {
      return app.getVersion()
    },

    async selectExportPath() {
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: '导出账本数据',
        defaultPath: `ledger-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })
      return result.canceled ? null : result.filePath
    },

    async selectImportPath() {
      const result = await dialog.showOpenDialog(mainWindow!, {
        title: '导入账本数据',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      })
      return result.canceled ? null : result.filePaths[0]
    }
  }

  Object.entries(api).forEach(([channel, handler]) => {
    ipcMain.handle(channel, (_event, ...args) => handler(...args))
  })
}

app.whenReady().then(() => {
  initServices()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
