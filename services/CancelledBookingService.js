const { pool } = require('../db/pool')

class CancelledTransactionService {
  constructor() {
    this._pool = pool
  }

  async addCancelled(payload) {
    const { bookedBy, startDate, endDate, room, paid, admin, deposit } = payload
    try {
      const query = {
        text: `
        INSERT INTO
            cancelled_books (booked_by, start_date, end_date, room, paid, created_by, deposit)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        `,
        values: [bookedBy, startDate, endDate, room, paid, admin, deposit]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add cancelled : ${error.message}`)
    }
  }

  async getCancelled(search = '', limit = 20, startDate, endDate, sort = 'DESC') {
    try {
      const query = {
        text: `
        SELECT
            c.booked_by AS "bookedBy",
            c.start_date AS "startDate",
            c.end_date AS "endDate",
            r.number AS "roomNumber",
            c.paid,
            c.deposit,
            a.name AS "adminName",
            c.created_at AS "cancelDate"
        FROM
            cancelled_books c
        JOIN
            rooms r
        ON
            c.room = r.id
        JOIN
            accounts a
        ON
            c.created_by = a.id
        WHERE
            c.booked_by ILIKE $1
        `,
        values: [`%${search}%`, limit]
      }

      if (startDate && endDate) {
        query.text += `
         AND c.created_at >= $3 AND c.created_at <= $4
        `
        query.values.push(startDate, endDate)
      }

      if (sort === 'ASC') {
        query.text += `
         ORDER BY 
          c.created_at
        ASC
        LIMIT $2
        `
      } else if (sort === 'DESC') {
        query.text += `
        ORDER BY 
         c.created_at
        DESC
        LIMIT $2
        `
      }

      const { rows } = await this._pool.query(query)
      return rows
    } catch (error) {
      throw new Error(`Get cancelled : ${error.message}`)
    }
  }
}

module.exports = CancelledTransactionService
