const autoBind = require('auto-bind')
const HotelInfoService = require('../../services/HotelInfoService')

class HotelInfoController {
  constructor() {
    this.service = new HotelInfoService()

    autoBind(this)
  }

  async putHotelInfo(req, res) {
    try {
      await this.service.putHotelInfo(req.body)

      return res.status(200).json({
        status: 'success',
        message: 'Informasi hotel telah diperbaharui'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }
}

module.exports = HotelInfoController
