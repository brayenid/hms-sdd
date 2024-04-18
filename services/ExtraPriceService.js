const { pool } = require('../db/pool')

class ExtraPriceService {
  constructor() {
    this._pool = pool
  }

  async putExtraPrice(person, bed, breakfast) {
    try {
      const extraArr = ['person', 'bed', 'breakfast']

      extraArr.forEach(async (extra, i) => {
        const query = {
          text: 'UPDATE extra_price SET price = $1 WHERE extra = $2',
          values: [arguments[i], extra]
        }
        await this._pool.query(query)
      })
    } catch (error) {
      throw new Error(`Put extra price : ${error.message}`)
    }
  }

  async getExtraPrice() {
    try {
      const { rows } = await this._pool.query('SELECT * FROM extra_price ORDER BY id ASC')

      return rows
    } catch (error) {
      throw new Error(`Get all extra : ${error.message}`)
    }
  }
}

module.exports = ExtraPriceService
