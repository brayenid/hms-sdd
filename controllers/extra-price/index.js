const autoBind = require('auto-bind')
const ExtraPriceService = require('../../services/ExtraPriceService')
const LogService = require('../../services/LogService')

class ExtraPriceController {
  constructor() {
    this.service = new ExtraPriceService()
    this.logService = new LogService()

    autoBind(this)
  }

  async putExtraPrice(req, res) {
    const { person, bed, breakfast } = req.body
    const { id: admin } = req.session.user

    try {
      await this.service.putExtraPrice(person, bed, breakfast)
      await this.logService.addLog('Harga ekstra diperbaharui', admin)

      return res.status(200).json({
        status: 'success',
        message: 'Harga ekstra berhasil diperbaharui'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getExtraPrice(req, res) {
    try {
      const response = await this.service.getExtraPrice()

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

module.exports = ExtraPriceController
