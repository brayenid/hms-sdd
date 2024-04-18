const autoBind = require('auto-bind')
const RoomService = require('../../services/RoomService')
const LogService = require('../../services/LogService')

class RoomController {
  constructor() {
    this.service = new RoomService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addRoom(req, res) {
    const { id: adminId } = req.session.user
    const { number, category, smoking, bed } = req.body

    const payload = {
      number,
      smoking,
      bed,
      category,
      creator: adminId
    }

    try {
      await this.service.addRoom(payload)
      await this.logService.addLog(`Kamar baru ditambahkan : ${number}`, adminId)

      return res.status(201).json({
        status: 'success',
        message: 'Kamar berhasil ditambahkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async putRoom(req, res) {
    const { id: adminId } = req.session.user
    const { number, category, smoking, bed, available } = req.body
    const { roomId } = req.params

    const payload = {
      id: roomId,
      number,
      category,
      smoking,
      bed,
      updater: adminId,
      available
    }

    try {
      const { number } = await this.service.getRoomById(roomId)

      await this.service.putRoom(payload)
      await this.logService.addLog(`Kamar diperbaharui : ${number}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Kamar berhasil diubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeRoom(req, res) {
    const { roomId } = req.params
    const { id } = req.session.user

    try {
      const { number } = await this.service.getRoomById(roomId)
      await this.service.deleteRoom(roomId)
      await this.logService.addLog(`Kamar dihapus : ${number}`, id)

      return res.status(200).json({
        status: 'success',
        message: 'Kamar berhasil dihapus'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getRooms(req, res) {
    const { search, smoking, bed } = req.query

    try {
      const response = await this.service.getRooms(search, smoking, bed)
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

  async getRoomById(req, res) {
    const { roomId } = req.params
    try {
      const response = await this.service.getRoomById(roomId)
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

  async setRoomCleaniness(req, res) {
    const { cleaniness } = req.body
    const { roomId } = req.params
    const { id } = req.session.user

    try {
      const { number } = await this.service.getRoomById(roomId)

      await this.service.patchRoomCleaniness(roomId, cleaniness)
      await this.logService.addLog(`Kamar dibersihkan : ${number}`, id)

      return res.status(200).json({
        status: 'success',
        message: 'Kamar berhasil dibersihkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = RoomController
