const autoBind = require('auto-bind')
const FinesService = require('../../services/FinesService')
const LogService = require('../../services/LogService')

class FinesController {
  constructor() {
    this.service = new FinesService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addFine(req, res) {
    const { fine, price } = req.body
    const { id: admin } = req.session.user

    if (!fine || !price) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua parameter (fine, price, admin) harus disediakan.'
      })
    }

    try {
      await this.service.addFine({ fine, price, admin })
      await this.logService.addLog(`Tambah denda baru : ${fine}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Denda berhasil ditambahkan.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async putFine(req, res) {
    const { id } = req.params
    const { fine, price } = req.body
    const { id: admin } = req.session.user

    if (!id || !fine || !price) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua parameter (id, fine, price) harus disediakan.'
      })
    }

    try {
      await this.service.putFine({ id, fine, price, admin })
      await this.logService.addLog(`Denda diperbaharui : ${fine}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Denda berhasil diperbaharui.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getFines(req, res) {
    try {
      const fines = await this.service.getFines()

      return res.status(200).json({
        status: 'success',
        data: fines
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getFineById(req, res) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parameter id harus disediakan.'
      })
    }

    try {
      const fine = await this.service.getFineById(id)

      return res.status(200).json({
        status: 'success',
        data: fine
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeFine(req, res) {
    const { id } = req.params
    const { id: admin } = req.session.user

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parameter id harus disediakan.'
      })
    }

    try {
      await this.service.removeFine(id)
      await this.logService.addLog(`Denda dihapus : ${id}`, admin)

      return res.status(200).json({
        status: 'success',
        message: 'Denda berhasil dihapus.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = FinesController
