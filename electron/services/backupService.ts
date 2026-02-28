import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import type { BackupInfo } from '../types'

import { FileService } from './fileService'

const BACKUP_DIR = 'backups'

export class BackupService {
  private backupDir: string
  private fileService: FileService

  constructor(dataDir: string) {
    this.backupDir = join(dataDir, BACKUP_DIR)
    this.fileService = new FileService(dataDir)
    this.ensureBackupDir()
  }

  private ensureBackupDir() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true })
    }
  }

  async createBackup(): Promise<string> {
    this.ensureBackupDir()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `ledger-backup-${timestamp}.json`
    const backupPath = join(this.backupDir, backupFileName)

    const dataPath = this.fileService.getDataPath()
    if (existsSync(dataPath)) {
      copyFileSync(dataPath, backupPath)
      return backupPath
    }

    throw new Error('No data file to backup')
  }

  async restoreBackup(filePath: string): Promise<void> {
    if (!existsSync(filePath)) {
      throw new Error('Backup file not found')
    }

    const dataPath = this.fileService.getDataPath()
    copyFileSync(filePath, dataPath)
  }

  async listBackups(): Promise<BackupInfo[]> {
    this.ensureBackupDir()

    const files = readdirSync(this.backupDir)
    const backups: BackupInfo[] = []

    for (const file of files) {
      if (file.startsWith('ledger-backup-') && file.endsWith('.json')) {
        const filePath = join(this.backupDir, file)
        const stats = statSync(filePath)

        backups.push({
          fileName: file,
          filePath: filePath,
          createdAt: stats.birthtime.toISOString(),
          size: stats.size
        })
      }
    }

    return backups.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async deleteBackup(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
  }
}
