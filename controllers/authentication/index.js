const autoBind = require('auto-bind')
const AccountService = require('../../services/AccountService')

class AuthenticationController {
  constructor() {
    this.service = new AccountService()

    autoBind(this)
  }

  async addSession(req, res) {
    const { username, password } = req.body

    try {
      if (req.session.user) {
        throw new Error('Permintaan gagal, anda sudah login')
      }
      const { id, role, name } = await this.service.verifyCredential(username, password)

      req.session.user = {
        id,
        username,
        name,
        role
      }

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil masuk'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeSession(req, res) {
    if (!req.session.user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Permintaan keluar tidak valid, anda belum login'
      })
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(400).json({
          status: 'fail',
          message: err
        })
      }
      return res.status(200).clearCookie('hms.session').json({
        status: 'success',
        message: 'Berhasil keluar'
      })
    })
  }
}

module.exports = AuthenticationController
