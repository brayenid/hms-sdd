const { pool } = require('../db/pool')

class LogisticBalanceService {
  constructor() {
    this._pool = pool
  }

  async balanceOperation(amount, type) {
    try {
      const typeArgs = ['min', 'add']
      const currentTime = new Date()

      if (!type) throw new Error('MISSING_TYPE')
      if (!typeArgs.includes(type)) throw new Error('TYPE_MUST_BE_MIN_OR_ADD')

      if (type === 'add') {
        const query = {
          text: `
        UPDATE
          logistic_balance
        SET
          balance = balance + $1,
          created_at = $2
        WHERE
          id = 'balance'
        `,
          values: [amount, currentTime]
        }

        await this._pool.query(query)
      } else if (type === 'min') {
        const query = {
          text: `
        UPDATE
          logistic_balance
        SET
          balance = balance - $1,
          created_at = $2
        WHERE
          id = 'balance'
        `,
          values: [amount, currentTime]
        }

        await this._pool.query(query)
      }
    } catch (error) {
      throw new Error(`Add balance : ${error.message}`)
    }
  }

  async getBalance() {
    try {
      const { rows } = await this._pool.query(`
      SELECT
        balance
      FROM
        logistic_balance
      WHERE
        id = 'balance'
      `)

      return rows[0].balance
    } catch (error) {
      throw new Error(`Get balance : ${error.message}`)
    }
  }
}

module.exports = LogisticBalanceService
