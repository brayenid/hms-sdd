const { pool } = require('../db/pool')

class RoomTransactionLogsService {
  constructor() {
    this._pool = pool
  }

  async addRoomTransactionLogs(payload) {
    const { booking, paid } = payload

    try {
      const query = {
        text: `
        INSERT INTO
            room_transaction_logs (booking, paid)
        VALUES
            ($1, $2)
        `,
        values: [booking, paid]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add room transaction logs : ${error.message}`)
    }
  }

  async getRoomTransactionsLogs(startDate, endDate, limit = 50) {
    try {
      const query = {
        text: `
        SELECT
            rtl.booking,
            rtl.paid,
            rtl.created_at AS date
        FROM
            room_transaction_logs rtl
        `,
        values: [limit]
      }

      if (startDate && endDate) {
        query.text += ` 
        WHERE
            rtl.created_at >= $2 AND rtl.created_at <= $3
        `
        query.values.push(startDate, endDate)
      }

      query.text += ' ORDER BY rtl.created_at ASC LIMIT $1'

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get room transactions logs : ${error.message}`)
    }
  }

  async removeRoomTransactionLogs(bookId) {
    try {
      const query = {
        text: `
        DELETE FROM
          room_transaction_logs
        WHERE
          booking = $1
        `,
        values: [bookId]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Remove room transactions logs : ${error.message}`)
    }
  }
}

module.exports = RoomTransactionLogsService
