const autoBind = require('auto-bind')
const RoomCatService = require('../../services/RoomCatService')
const LogService = require('../../services/LogService')

class RoomCatController {
  constructor() {
    this.service = new RoomCatService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addRoomCategory(req, res) {
    const { id: adminId } = req.session.user
    const { category, price, detail } = req.body

    const payload = {
      creator: adminId,
      category,
      detail,
      price
    }

    try {
      await this.service.addRoomCategory(payload)
      await this.logService.addLog(`Penambahan kategori baru : ${category}`, adminId)

      return res.status(201).json({
        status: 'success',
        message: 'Kategori kamar berhasil ditambahkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async putRoomCategory(req, res) {
    const { id: adminId } = req.session.user
    const { category, price, detail } = req.body
    const { catId: categoryId } = req.params

    const payload = {
      id: categoryId,
      updater: adminId,
      category,
      detail,
      price
    }

    try {
      await this.service.putRoomCategory(payload)
      await this.logService.addLog(`Perubahan kategori : ${category}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Kategori kamar berhasil diubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeRoomCategory(req, res) {
    const { id: adminId } = req.session.user
    const { catId } = req.params
    try {
      await this.service.deleteRoomCategory(catId)
      await this.logService.addLog(`Penghapusan kategori : ${catId}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Kategori kamar berhasil dihapus'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getCategories(req, res) {
    const { search } = req.query

    try {
      const response = await this.service.getCategories(search)
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

  async getCategoryById(req, res) {
    const { catId } = req.params
    try {
      const response = await this.service.getRoomById(catId)
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

module.exports = RoomCatController
