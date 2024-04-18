const { nanoid } = require('nanoid')
const { pool } = require('../db/pool')

class GoodsSalesService {
  constructor() {
    this._pool = pool
  }

  async addGoodsSales(payload) {
    const { booking, goods, quantity, admin } = payload
    const id = nanoid(32)

    try {
      const query = {
        text: `
        INSERT INTO goods_sales (id, booking, goods, quantity, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $5)
        `,
        values: [id, booking, goods, quantity, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add goods sales : ${error.message}`)
    }
  }

  async getGoodsSales(limit = 20, search = '', startDate, endDate, sort = 'DESC') {
    try {
      const query = {
        text: `
        SELECT 
          goods.name,
          goods_sales.quantity * goods.price AS "totalSales",
          goods_sales.*,
          accounts.name AS "adminName"
        FROM 
          goods_sales
        JOIN 
          goods
        ON
          goods_sales.goods = goods.id
        JOIN
          accounts
        ON
          goods_sales.created_by = accounts.id
        WHERE
          goods.name ILIKE $2
        `,
        values: [limit, `%${search}%`]
      }

      if (startDate && endDate) {
        query.text += `
         AND goods_sales.created_at >= $3 AND goods_sales.created_at <= $4
        `
        query.values.push(startDate, endDate)
      }

      if (sort === 'ASC') {
        query.text += `
         ORDER BY 
          goods_sales.created_at
        ASC
        LIMIT $1
        `
      } else if (sort === 'DESC') {
        query.text += `
        ORDER BY 
         goods_sales.created_at
        DESC
        LIMIT $1
        `
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get goods sales : ${error.message}`)
    }
  }

  async getGoodsSalesByBooking(bookingId) {
    try {
      const query = {
        text: `
        SELECT 
          goods_sales.id, 
          goods.name, 
          goods.price, 
          goods_sales.quantity, 
          goods_sales.quantity * goods.price AS "total"
        FROM 
          goods_sales
        JOIN 
          goods
        ON 
          goods_sales.goods = goods.id
        WHERE booking = $1
        `,
        values: [bookingId]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get goods sales : ${error.message}`)
    }
  }

  async removeGoodsSales(id) {
    const query = {
      text: `
      DELETE FROM goods_sales WHERE id = $1 RETURNING booking, goods
      `,
      values: [id]
    }

    try {
      const { rows } = await this._pool.query(query)
      return rows[0]
    } catch (error) {
      throw new Error(`Remove goods sales : ${error.message}`)
    }
  }
}

module.exports = GoodsSalesService
