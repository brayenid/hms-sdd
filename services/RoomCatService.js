const generateId = require('../globals/idgenerator')
const { pool } = require('../db/pool')

class RoomCatService {
  constructor() {
    this._pool = pool
  }

  async addRoomCategory(payload) {
    const { category, price, creator, detail } = payload
    const id = `CAT-${generateId(12)}`
    const query = {
      text: `
      INSERT INTO rooms_cat (id, category, price, detail, created_by, updated_by) 
      VALUES($1, $2, $3, $4, $5, $5)`,
      values: [id, category, price, detail, creator]
    }
    try {
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add category : ${error.message}`)
    }
  }

  async putRoomCategory(payload) {
    const { id, category, price, updater, detail } = payload
    const currentTime = new Date()

    const query = {
      text: `
      UPDATE rooms_cat 
      SET category = $1, price = $2, updated_by = $3, detail = $4, updated_at = $5 
      WHERE id = $6`,
      values: [category, price, updater, detail, currentTime, id]
    }

    try {
      await this.getRoomById(id)
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put category : ${error.message}`)
    }
  }

  async deleteRoomCategory(id) {
    try {
      const query = {
        text: 'DELETE FROM rooms_cat WHERE id = $1',
        values: [id]
      }
      await this.getRoomById(id)
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Delete category : ${error.message}`)
    }
  }

  async getCategories(search = '') {
    const query = {
      text: 'SELECT id, category, price, detail FROM rooms_cat WHERE category ILIKE $1 ORDER BY PRICE ASC',
      values: [`%${search}%`]
    }

    try {
      const { rows, rowCount } = await this._pool.query(query)
      return {
        total: rowCount,
        categories: rows
      }
    } catch (error) {
      throw new Error(`Get categories : ${error.message}`)
    }
  }

  async getRoomById(id) {
    const query = {
      text: `
      SELECT 
        rooms_cat.*,
        accounts.name AS "updatedBy"
      FROM 
        rooms_cat
      JOIN
        accounts
      ON
        rooms_cat.updated_by = accounts.id
      WHERE 
        rooms_cat.id = $1
      `,
      values: [id]
    }
    try {
      const { rowCount, rows } = await this._pool.query(query)
      if (!rowCount) throw new Error('Kategori ini tidak tersedia')
      return rows[0]
    } catch (error) {
      console.error(error)
      throw new Error(error.message)
    }
  }
}

module.exports = RoomCatService
