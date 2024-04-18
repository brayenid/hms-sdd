const autoBind = require('auto-bind')
const BookingService = require('../../services/BookService')
const GuestService = require('../../services/GuestService')
const RoomService = require('../../services/RoomService')
const LogService = require('../../services/LogService')
const DepositService = require('../../services/DepositService')
const TransactionService = require('../../services/TransactionService')
const GoodsSalesService = require('../../services/GoodsSalesService')
const CancelledTransactionService = require('../../services/CancelledBookingService')

const { pool } = require('../../db/pool')
const RoomTransactionLogsService = require('../../services/RoomTransactionLogsService')

class BookingController {
  constructor() {
    this._pool = pool

    this.service = new BookingService()
    this.guestService = new GuestService()
    this.roomService = new RoomService()
    this.logService = new LogService()
    this.depositService = new DepositService()
    this.transactionService = new TransactionService()
    this.salesService = new GoodsSalesService()
    this.cancelledService = new CancelledTransactionService()
    this.roomTransactionLogsService = new RoomTransactionLogsService()

    autoBind(this)
  }

  async addBooking(req, res) {
    const initialDeposit = await this.depositService.getDeposit()
    const {
      startDate,
      endDate,
      guest,
      room,
      checkedIn,
      paid,
      deposit,
      bookedBy,
      totalPrice,
      totalRoom,
      totalExtra,
      extraPerson,
      extraBed,
      extraBreakfast,
      extraDecor,
      discount,
      source
    } = req.body
    const { id } = req.session.user

    const payload = {
      admin: id,
      guest,
      room,
      checkedIn,
      paid,
      deposit,
      bookedBy,
      startDate,
      endDate,
      totalRoom,
      totalExtra,
      extraPerson,
      extraBed,
      extraBreakfast,
      extraDecor,
      discount,
      source
    }

    try {
      if (checkedIn) {
        if (paid < totalPrice || Number(deposit) < initialDeposit) {
          throw new Error(
            `Pembayaran wajib lunas untuk dapat langsung check-in, termasuk deposit Rp. ${this._addSeparator(
              initialDeposit
            )}`
          )
        }
        if (guest === '0') {
          throw new Error('Data nama tamu yang langsung check-in wajib diisi dengan tamu terdaftar')
        }
        await this.service.getActiveBookByRoom(room)
      }
      if (guest && guest !== '0') {
        await this.guestService.getGuestById(guest)
      }
      await this._pool.query('BEGIN') // TRANSACTION

      await this.roomService.getRoomById(room)
      await this.service.getBookInfo({ startDate, endDate, room })
      await this.roomService.checkRoomAvailability(room)
      await this.roomService.checkRoomCleanliness(room, checkedIn)
      const bookingId = await this.service.addBooking(payload)
      if (checkedIn) {
        await this.logService.addLog(`Booking baru : ${startDate} > ${endDate} (Direct_Check-In)`, id)
      } else {
        await this.logService.addLog(`Booking baru : ${startDate} > ${endDate}`, id)
      }
      if (paid > 0) {
        await this.roomTransactionLogsService.addRoomTransactionLogs({ booking: bookingId, paid })
      }

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(201).json({
        status: 'success',
        message: 'Data booking baru berhasil dimasukan'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingById(req, res) {
    const { bookId } = req.params

    try {
      const response = await this.service.getBookInfoById(bookId)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingInfo(req, res) {
    const { start, end, room } = req.query
    try {
      await this.roomService.getRoomById(room)
      await this.service.getBookInfo({
        startDate: start,
        endDate: end,
        room
      })

      return res.status(200).json({
        status: 'success',
        message: 'Kamar ini tersedia'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingInfoByRoom(req, res) {
    const { roomId } = req.params

    try {
      const response = await this.service.getBookInfoByRoom(roomId)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingInfoByDate(req, res) {
    const { start, end, search } = req.query
    try {
      const response = await this.service.getBookInfoByDate(start, end, search)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingInfoByDateAvailability(req, res) {
    const { start, end } = req.query
    try {
      const response = await this.service.getBookInfoByDateAvailability(start, end)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookInfoByCheckIn(req, res) {
    const { limit, start, end, search } = req.query
    try {
      const response = await this.service.getBookInfoByCheckIn(limit, start, end, search)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookInfoByCheckOut(req, res) {
    const { limit, start, end, search } = req.query
    try {
      const response = await this.service.getBookInfoByCheckOut(limit, start, end, search)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async patchBooking(req, res) {
    const { deposit } = req.body
    const { id: adminId } = req.session.user
    const { bookId } = req.params
    const payload = {
      deposit,
      admin: adminId,
      id: bookId
    }

    try {
      await this.service.patchBooking(payload)

      return res.status(200).json({
        status: 'success',
        message: 'Data booking berhasil diubah'
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async removeBooking(req, res) {
    const { bookId } = req.params
    const { id } = req.session.user

    try {
      const { bookedBy } = await this.service.getBookInfoById(bookId)

      await this._pool.query('BEGIN') // TRANSACTION

      await this.service.validateBookingBeforeRemove(bookId)
      const { startDate, endDate, room, paid, deposit } = await this.service.removeBooking(bookId)
      await this.cancelledService.addCancelled({ bookedBy, startDate, endDate, room, paid, admin: id, deposit })
      await this.logService.addLog(`Penghapusan booking : ${bookedBy}`, id)

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Booking berhasil dihapus'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async checkInBooking(req, res) {
    const { bed, breakfast, person, decor, deposit, guest, totalExtra, paid, startDate, endDate, pay } = req.body
    const { bookId } = req.params
    const { id: admin } = req.session.user
    const initialDeposit = await this.depositService.getDeposit()

    const payload = {
      bed,
      breakfast,
      person,
      decor,
      deposit,
      guest,
      totalExtra,
      id: bookId,
      admin,
      paid
    }

    try {
      await this._pool.query('BEGIN') // TRANSACTION

      if (Number(deposit) < initialDeposit) {
        throw new Error(`Deposit wajib lunas, sebesar Rp. ${this._addSeparator(initialDeposit)}`)
      }

      if (guest === '0') {
        throw new Error('Data nama tamu yang langsung check-in wajib diisi dengan tamu terdaftar')
      }

      if (guest && guest !== '0') {
        await this.guestService.getGuestById(guest)
      }
      const { room } = await this.service.getBookInfoById(bookId)
      await this.roomService.checkRoomCleanliness(room, true)
      await this.service.getActiveBookByRoom(room)
      await this.service.checkInBooking(payload)
      await this.logService.addLog(`Check-in baru : ${startDate} > ${endDate}`, admin)
      if (pay !== 0) {
        await this.roomTransactionLogsService.addRoomTransactionLogs({ booking: bookId, paid: pay })
      }

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Tamu berhasil check-in'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async checkOutBooking(req, res) {
    const { fines, paid, discount, roomNumber, pay } = req.body
    const { bookId } = req.params
    const { id: admin } = req.session.user

    const payload = {
      fines,
      paid,
      admin,
      id: bookId
    }

    try {
      await this._pool.query('BEGIN') // TRANSACTION

      const { room: roomId, totalRoom, totalExtra } = await this.service.checkOutBooking(payload)
      await this.roomService.patchRoomCleaniness(roomId, 'dirty')

      const resSales = await this.salesService.getGoodsSalesByBooking(bookId)
      let totalSales = 0
      if (resSales.length) {
        totalSales = resSales.reduce((a, b) => {
          return a + b.price * b.quantity
        }, 0)
      }

      const transactionPayload = {
        bookingId: bookId,
        admin,
        totalRoom,
        totalExtra,
        totalFines: fines,
        totalSales,
        discount
      }
      const invoiceNumber = await this.transactionService.addTransaction(transactionPayload)
      await this.logService.addLog(`Check-out baru : ${roomNumber}`, admin)
      if (pay !== 0) {
        await this.roomTransactionLogsService.addRoomTransactionLogs({ booking: bookId, paid: pay })
      }

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Tamu berhasil check-out',
        data: invoiceNumber
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async patchCheckOutRoom(req, res) {
    const { room, totalRoom, oldRoom, totalExtra, extraPerson, extraBed, extraBreakfast, extraDecor } = req.body
    const { bookId } = req.params
    const { id: adminId } = req.session.user

    const payload = {
      room,
      totalRoom,
      totalExtra,
      extraPerson,
      extraBed,
      extraBreakfast,
      extraDecor,
      admin: adminId,
      id: bookId
    }

    try {
      await this._pool.query('BEGIN') // TRANSACTION

      await this.roomService.checkRoomAvailability(room)
      await this.roomService.checkRoomCleanliness(room, true)
      await this.service.patchCheckOutRoom(payload)

      const oldRoomNumber = (await this.roomService.getRoomById(oldRoom)).number
      const newRoomNumber = (await this.roomService.getRoomById(room)).number

      await this.logService.addLog(`Perubahan detail booking : ${oldRoomNumber} > ${newRoomNumber}`, adminId)

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Perubahan kamar berhasil'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async bookingStatistic(req, res) {
    try {
      const { limit } = req.query
      const response = await this.service.bookingStatistic(limit)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getActiveBookings(req, res) {
    const { search, limit } = req.query

    try {
      const response = await this.service.getActiveBookings(search, limit)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async getBookingInfoByDateForExtends(req, res) {
    const { start, end } = req.query
    const { id } = req.params
    try {
      const response = await this.service.getBookInfoByDateForExtends(start, end, id)

      return res.status(200).json({
        status: 'success',
        data: response
      })
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async extendRoom(req, res) {
    const { startDate, endDate, bookingId, roomPrice, roomId } = req.body
    const { id: adminId } = req.session.user

    try {
      if (startDate === endDate) {
        throw new Error('Tanggal check-in tidak boleh sama dengan tanggal check-out')
      }
      if (startDate > endDate) {
        throw new Error('Tanggal check-in tidak boleh lebih besar dari tanggal check-out')
      }

      const response = await this.service.getBookInfoByDateForExtends(startDate, endDate, bookingId)

      const checkAvailability = () => {
        const isAvailable = response.filter((data) => data.id === roomId)
        if (isAvailable.length < 1) {
          throw new Error('Kamar ini tidak tersedia untuk tanggal tersebut')
        }
      }

      await this._pool.query('BEGIN') // TRANSACTION
      checkAvailability()
      await this.service.extendRoom({ bookingId, endDate, roomPrice })
      await this.logService.addLog(`Pembaharuan durasi menginap : ${bookingId}`, adminId)

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Durasi menginap berhasil diperbaharui'
      })
    } catch (error) {
      console.log(error)
      await this._pool.query('ROLLBACK') // TRANSACTION
      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async payOffBook(req, res) {
    const { newPaid } = req.body
    const { bookingId } = req.params
    const { id: adminId } = req.session.user

    try {
      await this._pool.query('BEGIN') // TRANSACTION

      await this.service.payOffBook({ newPaid, bookingId })
      if (newPaid !== 0) {
        await this.roomTransactionLogsService.addRoomTransactionLogs({ booking: bookingId, paid: newPaid })
      }
      await this.logService.addLog(`Pelunasan pembayaran : ${bookingId}`, adminId)

      await this._pool.query('COMMIT') // TRANSACTION

      return res.status(200).json({
        status: 'success',
        message: 'Booking berhasil dilunasi'
      })
    } catch (error) {
      await this._pool.query('ROLLBACK') // TRANSACTION

      return res.status(400).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  _addSeparator(number) {
    const numString = number.toString()
    const parts = numString.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const formattedNumber = parts.join('.')

    return formattedNumber
  }
}

module.exports = BookingController
