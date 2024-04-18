const autoBind = require('auto-bind')
const SupplyService = require('../../services/SupplyService')
const LogService = require('../../services/LogService')
const GoodsService = require('../../services/GoodsService')
const { minuteDifference } = require('../../globals/helper')
const LogisticBalanceService = require('../../services/LogisticBalanceService')
const BalanceLogService = require('../../services/BalanceLogService')
const { pool } = require('../../db/pool')

class SupplyController {
  constructor() {
    this._pool = pool

    this.service = new SupplyService()
    this.logService = new LogService()
    this.goodsService = new GoodsService()
    this.balanceService = new LogisticBalanceService()
    this.balanceLogService = new BalanceLogService()

    autoBind(this)
  }

  async addSupply(req, res) {
    const { goods, quantity, price, supplier } = req.body
    const { id: admin } = req.session.user

    try {
      const balance = await this.balanceService.getBalance()
      if (balance < price) {
        throw new Error('Saldo logistik tidak cukup')
      }
      const lastBalance = balance - price

      await this._pool.query('BEGIN') // TRANSACTION
      await this.service.addNewSupply({ goods, quantity, price, supplier, admin, lastBalance })

      // BALANCE
      const { name: goodsName } = await this.goodsService.getGoodsById(goods)
      await this.balanceService.balanceOperation(price, 'min')
      await this.balanceLogService.addBalanceLog({
        amount: price,
        action: 'min',
        detail: `Pembelian : ${goodsName}`,
        admin,
        lastBalance
      })

      // GOODS STOCK
      await this.goodsService.goodsOperation({ goods, quantity }, 'add')
      const { name } = await this.goodsService.getGoodsById(goods)

      await this.logService.addLog(`Suplai barang masuk : ${name} / ${quantity}`, admin)

      if (quantity < 0) {
        await this._pool.query('COMMIT') // TRANSACTION
        return res.status(201).json({
          status: 'success',
          message: 'Stok diperbaharui. Kuantitas minus akan mengurangi stok saat ini'
        })
      }

      await this._pool.query('COMMIT') // TRANSACTION
      return res.status(201).json({
        status: 'success',
        message: 'Barang berhasil masuk'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeSupply(req, res) {
    const { id } = req.params
    const { id: admin, role } = req.session.user

    try {
      const { createdAt, quantity, price } = await this.service.getSupplyById(id)
      if (minuteDifference(createdAt, 120) && role !== 'sudo') {
        throw new Error(
          'Data suplai barang yang telah dibuat lebih dari 120 menit yang lalu tidak dapat dihapus. Hubungi Super Admin.'
        )
      }

      const { goods } = await this.service.deleteSupply(id)
      const { name: goodsName } = await this.goodsService.getGoodsById(goods)
      await this.goodsService.goodsOperation({ goods, quantity }, 'min')
      if (!minuteDifference(createdAt, 120)) {
        await this.balanceService.balanceOperation(price, 'add')

        const currentBalance = await this.balanceService.getBalance()
        await this.balanceLogService.addBalanceLog({
          amount: price,
          action: 'add',
          detail: `Suplai barang dihapus, saldo dikembalikan : ${goodsName}`,
          admin,
          lastBalance: currentBalance
        })
      }
      await this.logService.addLog(`Suplai barang dihapus : ${goodsName} / ${quantity}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Data suplai barang berhasil dihapus, dan stok barang berhasil dikurangi'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = SupplyController
