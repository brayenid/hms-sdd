const { pool } = require('../db/pool')

class BalanceLogService {
  constructor() {
    this._pool = pool
  }

  async addBalanceLog(payload) {
    const { amount, detail, admin, action, lastBalance } = payload

    try {
      const query = {
        text: `
        INSERT INTO
            balance_log (detail, amount, created_by, action, last_balance)
        VALUES
            ($1, $2, $3, $4, $5)    
        `,
        values: [detail, amount, admin, action, lastBalance]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add balance log : ${error.message}`)
    }
  }

  async getBalanceLogs(search = '', limit = 20, startDate, endDate, sort = 'DESC') {
    try {
      const query = {
        text: `
        SELECT
            b.detail,
            b.amount,
            b.action,
            b.last_balance AS "lastBalance",
            a.name AS "admin",
            b.created_at AS "createdAt"
        FROM
            balance_log b
        JOIN
            accounts a
        ON
            b.created_by = a.id
        WHERE
            detail ILIKE $1
        `,
        values: [`%${search}%`, limit]
      }

      if (startDate && endDate) {
        query.text += `
         AND
        b.created_at >= $3 AND b.created_at <= $4
        `

        query.values.push(startDate, endDate)
      }

      if (sort === 'ASC') {
        query.text += `
         ORDER BY 
          b.created_at
        ASC
        LIMIT $2
        `
      } else if (sort === 'DESC') {
        query.text += `
        ORDER BY 
         b.created_at
        DESC
        LIMIT $2
        `
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get balance logs : ${error.message}`)
    }
  }
}

module.exports = BalanceLogService
