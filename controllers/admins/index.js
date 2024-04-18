const autoBind = require('auto-bind')
const AccountService = require('../../services/AccountService')
const bcrypt = require('bcrypt')

class AdminController {
  constructor() {
    this.service = new AccountService()

    autoBind(this)
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

  async patchPasswordById(req, res) {
    const { newPassword, accountId } = req.body

    try {
      const newHashedPassword = await bcrypt.hash(newPassword, 10)
      await this.service.patchPassword(accountId, newHashedPassword)

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
}

module.exports = AdminController
