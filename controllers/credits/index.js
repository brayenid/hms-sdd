const autoBind = require('auto-bind')
const CreditService = require('../../services/CreditService')
const { pool } = require('../../db/pool')
const LogService = require('../../services/LogService')
const GuestService = require('../../services/GuestService')

class CreditController {
  constructor() {
    this.service = new CreditService()
    this._pool = pool
    this.logService = new LogService()
    this.guestService = new GuestService()

    autoBind(this)
  }

  async addCredit(req, res) {
    const { creditor, detail, due } = req.body
    const { id: admin } = req.session.user

    try {
      this._pool.query('BEGIN')

      const id = await this.service.addCredit({ creditor, detail, due, admin })

      this._pool.query('COMMIT')

      this.logService.addLog(`Kredit baru : ${id}`, admin)

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

  async updateCredit(req, res) {
    const { creditId } = req.params
    const { creditor, detail, due } = req.body
    const { id: admin } = req.session.user

    try {
      await this.service.updateCredit(creditId, { creditor, detail, due, admin })

      this.logService.addLog(`Perubahan data kredit : ${creditId}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Tagihan berhasil diubah'
      })
    } catch (error) {
      console.log(error)

      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async deleteCredit(req, res) {
    const { creditId } = req.params
    const { id: admin } = req.session.user

    try {
      await this.service.deleteCredit(creditId)

      this.logService.addLog(`Penghapusan tagihan : ${creditId}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Tagihan berhasil dihapus'
      })
    } catch (error) {
      console.log(error)
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

      this.logService.addLog(`Penambahan item kredit : ${creditId}`, admin)

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

  async updateCreditTransaction(req, res) {
    const { id, paid, amount } = req.body
    const { id: admin } = req.session.user

    try {
      if (paid > amount) {
        throw new Error('Terbayar lebih besar dari jumlah yang harus dibayarkan')
      }
      await this._pool.query('BEGIN')

      await this.service.updateCreditTransaction({ id, paid, admin })

      await this._pool.query('COMMIT')

      this.logService.addLog(`Perubahan item kredit : ${id}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbaharui item tagihan'
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

  async deleteCreditTransaction(req, res) {
    const { creditId } = req.params
    const { id: admin } = req.session.user

    try {
      await this.service.deleteCreditTransaction(creditId)

      this.logService.addLog(`Penghapusan item kredit : ${creditId}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Item tagihan berhasil dihapus'
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = CreditController
