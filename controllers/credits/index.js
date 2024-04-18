const autoBind = require('auto-bind')
const CreditService = require('../../services/CreditService')
const { pool } = require('../../db/pool')

class CreditController {
  constructor() {
    this.service = new CreditService()
    this._pool = pool

    autoBind(this)
  }

  async addCredit(req, res) {
    const { creditor, detail, due } = req.body
    const { id: admin } = req.session.user

    try {
      this._pool.query('BEGIN')

      await this.service.addCredit({ creditor, detail, due, admin })

      this._pool.query('COMMIT')

      return res.status(201).json({
        status: 'success',
        message: 'Tagihan berhasil dibuat'
      })
    } catch (error) {
      console.log(error)
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getCredit(req, res) {
    const { search, start, end, limit } = req.query
    try {
      const credits = await this.service.getCredits(search, limit, start, end)

      return res.status(200).json({
        status: 'success',
        data: credits
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getCreditById(req, res) {
    try {
      const { creditId } = req.params
      const data = await this.service.getCreditById(creditId)

      return res.status(200).json({
        status: 'success',
        data
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  // CREDIT_TRANSACTION
  async addCreditTransaction(req, res) {
    const { creditId, settledInvoice, creditTotal, creditPaid } = req.body
    const { id: admin } = req.session.user

    try {
      await this._pool.query('BEGIN')

      await this.service.addCreditTransaction({
        creditId,
        settledInvoice,
        creditTotal,
        creditPaid,
        admin
      })

      await this._pool.query('COMMIT')

      return res.status(201).json({
        status: 'success',
        message: 'Transaksi berhasil dimasukan ke dalam daftar tagihan'
      })
    } catch (error) {
      console.log(error)
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = CreditController
