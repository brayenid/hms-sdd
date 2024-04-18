const autoBind = require('auto-bind')
const TransactionService = require('../../services/TransactionService')

class TransactionController {
  constructor() {
    this.service = new TransactionService()

    autoBind(this)
  }

  async getTransactions(req, res) {
    const { limit, search, start, end } = req.query

    try {
      const response = await this.service.getTransactions(limit, search, start, end)

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

  async getTransactionById(req, res) {
    const { transactionId } = req.params

    try {
      const response = await this.service.getTransactionById(transactionId)

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

  async getTransactionsFreq(req, res) {
    const { limit } = req.query
    try {
      const response = await this.service.getTransactionsFreq(limit)

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

  async getTransactionsTotalMonth(req, res) {
    const { limit } = req.query

    try {
      const response = await this.service.getTransactionsTotal(limit)

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

module.exports = TransactionController
