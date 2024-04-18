const idgenerator = require('../globals/idgenerator')
const { pool } = require('../db/pool')

class GuestService {
  constructor() {
    this._pool = pool
  }

  async addGuest(payload) {
    const id = `GUEST-${idgenerator(26)}`
    const { idType, idNumber, name, gender, address, city, nationality, admin } = payload
    try {
      const query = {
        text: `
        INSERT INTO guests (id, identity_type, identity_number, name, gender, address, city, nationality, created_by, updated_by) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
        values: [id, idType, idNumber, name, gender, address, city, nationality, admin]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add guest : ${error.message}`)
    }
  }

  async updateGuest(payload) {
    const { id, idType, idNumber, name, gender, address, city, nationality, admin } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
          UPDATE guests
          SET 
            identity_type = $1,
            identity_number = $2,
            name = $3,
            gender = $4,
            address = $5,
            city = $6,
            nationality = $7,
            updated_by = $8,
            updated_at = $9
          WHERE id = $10`,
        values: [idType, idNumber, name, gender, address, city, nationality, admin, currentTime, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Update guest: ${error.message}`)
    }
  }

  async getGuests(search = '', length, limit = 20) {
    let query
    if (length === 'full') {
      query = {
        text: `
        SELECT id, identity_type AS "idType", identity_number AS "idNumber", name, gender, address, city, nationality, created_at AS "createdAt"
        FROM guests 
        WHERE identity_number ILIKE $1 OR name ILIKE $1
        LIMIT $2`,
        values: [`%${search}%`, Number(limit)]
      }
    } else {
      query = {
        text: `
        SELECT id, name, address, city
        FROM guests
        WHERE name ILIKE $1
        LIMIT 10`,
        values: [`%${search}%`]
      }
    }
    try {
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get guests : ${error.message}`)
    }
  }

  async deleteGuestById(id) {
    try {
      await this.getGuestById(id)
      const query = {
        text: 'DELETE FROM guests WHERE id = $1',
        values: [id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Delete guest : ${error.message}`)
    }
  }

  async getGuestById(id) {
    const query = {
      text: `
      SELECT
      id,
      identity_type AS "idType",
      identity_number AS "idNumber",
      name,
      gender,
      address,
      city,
      nationality,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      created_by AS "createdBy",
      updated_by AS "updatedBy"
      FROM guests
      WHERE id = $1
      LIMIT 1`,
      values: [id]
    }
    try {
      const { rows, rowCount } = await this._pool.query(query)
      if (!rowCount) {
        throw new Error('Tamu tidak ditemukan')
      }
      return rows[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = GuestService
