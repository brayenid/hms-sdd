const { pool } = require('../db/pool')

class HotelInfoService {
  constructor() {
    this._pool = pool
  }

  async getHotelInfo() {
    try {
      const { rows } = await this._pool.query('SELECT * FROM hotel_info LIMIT 1')

      return rows[0]
    } catch (error) {
      throw new Error(`Get hotel info : ${error.message}`)
    }
  }

  async putHotelInfo(payload) {
    const { name, nickname, address, city, zip, phone } = payload

    try {
      const query = {
        text: `
        UPDATE hotel_info
        SET name = $1, nickname = $2, address = $3, city = $4, zip = $5, phone = $6
        WHERE id = 'hotel-info'
        `,
        values: [name, nickname, address, city, zip, phone]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put hotel info : ${error.message}`)
    }
  }
}

module.exports = HotelInfoService
