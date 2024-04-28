const generateId = require('../globals/idgenerator')
const { pool } = require('../db/pool')

class BookingService {
  constructor() {
    this._pool = pool
  }

  async addBooking(payload) {
    const {
      startDate,
      endDate,
      guest,
      room,
      checkedIn,
      paid,
      deposit,
      bookedBy,
      admin,
      totalRoom,
      totalExtra,
      extraPerson,
      extraBed,
      extraBreakfast,
      extraDecor,
      discount,
      source
    } = payload
    const id = `${generateId(25, 'ABCDEFGHIJKLMNOPRSTUVWXYZ1234567890')}-${Date.now()}`
    try {
      const query = {
        text: `
        INSERT INTO 
          bookings (id, guest, room, start_date, end_date, deposit, checked_in, paid, booked_by, total_room, total_extra, extra_person, extra_bed, extra_breakfast, extra_decor, created_by, updated_by, discount, source) 
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16, $17, $18)
        RETURNING
          id
        `,
        values: [
          id,
          guest,
          room,
          startDate,
          endDate,
          deposit,
          checkedIn,
          paid,
          bookedBy,
          totalRoom,
          totalExtra,
          extraPerson,
          extraBed,
          extraBreakfast,
          extraDecor,
          admin,
          discount,
          source
        ]
      }

      const { rows } = await this._pool.query(query)
      return rows[0].id
    } catch (error) {
      throw new Error(`Add booking : ${error.message}`)
    }
  }

  async getBookInfo(payload) {
    const { startDate, endDate, room } = payload
    try {
      const query = {
        text: `
        SELECT id, start_date AS "startDate", end_date AS "endDate" FROM bookings
        WHERE (
          ($1 >= start_date AND $1 < end_date) OR
          ($2 > start_date AND $2 <= end_date) OR
          (start_date >= $1 AND end_date <= $2)
          ) AND room = $3
        LIMIT 1
        `,
        values: [startDate, endDate, room]
      }

      const { rowCount } = await this._pool.query(query)
      if (rowCount) {
        throw new Error('Kamar ini tidak tersedia pada tanggal tersebut')
      }
    } catch (error) {
      throw new Error(`Get book info : ${error.message}`)
    }
  }

  async getBookInfoByRoom(room) {
    try {
      const query = {
        text: `
        SELECT id, start_date AS "startDate", end_date AS "endDate"
        FROM bookings
        WHERE room = $1
        `,
        values: [room]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get book info by room : ${error.message}`)
    }
  }

  async getActiveBookByRoom(room) {
    try {
      const query = {
        text: `
        SELECT id
        FROM bookings
        WHERE room = $1 AND checked_in = true AND checked_out = false
        `,
        values: [room]
      }
      const { rowCount } = await this._pool.query(query)

      if (rowCount) {
        throw new Error('Kamar ini sedang digunakan')
      }
    } catch (error) {
      throw new Error(`Get active book by room : ${error.message}`)
    }
  }

  async getBookInfoByDate(start, end, search = '') {
    try {
      const query = {
        text: `
        SELECT 
          rooms.id, 
          rooms.number, 
          rooms.smoking, 
          rooms.bed, 
          rooms_cat.category, 
          rooms.category AS "categoryId", 
          rooms_cat.price, 
          rooms.cleaned,
          rooms.available
        FROM 
          rooms
        JOIN 
          rooms_cat
        ON 
          rooms.category = rooms_cat.id
        WHERE rooms.id NOT IN (
          SELECT room
          FROM bookings
          WHERE (
            ($1 >= start_date AND $1 < end_date) OR
            ($2 > start_date AND $2 <= end_date) OR
            (start_date >= $1 AND end_date <= $2)
          )
        ) 
          AND (rooms.number::text ILIKE $3 OR rooms_cat.category ILIKE $3)
          ORDER BY rooms.number
        `,
        values: [start, end, `%${search}%`]
      }
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get book info by date : ${error.message}`)
    }
  }

