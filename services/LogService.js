const { pool } = require('../db/pool')

class LogService {
  constructor() {
    this._pool = pool
  }

  async addLog(cases, admin) {
    if (!cases) throw new Error('MISSED_CASES')
    if (!admin) throw new Error('MISSED_ADMIN')

    try {
      const query = {
        text: `
        INSERT INTO logs (cases, created_by)
        VALUES ($1, $2)`,
        values: [cases, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      console.log(error.message)
      throw new Error(`Add log : ${error.message}`)
    }
  }

  async getLogs(limit = 20) {
    try {
      const query = {
        text: `
        SELECT 
          logs.cases, 
          accounts.name AS "createdBy", 
          logs.created_at AS "createdAt"
        FROM 
          logs
        JOIN
          accounts
        ON
          logs.created_by = accounts.id
        ORDER BY
          logs.created_at DESC
        LIMIT $1
        `,
        values: [limit]
      }
      const { rows } = await this._pool.query(query)
      return rows
    } catch (error) {
      throw new Error(`Get logs : ${error.message}`)
    }
  }

  async removeAllLogs() {
    try {
      await this._pool.query('DELETE FROM logs WHERE 1 = 1')
    } catch (error) {
      throw new Error(`Remove all logs : ${error.message}`)
    }
  }
}

module.exports = LogService
