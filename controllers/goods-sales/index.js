const autoBind = require('auto-bind')
const GoodsSalesService = require('../../services/GoodsSalesService')
const GoodsService = require('../../services/GoodsService')
const LogService = require('../../services/LogService')
const BookingService = require('../../services/BookService')
const SupplyService = require('../../services/SupplyService')
const LogisticBalanceService = require('../../services/LogisticBalanceService')
const { pool } = require('../../db/pool')

class GoodSalesController {
  constructor() {
    this._pool = pool

    this.service = new GoodsSalesService()
    this.goodsService = new GoodsService()
    this.bookingService = new BookingService()
    this.logService = new LogService()
    this.supplyService = new SupplyService()
    this.balanceService = new LogisticBalanceService()

    autoBind(this)
  }

  async addGoodsSales(req, res) {
    const { sales } = req.body
    const { id: admin } = req.session.user

    try {
      if (!sales.length) {
        throw new Error('Tidak ada barang yang ingin dibeli')
      }

      await this._pool.query('BEGIN') // TRANSACTION
      const currentBalance = await this.balanceService.getBalance()

      for (const sale of sales) {
        const payload = {
          booking: sale.booking,
          goods: sale.goods,
          quantity: sale.quantity,
          admin
        }

        await this.service.addGoodsSales(payload)
        const { name } = await this.goodsService.getGoodsById(payload.goods)

        await this.goodsService.goodsOperation({ goods: sale.goods, quantity: sale.quantity }, 'min')
        await this.supplyService.addNewSupply({
          goods: sale.goods,
          quantity: Number(-sale.quantity),
          price: 0,
          supplier: 'Transaksi dari Front Office',
          admin,
          lastBalance: currentBalance
        })

        await this.logService.addLog(`Transaksi POS : ${name}`, admin)
      }

      await this._pool.query('COMMIT') // TRANSACTION
      return res.status(201).json({
        status: 'success',
        message: 'Barang berhasil dibeli'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getGoodsSales(req, res) {
    const { limit } = req.query
    try {
      const response = await this.service.getGoodsSales(limit)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: ' fail',
        message: error.message
      })
    }
  }

  async getGoodsSalesByBooking(req, res) {
    const { bookingId } = req.params

    try {
      const response = await this.service.getGoodsSalesByBooking(bookingId)

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

  async removeGoodsSales(req, res) {
    const { salesId } = req.params
    const { id: admin } = req.session.user

    try {
      const { booking, goods } = await this.service.removeGoodsSales(salesId)
      const { name } = await this.goodsService.getGoodsById(goods)
      await this.logService.addLog(`Penghapusan barang : ${name} / BookingID : ${booking}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Pembelian barang berhasil dihapus'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = GoodSalesController
