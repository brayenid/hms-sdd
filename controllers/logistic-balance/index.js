const autoBind = require('auto-bind')
const LogisticBalanceService = require('../../services/LogisticBalanceService')

class LogisticBalanceController {
  constructor() {
    this.service = new LogisticBalanceService()

    autoBind(this)
  }

  async addBalance(req, res) {
    const { amount } = req.body

    try {
      await this.service.balanceOperation(amount, 'add')

      return res.status(200).json({
        status: 'success',
        message: 'Saldo logistik berhasil ditambahkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBalance(req, res) {
    try {
      const response = await this.service.getBalance()

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = LogisticBalanceController
