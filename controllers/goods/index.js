const autoBind = require('auto-bind')
const GoodsService = require('../../services/GoodsService')
const LogService = require('../../services/LogService')

class GoodsController {
  constructor() {
    this.service = new GoodsService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addGoods(req, res) {
    const { name, price } = req.body
    const { id: admin } = req.session.user

    if (!name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua parameter (name) harus disediakan.'
      })
    }

    try {
      await this.service.addGoods({ name, price, admin })
      await this.logService.addLog(`Barang baru : ${name} / ${price}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Barang berhasil ditambahkan.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async putGoods(req, res) {
    const { id } = req.params
    const { name, price, stock } = req.body
    const { id: admin } = req.session.user

    if (!id || !name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua parameter (id, name, price, stock) harus disediakan.'
      })
    }

    try {
      const { oldName, oldPrice, oldStock } = await this.service.updateGoods({ id, name, price, stock, admin })

      await this.logService.addLog(
        `Ubah detail barang : ${oldName} > ${name} / ${oldPrice} > ${price} / ${oldStock} > ${stock}`,
        admin
      )

      return res.status(200).json({
        status: 'success',
        message: 'Barang berhasil diperbaharui.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getGoodsList(req, res) {
    const { limit, search } = req.query
    try {
      const goodsList = await this.service.getGoods(search, limit)

      return res.status(200).json({
        status: 'success',
        data: goodsList
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getGoodsById(req, res) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parameter id harus disediakan.'
      })
    }

    try {
      const goods = await this.service.getGoodsById(id)

      return res.status(200).json({
        status: 'success',
        data: goods
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeGoods(req, res) {
    const { id } = req.params
    const { id: admin } = req.session.user

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parameter id harus disediakan.'
      })
    }

    try {
      const goodsName = await this.service.removeGoods(id)
      await this.logService.addLog(`Penghapusan barang : ${goodsName}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Barang berhasil dihapus.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = GoodsController
