const { db } = require('../globals/config')
const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const LogService = require('../services/LogService')

const logService = new LogService()

const deleteOldBackups = (folder, retentionDays) => {
  const now = new Date()
  const retentionTime = retentionDays * 24 * 60 * 60 * 1000 // Convert retentionDays to milliseconds

  fs.readdirSync(folder).forEach(async (file) => {
    const filePath = path.join(folder, file)
    const fileStat = fs.statSync(filePath)

    if (now - fileStat.ctime >= retentionTime) {
      fs.unlinkSync(filePath)
      await logService.addLog(`File ${file} dihapus karena melebihi batas retensi.`, 'admin')
    }
  })
}

const backupDb = async (folder = 'backup', retentionDays = 7) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  deleteOldBackups(folder, retentionDays)

  const command = 'pg_dump'
  const fileName = `hms-${Date.now()}.pgsql`
  const filePath = path.join(folder, fileName)
  const dbUser = db.dev.user
  const args = ['-U', dbUser, '-F', 'c', `hms > ${filePath}`]

  const env = {
    ...process.env,
    PGPASSWORD: db.dev.password
  }

  const fullCommand = `${command} ${args.join(' ')}`
  const execAsync = promisify(exec)

  try {
    await logService.addLog(`Backup berhasil dibuat: ${fileName}`, 'system')
    await execAsync(fullCommand, { env })
  } catch (error) {
    await logService.addLog(`Error saat membuat backup: ${error.message}`, 'system')
  }
}

module.exports = { backupDb }
