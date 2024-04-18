const { nanoid } = require('nanoid')
const { pool } = require('../db/pool')

class FinesService {
  constructor() {
    this._pool = pool
  }

  async addFine(payload) {
    const id = nanoid(12)
    const { fine, price, admin } = payload

    try {
      const query = {
        text: `
        INSERT INTO room_fines (id, fine, price, created_by, updated_by) 
        VALUES ($1, $2, $3, $4, $4)
        `,
        values: [id, fine, price, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add fine : ${error.message}`)
    }
  }

  async putFine(payload) {
    const { id, fine, price, admin } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
        UPDATE room_fines
        SET fine = $1, price = $2, updated_by = $3, updated_at = $4
        WHERE id = $5
        `,
        values: [fine, price, admin, currentTime, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put fine : ${error.message}`)
    }
  }

  async getFines() {
    try {
      const { rows } = await this._pool.query('SELECT id, fine, price FROM room_fines ORDER BY created_at DESC')
      return rows
    } catch (error) {
      throw new Error(`Get fines : ${error.message}`)
    }
  }

  async getFineById(id) {
    try {
      const query = {
        text: 'SELECT id, fine, price, updated_at AS "updatedAt" FROM room_fines WHERE id = $1 LIMIT 1',
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      return rows[0]
    } catch (error) {
      throw new Error(`Get fine by id : ${error.message}`)
    }
  }

  async removeFine(id) {
    try {
      const query = {
        text: 'DELETE FROM room_fines WHERE id = $1',
        values: [id]
      }
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Remove fine : ${error.message}`)
    }
  }
}

module.exports = FinesService
