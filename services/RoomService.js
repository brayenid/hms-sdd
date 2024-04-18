const generateId = require('../globals/idgenerator')
const { pool } = require('../db/pool')

class RoomService {
  constructor() {
    this._pool = pool
  }

  async addRoom(payload) {
    const { number, category, smoking, bed, creator } = payload
    const id = `ROOM-${generateId(12)}`
    const query = {
      text: `
      INSERT INTO rooms (id, number, category, smoking, bed, created_by, updated_by) 
      VALUES($1, $2, $3, $4, $5, $6, $6)`,
      values: [id, number, category, smoking, bed, creator]
    }
    try {
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Add room : ${error.message}`)
    }
  }

  async putRoom(payload) {
    const { id, number, category, smoking, bed, updater, available } = payload
    const currentTime = new Date()

    const query = {
      text: `
      UPDATE rooms 
      SET number = $1, category = $2, smoking = $3, bed = $4, updated_by = $5, updated_at = $6, available = $7
      WHERE id = $8`,
      values: [number, category, smoking, bed, updater, currentTime, available, id]
    }

    try {
      await this.getRoomById(id)
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put room : ${error.message}`)
    }
  }

  async deleteRoom(id) {
    try {
      const query = {
        text: 'DELETE FROM rooms WHERE id = $1',
        values: [id]
      }
      await this.getRoomById(id)
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Delete room : ${error.message}`)
    }
  }

  async getRooms(search = '', smoking, bed, clean, limit = 20) {
    try {
      const query = {
        text: `
        SELECT 
          rooms.id, 
          rooms.number, 
          rooms_cat.category, 
          rooms.available,
          rooms.smoking, 
          rooms.bed, 
          rooms.cleaned, 
          rooms_cat.price 
        FROM 
          rooms 
        JOIN 
          rooms_cat
        ON 
          rooms.category = rooms_cat.id
        WHERE 
          (rooms.number::text ILIKE $1 OR rooms_cat.category ILIKE $1)
        `,
        values: [`%${search}%`]
      }

      if (smoking === 'true') {
        query.text += ' AND rooms.smoking = true'
      } else if (smoking === 'false') {
        query.text += ' AND rooms.smoking = false'
      }

      if (clean === 'true') {
        query.text += ' AND rooms.cleaned = true'
      } else if (clean === 'false') {
        query.text += ' AND rooms.cleaned = false'
      }

      if (bed) {
        query.text += ' AND rooms.bed = $2'
        query.values.push(bed)
        query.text += ' ORDER BY rooms.number ASC LIMIT $3'
        query.values.push(limit)
      } else {
        query.text += ' ORDER BY rooms.number ASC LIMIT $2'
        query.values.push(limit)
      }
      const { rows, rowCount } = await this._pool.query(query)
      return {
        total: rowCount,
        rooms: rows
      }
    } catch (error) {
      throw new Error(`Get rooms : ${error.message}`)
    }
  }

  async getRoomById(id) {
    const query = {
      text: `
      SELECT 
        rooms.*,
        accounts.name AS "updatedBy"
      FROM 
        rooms
      JOIN
        accounts
      ON
        rooms.updated_by = accounts.id
      WHERE
        rooms.id = $1 
      LIMIT 
        1
      `,
      values: [id]
    }
    try {
      const { rowCount, rows } = await this._pool.query(query)

      if (!rowCount) throw new Error('Kamar ini tidak tersedia')
      return rows[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async checkRoomCleanliness(id, checkInStatus) {
    try {
      const query = {
        text: 'SELECT cleaned FROM rooms WHERE id = $1 LIMIT 1',
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      if (!rows[0].cleaned && checkInStatus) throw new Error('Kamar belum dibersihkan')
    } catch (error) {
      throw new Error(`Get cleanliness by id : ${error.message}`)
    }
  }

  async patchRoomCleaniness(id, cleanliness) {
    const query = {
      text: 'UPDATE rooms SET cleaned = $1 WHERE id = $2'
    }
    if (cleanliness === 'clean') {
      query.values = [true, id]
    } else if (cleanliness === 'dirty') {
      query.values = [false, id]
    }

    try {
      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Room cleaniness update : ${error.message}`)
    }
  }

  async checkRoomAvailability(id) {
    try {
      const query = {
        text: 'SELECT available FROM rooms WHERE id = $1 LIMIT 1',
        values: [id]
      }

      const { rows } = await this._pool.query(query)

      if (!rows[0].available) throw new Error('Kamar tidak tersedia untuk dipesan')
    } catch (error) {
      throw new Error(`Get room availability: ${error.message}`)
    }
  }

  async getRoomByNumber(number) {
    const query = {
      text: 'SELECT * FROM rooms WHERE number = $1 LIMIT 1',
      values: [number]
    }
    try {
      const { rowCount, rows } = await this._pool.query(query)

      if (!rowCount) throw new Error('Kamar ini tidak tersedia')
      return rows[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getRoomFreqs() {
    try {
      const { rowCount } = await this._pool.query('SELECT id FROM rooms')
      return rowCount
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getRoomsDirty() {
    try {
      const { rowCount, rows } = await this._pool.query(`
      SELECT 
        r.id, 
        r.number,
        rc.category,
        r.available,
        r.cleaned
      FROM 
        rooms r
      JOIN
        rooms_cat rc
      ON
        r.category = rc.id
      WHERE 
        cleaned = false
      ORDER BY
        r.number
      ASC
      `)

      return {
        total: rowCount,
        data: rows
      }
    } catch (error) {
      throw new Error(`Get room dirty : ${error.message}`)
    }
  }
}

module.exports = RoomService
