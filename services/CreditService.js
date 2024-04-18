const { pool } = require('../db/pool')
const { automaticInvoiceNumber } = require('../globals/invoicegenerator')
const idgenerator = require('../globals/idgenerator')

class CreditService {
  constructor() {
    this._pool = pool
  }

  async addCredit(payload) {
    const { creditor, detail, due, admin } = payload
    const id = await automaticInvoiceNumber()

    try {
      const query = {
        text: `
            INSERT INTO 
                credits
                (id, creditor, detail, due, created_by, updated_by)
            VALUES
                ($1, $2, $3, $4, $5, $5) 
            `,
        values: [id, creditor, detail, due, admin]
      }

      await this._pool.query(query)
      return id
    } catch (error) {
      throw new Error(`Add credit : ${error.message}`)
    }
  }

  async updateCredit(creditId, payload) {
    const { creditor, detail, due, admin } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
            UPDATE
                credits
            SET
                creditor = $1,
                detail = $2,
                due = $3,
                updated_by = $4,
                updated_at = $5
            WHERE
                id = $6
            `,
        values: [creditor, detail, due, admin, currentTime, creditId]
      }
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put credit : ${error.message}`)
    }
  }

  async getCredits(search = '', limit = 20, startDate, endDate) {
    const query = {
      text: `
        SELECT
            c.id, g.name, c.due, c.created_at AS "createdAt"
        FROM
            credits c
        JOIN
            guests g
        ON
            c.creditor = g.id
        WHERE
            (c.id ILIKE $1 OR g.name ILIKE $1)
        `,
      values: [`%${search}%`, limit]
    }

    if (startDate && endDate) {
      query.values.push(startDate, endDate)
      query.text += ' AND (c.due >= $3 AND c.due <= $4)'
    }

    query.text += ' LIMIT $2'

    const { rows } = await this._pool.query(query)

    return rows
  }

  async getCreditById(creditId) {
    try {
      const query = {
        text: `
            SELECT 
                c.id, g.name, c.detail, c.due, c.created_at AS "createdAt"
            FROM
                credits c
            JOIN
                guests g
            ON
                c.creditor = g.id
            WHERE
                c.id = $1
            `,
        values: [creditId]
      }

      const { rows } = await this._pool.query(query)

      const transactions = await this.getTransactionsByCreditId(creditId)

      const mappedDetail = {
        id: rows[0].id,
        guest: rows[0].name,
        due: rows[0].due,
        createdAt: rows[0].createdAt,
        transactions
      }

      return mappedDetail
    } catch (error) {
      throw new Error(`Get credit by id : ${error.message}`)
    }
  }

  async getTransactionsByCreditId(creditId) {
    try {
      const query = {
        text: `
            SELECT
                ct.settled_transaction AS "settledTransaction",
                ct.amount,
                ct.paid,
                st.id,
                g.name,
                rc.category
            FROM
                credit_transactions ct
            JOIN
                settled_transactions st
            ON
                ct.settled_transaction = st.id
            JOIN
                bookings b
            ON
                st.booking = b.id
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
            WHERE
                ct.credit = $1
            `,
        values: [creditId]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get transaction by credit : ${error.message}`)
    }
  }

  // CREDIT_TRANSACTIONS CONJUNCTION
  async addCreditTransaction(payload) {
    const { creditId, settledInvoice, creditTotal, creditPaid, admin } = payload
    const id = `${idgenerator(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')}-${Date.now()}`
    try {
      const query = {
        text: `
        INSERT INTO
          credit_transactions
          (id, credit, settled_transaction, amount, paid, created_by, updated_by)
        VALUES
          ($1, $2, $3, $4, $5, $6, $6)
        `,
        values: [id, creditId, settledInvoice, creditTotal, creditPaid, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      console.log(error)
      throw new Error(`Add credit transaction : ${error.message}`)
    }
  }
}

module.exports = CreditService
