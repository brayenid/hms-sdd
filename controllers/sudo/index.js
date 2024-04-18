const autoBind = require('auto-bind')
const AccountService = require('../../services/AccountService')
const config = require('../../globals/config')
const bcrypt = require('bcrypt')
const LogService = require('../../services/LogService')

class SudoController {
  constructor() {
    this.service = new AccountService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addAccount(req, res) {
    const hashedPassword = await bcrypt.hash(config.sudo.password, 10)
    const payload = {
      username: config.sudo.username,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'sudo'
    }
    try {
      await this.service.checkSudoAvailability()
      await this.service.addAccount(payload)

      return res.status(201).json({
        status: 'success',
        message: 'Akun berhasil dibuat'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async patchPassword(req, res) {
    const { oldPassword, newPassword } = req.body
    const { username, id } = req.session.user

    try {
      await this.service.verifyCredential(username, oldPassword)
      const newHashedPassword = await bcrypt.hash(newPassword, 10)
      await this.service.patchPassword(id, newHashedPassword)

      return res.status(200).json({
        status: 'success',
        message: 'Password berhasil diubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async addAdmin(req, res) {
    const { username, name, password, role } = req.body
    const { id } = req.session.user

    const hashedPassword = await bcrypt.hash(password, 10)
    const payload = {
      username,
      password: hashedPassword,
      name,
      role
    }

    try {
      await this.service.addAccount(payload)
      await this.logService.addLog(`Penambahan akun : ${payload.name}`, id)

      return res.status(201).json({
        status: 'success',
        message: 'Akun berhasil dibuat'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async putAdmin(req, res) {
    const { name, role } = req.body
    const { id } = req.params
    const { id: adminId } = req.session.user

    try {
      await this.service.putAccount({ name, role, id })
      await this.logService.addLog(`Perubahan info akun : ${name}`, adminId)
      return res.status(200).json({
        status: 'success',
        message: 'Akun berhasil diubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeAccount(req, res) {
    const { id } = req.params
    const { id: adminId } = req.session.user

    try {
      const { username } = await this.service.getAccountById(id)
      if (username === 'sudo' || username === 'system') {
        throw new Error('Akun utama tidak dapat dihapus')
      }
      await this.service.deleteAccountById(id)
      await this.logService.addLog(`Penghapusan akun : ${id}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Akun berhasil dihapus'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async resetSudo(req, res) {
    try {
      await this.service.resetSudo()
      await this.logService.addLog('Akun Super Admin di-reset', 'system')

      return res.status(200).json({
        status: 'success',
        message: 'Password sudo berhasil di-reset'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = SudoController
