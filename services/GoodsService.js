const generateId = require('../globals/idgenerator')
const { pool } = require('../db/pool')

class GoodsService {
  constructor() {
    this._pool = pool
  }

  async addGoods(payload) {
    const id = `GOODS-${generateId(15, '1234567890')}`
    const { name, price, admin } = payload

    try {
      const query = {
        text: `
          INSERT INTO goods (id, name, price, created_by, updated_by) 
          VALUES ($1, $2, $3, $4, $4)
        `,
        values: [id, name, price, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add goods: ${error.message}`)
    }
  }

  async updateGoods(payload) {
    const { id, name, price, admin } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
        UPDATE goods
        SET name = $1, price = $2, updated_by = $3, updated_at = $4
        WHERE id = $5
        RETURNING (
            SELECT name FROM goods WHERE id = $5
        ) AS "oldName",
        (
            SELECT price FROM goods WHERE id = $5
        ) AS "oldPrice",
        (
            SELECT stock FROM goods WHERE id = $5
        ) AS "oldStock"`,
        values: [name, price, admin, currentTime, id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Update goods: ${error.message}`)
    }
  }

  async goodsOperation(payload, type) {
    try {
      const typeArgs = ['min', 'add']

      if (!type) throw new Error('MISSING_TYPE')
      if (!typeArgs.includes(type)) throw new Error('TYPE_MUST_BE_MIN_OR_ADD')

      const { goods, quantity } = payload

      if (type === 'min') {
        const query = {
          text: `
            UPDATE goods
            SET stock = stock - $1
            WHERE id = $2
            `,
          values: [quantity, goods]
        }

        await this._pool.query(query)
      } else if (type === 'add') {
        const query = {
          text: `
              UPDATE goods
              SET stock = stock + $1
              WHERE id = $2
              `,
          values: [quantity, goods]
        }

        await this._pool.query(query)
      }
    } catch (error) {
      throw new Error(`Goods operation : ${error.message}`)
    }
  }

  async getGoods(search = '', limit = 25, stock) {
    try {
      const query = {
        text: `
        SELECT id, name, price, stock 
        FROM goods
        WHERE (name ILIKE $1 OR id ILIKE $1)
        `,
        values: [`%${search}%`, limit]
      }

      if (stock > 0) {
        query.text += `
         AND stock <= $3
        `
        query.values.push(stock)
      }
      query.text += ' ORDER BY name LIMIT $2'
      const { rows } = await this._pool.query(query)
      return rows
    } catch (error) {
      throw new Error(`Get goods : ${error.message}`)
    }
  }

  async getGoodsById(id) {
    try {
      const query = {
        text: `
        SELECT 
          g.id, 
          g.name, 
          g.price, 
          g.stock, 
          g.updated_at AS "updatedAt", 
          a.name AS "updatedBy" 
        FROM 
          goods g
        JOIN
          accounts a
        ON
          g.updated_by = a.id
        WHERE 
          g.id = $1 
        LIMIT 1
        `,
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Get goods by id: ${error.message}`)
    }
  }

  async removeGoods(id) {
    try {
      const query = {
        text: 'DELETE FROM goods WHERE id = $1 RETURNING name',
        values: [id]
      }
      const { rows } = await this._pool.query(query)
      return rows[0].name
    } catch (error) {
      throw new Error(`Remove goods: ${error.message}`)
    }
  }

  async getGoodsFreq() {
    try {
      const { rowCount } = await this._pool.query('SELECT id FROM goods')

      return rowCount
    } catch (error) {
      throw new Error(`Get goods freq : ${error.message}`)
    }
  }

  async getGoodsUnderStock(stock = 10) {
    try {
      const query = {
        text: `
        SELECT id
        FROM goods
        WHERE stock <= $1
        `,
        values: [stock]
      }

      const { rowCount } = await this._pool.query(query)

      return rowCount
    } catch (error) {
      throw new Error(`Get goods under stock : ${error.message}`)
    }
  }
}

module.exports = GoodsService
