const autoBind = require('auto-bind')
const DepositService = require('../../services/DepositService')
const LogService = require('../../services/LogService')

class DepositController {
  constructor() {
    this.service = new DepositService()
    this.logService = new LogService()

    autoBind(this)
  }

  async putDeposit(req, res) {
    const { price } = req.body
    const { id: admin } = req.session.user

    try {
      const oldDeposit = this.service.getDeposit()
      await this.service.putDeposit(price)

      await this.logService.addLog(`Deposit diperbaharui : ${oldDeposit} > ${price}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Harga deposit berhasil dirubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = DepositController
