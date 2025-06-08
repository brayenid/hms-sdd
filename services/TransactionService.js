const { automaticInvoiceNumber } = require('../globals/invoicegenerator')
const { pool } = require('../db/pool')

class TransactionService {
  constructor() {
    this._pool = pool
  }

  async addTransaction(payload) {
    const { bookingId, totalRoom, totalExtra, totalFines, totalSales, discount, admin } = payload
    const invoiceNumber = await automaticInvoiceNumber()

    try {
      const query = {
        text: `
        INSERT INTO 
        settled_transactions (id, booking, total_room, total_extra, total_fines, total_sales, created_by, updated_by, discount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
        `,
        values: [invoiceNumber, bookingId, totalRoom, totalExtra, totalFines, totalSales, admin, discount]
      }

      await this._pool.query(query)
      return invoiceNumber
    } catch (error) {
      throw new Error(`Add transaction : ${error.message}`)
    }
  }

  async removeTransactionById(id) {
    try {
      const query = {
        text: `
        DELETE FROM
          settled_transactions
        WHERE
          id = $1
        `,
        values: [id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Remove transaction : ${error.message}`)
    }
  }

  async getTransactions(limit = 50, search = '', startDate, endDate) {
    try {
      const query = {
        text: `
        SELECT
          t.id,
          COALESCE(g.name, 'Nama Kosong') AS name,
          g.phone,
          b.booked_by AS "bookedBy",
          b.start_date AS "startDate",
          b.end_date AS "endDate",
          t.total_room + t.total_extra + t.total_fines + t.total_sales - t.discount AS "grandTotal",
          t.created_at AS "settledDate"
        FROM 
          settled_transactions t
        JOIN 
          bookings b
        ON 
          t.booking = b.id
        LEFT JOIN 
          guests g
        ON 
          b.guest = g.id
        WHERE
          (t.id ILIKE $1 OR g.name ILIKE $1 OR b.id ILIKE $1 OR b.booked_by ILIKE $1)
        `,
        values: [`%${search}%`, limit]
      }

      if (startDate && endDate) {
        query.text += 'AND b.start_date >= $3 AND b.end_date <= $4'
        query.values.push(startDate, endDate)
      }

      query.text += ' ORDER BY t.created_at DESC LIMIT $2'

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get transactions : ${error.message}`)
    }
  }

  async getTransactionById(id) {
    try {
      const query = {
        text: `
        SELECT
          t.id,
          g.name,
          g.phone,
          g.address,
          g.city,
          b.id AS "bookingId",
          b.booked_by AS "bookedBy",
          b.start_date AS "startDate",
          b.end_date AS "endDate",
          b.source,
          t.total_fines AS "totalFines",
          t.total_room AS "totalRoom",
          t.total_extra AS "totalExtra",
          t.total_sales AS "totalSales",
          t.discount,
          b.paid,
          r.number,
          r.bed,
          r.smoking,
          rc.category,
          rc.price AS "roomPrice",
          b.created_at AS "bookedAt",
          t.created_at AS "settledDate",
          a.name AS "adminName"
        FROM 
          settled_transactions t
        JOIN 
          bookings b
        ON 
          t.booking = b.id
        JOIN 
          guests g
        ON 
          b.guest = g.id
        JOIN
          rooms r
        ON
          b.room = r.id
        JOIN
          rooms_cat rc
        ON
          r.category = rc.id
        JOIN
          accounts a
        ON
          t.created_by = a.id
        WHERE
          t.id = $1
        LIMIT 1
        `,
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Get transaction by id : ${error.message}`)
    }
  }

  async getTransactionsFreq(limit = 12) {
    try {
      const query = {
        text: `
        SELECT
          TO_CHAR(created_at, 'mm') AS "month",
          COUNT(*) AS "transaction_freq"
        FROM
          settled_transactions
        WHERE
          EXTRACT(year FROM created_at) = EXTRACT(year FROM CURRENT_DATE)
        GROUP BY
          month
        ORDER BY
          month
        LIMIT $1
        `,
        values: [limit]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get transaction freq : ${error.message}`)
    }
  }

  async getTransactionsTotal(limit = 12) {
    try {
      const query = {
        text: `
        SELECT
        TO_CHAR(created_at, 'mm') AS "month",
        SUM(s.total_room + s.total_extra + s.total_fines + s.total_sales - s.discount) AS "transactionTotal"
        FROM
          settled_transactions s
        WHERE
          EXTRACT(year FROM created_at) = EXTRACT(year FROM CURRENT_DATE)
        GROUP BY
          month
        ORDER BY
          month
        LIMIT $1;
        `,
        values: [limit]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get transaction freq : ${error.message}`)
    }
  }

  async transactionsReport(limit = 50, search = '', startDate, endDate, sort = 'DESC') {
    try {
      const query = {
        text: `
          SELECT
            t.id,
            r.number,
            b.start_date AS "startDate",
            b.end_date AS "endDate",
            b.source,
            t.total_room AS "totalRoom",
            t.total_extra AS "totalExtra",
            t.total_fines AS "totalFines",
            t.total_sales AS "totalSales",
            t.discount,
            t.total_room + t.total_extra + t.total_fines + t.total_sales - t.discount AS "grandTotal",
            (COALESCE(ct.amount, 0) - COALESCE(ct.paid, 0)) AS "totalCredit",
            t.created_at AS "settledDate",
            a.name AS "admin"
          FROM 
            settled_transactions t
          JOIN 
            bookings b
          ON 
            t.booking = b.id
          JOIN
            rooms r
          ON 
            b.room = r.id
          JOIN 
            accounts a
          ON
            t.created_by = a.id
          LEFT JOIN
            credit_transactions ct
          ON
            t.id = ct.settled_transaction
          WHERE
            (t.id ILIKE $1 OR b.id ILIKE $1)
          `,
        values: [`%${search}%`, limit]
      }

      if (startDate && endDate) {
        query.text += 'AND t.created_at >= $3 AND t.created_at <= $4'
        query.values.push(startDate, endDate)
      }

      if (sort === 'ASC') {
        query.text += `
         ORDER BY 
          t.created_at
        ASC
        LIMIT $2
        `
      } else if (sort === 'DESC') {
        query.text += `
        ORDER BY 
         t.created_at
        DESC
        LIMIT $2
        `
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get transactions report : ${error.message}`)
    }
  }

  async _getLatestInvoice() {
    try {
      const { rows, rowCount } = await this._pool.query(`
      SELECT id FROM settled_transactions ORDER BY id DESC LIMIT 1
      `)
      if (!rowCount) {
        return 'INV-SDD-0000000'
      }
      return rows[0].id
    } catch (error) {
      throw new Error(`Get latest invoice : ${error.message}`)
    }
  }
}

module.exports = TransactionService
