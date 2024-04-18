const { pool } = require('../db/pool')

class DepositService {
  constructor() {
    this._pool = pool
  }

  async putDeposit(price) {
    const currentTime = new Date()
    try {
      const query = {
        text: "UPDATE deposit SET price = $1, updated_at = $2 WHERE name = 'deposit'",
        values: [price, currentTime]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put deposit price : ${error.message}`)
    }
  }

  async getDeposit() {
    try {
      const { rows } = await this._pool.query('SELECT price FROM deposit LIMIT 1')

      return rows[0].price
    } catch (error) {
      throw new Error(`Get deposit : ${error.message}`)
    }
  }
}

module.exports = DepositService
