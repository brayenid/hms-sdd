const autoBind = require('auto-bind')
const LogService = require('../../services/LogService')

class LogsController {
  constructor() {
    this.service = new LogService()

    autoBind(this)
  }

  async removeLogs(req, res) {
    try {
      await this.service.removeAllLogs()

      return res.status(200).json({
        status: 'success',
        message: 'Logs berhasil dibersihkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = LogsController
