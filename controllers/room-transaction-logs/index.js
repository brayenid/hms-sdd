const autoBind = require('auto-bind')
const RoomTransactionLogsService = require('../../services/RoomTransactionLogs')

class RoomTransactionLogsController {
  constructor() {
    this.service = new RoomTransactionLogsService()

    autoBind(this)
  }

  async addRoomTransactionLogs(req, res) {
    const { booking, paid } = req.body

    try {
      await this.service.addRoomTransactionLogs({ booking, paid })

      return res.status(201).json({
        status: 'success',
        message: 'Data transaksi kamar berhasil dimasukan'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getRoomTransactionLogs(req, res) {
    const { start, end, limit } = req.query

    try {
      const response = await this.service.getRoomTransactionsLogs(start, end, limit)

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

module.exports = RoomTransactionLogsController
