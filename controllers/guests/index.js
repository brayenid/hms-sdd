const autoBind = require('auto-bind')
const GuestService = require('../../services/GuestService')
const LogService = require('../../services/LogService')

class GuestController {
  constructor() {
    this.service = new GuestService()
    this.logService = new LogService()

    autoBind(this)
  }

  async addGuest(req, res) {
    const { id: adminId } = req.session.user
    const { idType, idNumber, name, gender, address, city, nationality, phone } = req.body
    const payload = {
      idType,
      idNumber,
      name,
      gender,
      address,
      city,
      nationality,
      admin: adminId,
      phone
    }
    try {
      await this.service.addGuest(payload)
      this.logService.addLog(`Penambahan tamu : ${name}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Tamu berhasil ditambahkan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async updateGuest(req, res) {
    const { guestId } = req.params
    const { idType, idNumber, name, gender, address, city, nationality, phone } = req.body
    const { id: adminId } = req.session.user

    if (!guestId || !idType || !idNumber || !name || !gender || !address || !city || !nationality) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Semua parameter (guestId, idType, idNumber, name, gender, address, city, nationality) harus disediakan.'
      })
    }

    try {
      await this.service.updateGuest({
        id: guestId,
        idType,
        idNumber,
        name,
        gender,
        address,
        city,
        nationality,
        admin: adminId,
        phone
      })

      this.logService.addLog(`Perubahan data tamu : ${name}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Tamu berhasil diperbaharui.'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getGuests(req, res) {
    const { search, length, limit } = req.query
    try {
      const response = await this.service.getGuests(search, length, limit)

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

  async removeGuest(req, res) {
    const { guestId } = req.params
    const { id: adminId } = req.session.user

    try {
      await this.service.deleteGuestById(guestId)
      this.logService.addLog(`Penghapusan tamu : ${guestId}`, adminId)

      return res.status(200).json({
        status: 'success',
        message: 'Tamu telah dihapus'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = GuestController