  async getBookInfoByDateAvailability(start, end) {
    try {
      const query = {
        text: `
        SELECT 
          rooms.id, 
          rooms.number, 
          rooms.smoking, 
          rooms.bed, 
          rooms_cat.category, 
          rooms.category AS "categoryId", 
          rooms_cat.price, 
          rooms.cleaned,
          rooms.available
        FROM 
          rooms
        JOIN 
          rooms_cat
        ON 
          rooms.category = rooms_cat.id
          WHERE rooms.id NOT IN (
            SELECT room
            FROM bookings
            WHERE (
              ($1 >= start_date AND $1 < end_date) OR
              ($2 > start_date AND $2 <= end_date) OR
              (start_date >= $1 AND end_date <= $2)
            )
          )
        ORDER BY
          rooms.number
        ASC
        `,
        values: [start, end]
      }
      const { rows } = await this._pool.query(query)
      return rows
    } catch (error) {
      throw new Error(`Get book info by date : ${error.message}`)
    }
  }

  async getBookInfoByDateForExtends(start, end, bookingId) {
    try {
      const query = {
        text: `
        SELECT 
          rooms.id, 
          rooms.number, 
          rooms.smoking, 
          rooms.bed, 
          rooms_cat.category, 
          rooms.category AS "categoryId", 
          rooms_cat.price, 
          rooms.cleaned,
          rooms.available
        FROM 
          rooms
        JOIN 
          rooms_cat
        ON 
          rooms.category = rooms_cat.id
          WHERE rooms.id NOT IN (
            SELECT room
            FROM bookings
            WHERE (
              ($1 >= start_date AND $1 < end_date) OR
              ($2 > start_date AND $2 <= end_date) OR
              (start_date >= $1 AND end_date <= $2)
            ) AND
            id != $3
          )
        ORDER BY
          rooms.number
        ASC
        `,
        values: [start, end, bookingId]
      }
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get book info by date : ${error.message}`)
    }
  }

  async getBookInfoByCheckIn(limit = 50, startDate, endDate, search = '') {
    try {
      const query = {
        text: `
        SELECT 
        bookings.id,
        bookings.guest,
        bookings.room,
        bookings.booked_by AS "bookedBy",
        bookings.start_date AS "startDate",
        bookings.end_date AS "endDate",
        bookings.deposit,
        bookings.paid,
        bookings.discount,
        bookings.extra_person AS "extraPerson",
        bookings.extra_bed AS "extraBed",
        bookings.extra_decor AS "extraDecor",
        bookings.extra_breakfast AS "extraBreakfast",
        bookings.total_room AS "totalRoom",
        bookings.total_extra AS "totalExtra",
        bookings.created_by AS "receivedBy",
        bookings.created_at AS "createdAt"
        FROM bookings
        WHERE checked_in = false AND (bookings.id ILIKE $2 OR bookings.booked_by ILIKE $2)
        `,
        values: [limit, `%${search}%`]
      }
      if (startDate || endDate) {
        query.text += `
         AND start_date >= $3 AND end_date <= $4
        `
        query.values.push(startDate, endDate)
      }

      query.text += ' ORDER BY start_date ASC LIMIT $1'

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get book info by check-in : ${error.message}`)
    }
  }

  async getBookInfoByCheckOut(limit = 50, startDate, endDate, search = '') {
    try {
      const query = {
        text: `
        SELECT 
          bookings.id,
          bookings.guest,
          guests.name,
          bookings.room,
          rooms.number,
          bookings.booked_by AS "bookedBy",
          bookings.start_date AS "startDate",
          bookings.end_date AS "endDate",
          bookings.deposit,
          bookings.paid,
          bookings.extra_person AS "extraPerson",
          bookings.extra_bed AS "extraBed",
          bookings.extra_decor AS "extraDecor",
          bookings.extra_breakfast AS "extraBreakfast",
          bookings.total_room AS "totalRoom",
          bookings.total_extra AS "totalExtra",
          bookings.created_by AS "receivedBy",
          bookings.created_at AS "createdAt"
        FROM 
          bookings
        JOIN
          rooms
        ON
          bookings.room = rooms.id
        JOIN
          guests
        ON bookings.guest = guests.id
        WHERE 
          checked_out = false AND checked_in = true AND (bookings.id ILIKE $2 OR bookings.booked_by ILIKE $2 OR guests.name ILIKE $2)
        `,
        values: [limit, `%${search}%`]
      }
      if (startDate || endDate) {
        query.text += `
         AND start_date >= $3 AND end_date <= $4
        `
        query.values.push(startDate, endDate)
      }

      query.text += ' ORDER BY end_date ASC LIMIT $1'

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get book info by check-out : ${error.message}`)
    }
  }

  async patchBooking(payload) {
    const { id, deposit, admin } = payload

    try {
      const query = {
        text: `
        UPDATE bookings SET deposit = $1, updated_by = $2
        WHERE id = $3
        `,
        values: [deposit, admin, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put booking : ${error.message}`)
    }
  }

  async removeBooking(id) {
    try {
      const query = {
        text: `
        DELETE FROM 
          bookings 
        WHERE 
          id = $1
        RETURNING
          booked_by AS "bookedBy",
          room,
          start_date AS "startDate",
          end_date AS "endDate",
          paid,
          deposit
        `,
        values: [id]
      }

      const { rows } = await this._pool.query(query)
      return rows[0]
    } catch (error) {
      throw new Error(`Remove booking : ${error.message}`)
    }
  }

  async getBookInfoById(id) {
    try {
      const query = {
        text: `
        SELECT 
          bookings.id,
          bookings.guest,
          COALESCE(guests.name, 'No Guest') AS "guestName",
          bookings.room,
          bookings.booked_by AS "bookedBy",
          bookings.start_date AS "startDate",
          bookings.end_date AS "endDate",
          bookings.deposit,
          bookings.paid,
          bookings.discount,
          bookings.checked_in AS "checkedIn",
          bookings.checked_out AS "checkedOut",
          bookings.source,
          bookings.extra_person AS "extraPerson",
          bookings.extra_bed AS "extraBed",
          bookings.extra_decor AS "extraDecor",
          bookings.extra_breakfast AS "extraBreakfast",
          bookings.total_room AS "totalRoom",
          bookings.total_extra AS "totalExtra",
          accounts.name AS "receivedBy",
          bookings.created_at AS "createdAt"
        FROM 
          bookings
        LEFT JOIN
          guests
        ON
          bookings.guest = guests.id
        JOIN
          accounts
        ON
          bookings.updated_by = accounts.id
        WHERE 
          bookings.id = $1 LIMIT 1
        `,
        values: [id]
      }

      const { rowCount, rows } = await this._pool.query(query)

      if (!rowCount) throw new Error('Data booking tidak ditemukan')

      return rows[0]
    } catch (error) {
      throw new Error(`Get book info by id : ${error.message}`)
    }
  }

  async getActiveBookings(search = '', limit = 15) {
    try {
      const query = {
        text: `
        SELECT 
        bookings.id, 
        rooms.number, 
        bookings.start_date AS "startDate",
        bookings.end_date AS "endDate"
        FROM bookings
        JOIN rooms
        ON bookings.room = rooms.id
        WHERE bookings.checked_in = true AND bookings.checked_out = false AND CAST(rooms.number AS TEXT) ILIKE $1
        LIMIT $2
        `,
        values: [`%${search}%`, limit]
      }

      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Get active booking : ${error.message}`)
    }
  }

  async checkInBooking(payload) {
    const { bed, breakfast, person, decor, deposit, guest, totalExtra, admin, paid, id } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
        UPDATE bookings 
        SET 
        extra_bed = $1, 
        extra_breakfast = $2, 
        extra_person = $3, 
        extra_decor = $4, 
        deposit = $5, 
        guest = $6, 
        total_extra = $7,
        paid = $8,
        checked_in = true,
        updated_at = $9,
        updated_by = $10
        WHERE id = $11
        `,
        values: [bed, breakfast, person, decor, deposit, guest, totalExtra, paid, currentTime, admin, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Check in booking : ${error.message}`)
    }
  }

  async checkOutBooking(payload) {
    const { fines, admin, paid, id } = payload
    const currentTime = new Date()

    try {
      const query = {
        text: `
        UPDATE bookings 
        SET 
        total_fines = $1,
        paid = $2,
        checked_out = true,
        updated_at = $3,
        updated_by = $4
        WHERE id = $5
        RETURNING room, total_room AS "totalRoom", total_extra AS "totalExtra"
        `,
        values: [fines, paid, currentTime, admin, id]
      }

      const { rows } = await this._pool.query(query)
      return rows[0]
    } catch (error) {
      throw new Error(`Check out booking : ${error.message}`)
    }
  }

  async patchCheckOutRoom(payload) {
    const { room, totalRoom, totalExtra, extraPerson, extraBed, extraBreakfast, extraDecor, admin, id } = payload

    const currentTime = new Date()
    try {
      const query = {
        text: `
        UPDATE bookings 
        SET 
          room = $1, 
          total_room = $2, 
          total_extra = $3, 
          extra_person = $4, 
          extra_bed = $5, 
          extra_breakfast = $6, 
          extra_decor = $7,
          updated_by = $8,
          updated_at = $9
        WHERE id = $10
        `,
        values: [room, totalRoom, totalExtra, extraPerson, extraBed, extraBreakfast, extraDecor, admin, currentTime, id]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Put check out room : ${error.message}`)
    }
  }

  async bookingStatistic(limit = 15) {
    try {
      const query = {
        text: `
        SELECT 
          bookings.start_date AS "startDate", 
          bookings.end_date AS "endDate", 
          rooms.number, 
          bookings.checked_in AS "checkIn", 
          bookings.checked_out AS "checkOut"
        FROM 
          bookings
        JOIN 
          rooms
        ON 
          bookings.room = rooms.id
        WHERE 
          CAST(bookings.start_date AS DATE) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '9 day'
        ORDER BY 
          bookings.start_date DESC
        LIMIT $1
        `,
        values: [limit]
      }
      const { rows } = await this._pool.query(query)

      return rows
    } catch (error) {
      throw new Error(`Booking statistic : ${error.message}`)
    }
  }

  async validateBookingBeforeRemove(id) {
    try {
      const query = {
        text: `
        SELECT id, checked_in AS "checkedIn"
        FROM bookings WHERE id = $1 LIMIT 1
        `,
        values: [id]
      }

      const { rowCount, rows } = await this._pool.query(query)

      if (!rowCount) throw new Error('Data booking tidak ditemukan')
      if (rows[0].checkedIn) throw new Error('Booking yang telah check-in tidak dapat dihapus')

      return rows[0]
    } catch (error) {
      throw new Error(`Get book info by id : ${error.message}`)
    }
  }

  async getGuestSleepIn() {
    try {
      const { rowCount } = await this._pool.query(
        'SELECT id FROM bookings WHERE checked_in = true AND checked_out = false'
      )
      return rowCount
    } catch (error) {
      throw new Error(`Get guest sleep in : ${error.message}`)
    }
  }

  async getBookingBySource() {
    try {
      const { rows } = await this._pool.query(`
      SELECT
        source,
        COUNT(*) AS frekuensi
      FROM
        bookings
      WHERE
        checked_in = true AND checked_out = true
      GROUP BY
        source
      `)

      return rows
    } catch (error) {
      throw new Error(`Get booking by source : ${error.message}`)
    }
  }

  async extendRoom(payload) {
    const { bookingId, endDate, roomPrice } = payload
    try {
      const query = {
        text: `
        UPDATE
          bookings
        SET
          end_date = $1,
          total_room = total_room + $2
        WHERE
          id = $3
        `,
        values: [endDate, roomPrice, bookingId]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Extend Room : ${error.message}`)
    }
  }

  async payOffBook(payload) {
    const { newPaid, bookingId } = payload

    try {
      const query = {
        text: `
        UPDATE
          bookings
        SET
          paid = paid + $1
        WHERE
          id = $2
        `,
        values: [newPaid, bookingId]
      }

      await this._pool.query(query)
    } catch (error) {
      throw new Error(`Pay off book : ${error.message}`)
    }
  }
}

module.exports = BookingService
