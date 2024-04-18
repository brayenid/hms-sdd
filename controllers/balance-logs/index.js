const autoBind = require('auto-bind')
const BalanceLogService = require('../../services/BalanceLogService')
const LogisticBalanceService = require('../../services/LogisticBalanceService')
const LogService = require('../../services/LogService')
const { pool } = require('../../db/pool')

class BalanceLogController {
  constructor() {
    this._pool = pool

    this.service = new BalanceLogService()
    this.balanceService = new LogisticBalanceService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addBalanceLog(req, res) {
    const { action, amount, detail } = req.body
    const { id: admin } = req.session.user

    try {
      await this._pool.query('BEGIN') // TRANSACTION

      const currentBalance = await this.balanceService.getBalance()
      const newBalance = () => {
        if (action === 'add') {
          return currentBalance + amount
        } else if (action === 'min') {
          return currentBalance - amount
        }
      }
      let message

      if (action === 'add') {
        await this.balanceService.balanceOperation(amount, 'add')
        await this.logService.addLog(`Penambahan saldo logistik : ${amount}`, admin)

        message = 'Berhasil menambahkan saldo'
      } else if (action === 'min') {
        const currentBalance = await this.balanceService.getBalance()

        if (currentBalance < amount) {
          throw new Error('Besaran pengurangan tidak boleh lebih besar dari saldo terkini')
        }
        await this.balanceService.balanceOperation(amount, 'min')
        await this.logService.addLog(`Pengurangan saldo logistik : ${amount}`, admin)

        message = 'Berhasil mengurangi saldo'
      }

      await this.service.addBalanceLog({ amount, detail, admin, action, lastBalance: newBalance() })

      await this._pool.query('COMMIT') // TRANSACTION
      return res.status(201).json({
        status: 'success',
        message
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = BalanceLogController
