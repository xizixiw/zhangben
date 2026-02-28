import { contextBridge, ipcRenderer } from 'electron'
import type { LedgerAPI } from './types'

const ledgerAPI: LedgerAPI = {
  loadData: () => ipcRenderer.invoke('loadData'),
  saveData: (data) => ipcRenderer.invoke('saveData', data),
  exportData: (filePath) => ipcRenderer.invoke('exportData', filePath),
  importData: (filePath) => ipcRenderer.invoke('importData', filePath),
  createBackup: () => ipcRenderer.invoke('createBackup'),
  restoreBackup: (filePath) => ipcRenderer.invoke('restoreBackup', filePath),
  listBackups: () => ipcRenderer.invoke('listBackups'),
  getDataPath: () => ipcRenderer.invoke('getDataPath'),
  getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
  selectExportPath: () => ipcRenderer.invoke('selectExportPath'),
  selectImportPath: () => ipcRenderer.invoke('selectImportPath')
}

contextBridge.exposeInMainWorld('ledgerAPI', ledgerAPI)
