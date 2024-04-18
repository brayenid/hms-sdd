const { pool } = require('../db/pool')

class SupplyService {
  constructor() {
    this._pool = pool
  }

  async addNewSupply(payload) {
    const { goods, quantity, price, supplier, admin, lastBalance } = payload

    try {
      const query = {
        text: `
            INSERT INTO
              goods_supply (goods, quantity, price, supplier, created_by, updated_by, last_balance)
            VALUES
              ($1, $2, $3, $4, $5, $5, $6)
            `,
        values: [goods, quantity, price, supplier, admin, lastBalance]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add new supply : ${error.message}`)
    }
  }

  async getSupplies(search = '', limit = 50, startDate, endDate, sort = 'DESC') {
    try {
      const query = {
        text: `
            SELECT
              s.id,
              g.name,
              s.quantity,
              s.price,
              s.supplier,
              s.last_balance AS "lastBalance",
              a.name AS "admin",
              s.created_at AS "settledDate"
            FROM
              goods_supply s
            JOIN
              goods g
            ON
              s.goods = g.id
            JOIN
              accounts a
            ON
              s.created_by = a.id
            WHERE
              (g.name ILIKE $1 OR s.supplier ILIKE $1)
           
            `,
        values: [`%${search}%`, limit]
      }

      if (startDate && endDate) {
        query.text += `
         AND s.created_at >= $3 AND s.created_at <= $4
        `
        query.values.push(startDate, endDate)
      }

      if (sort === 'ASC') {
        query.text += `
         ORDER BY 
          s.created_at
        ASC
        LIMIT $2
        `
      } else if (sort === 'DESC') {
        query.text += `
        ORDER BY 
         s.created_at
        DESC
        LIMIT $2
        `
      }
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get all supplies : ${error.message}`)
    }
  }

  async getSupplyById(id) {
    try {
      const query = {
        text: `
        SELECT
          id,
          goods,
          quantity,
          price,
          supplier,
          created_at AS "createdAt"
        FROM
          goods_supply
        WHERE
          id = $1
        `,
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Get supply by id : ${error.message}`)
    }
  }

  async deleteSupply(id) {
    try {
      const query = {
        text: `
        DELETE FROM
          goods_supply
        WHERE
          id = $1
        RETURNING
          goods,
          quantity
        `,
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Remove supply : ${error.message}`)
    }
  }
}

module.exports = SupplyService
