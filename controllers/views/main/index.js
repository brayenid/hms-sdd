const autoBind = require('auto-bind')

const RoomCatService = require('../../../services/RoomCatService')
const RoomService = require('../../../services/RoomService')
const nationalities = require('../../../globals/nationalities')
const BookingService = require('../../../services/BookService')
const ExtraPriceService = require('../../../services/ExtraPriceService')
const DepositService = require('../../../services/DepositService')
const GuestService = require('../../../services/GuestService')
const TransactionService = require('../../../services/TransactionService')
const GoodsSalesService = require('../../../services/GoodsSalesService')
const AccountService = require('../../../services/AccountService.js')
const LogService = require('../../../services/LogService.js')
const HotelInfoService = require('../../../services/HotelInfoService.js')
const GoodsService = require('../../../services/GoodsService.js')
const SupplyService = require('../../../services/SupplyService.js')
const CancelledTransactionService = require('../../../services/CancelledBookingService.js')
const FinesService = require('../../../services/FinesService.js')
const LogisticBalanceService = require('../../../services/LogisticBalanceService.js')
const BalanceLogService = require('../../../services/BalanceLogService.js')
const RoomTransactionLogsService = require('../../../services/RoomTransactionLogsService.js')
const CreditService = require('../../../services/CreditService.js')

const { addSeparator, calculateNights, isToday, capitalized } = require('../../../globals/helper')

const bookingService = new BookingService()
const roomService = new RoomService()
const roomCatService = new RoomCatService()
const extraPriceService = new ExtraPriceService()
const depositService = new DepositService()
const guestService = new GuestService()
const transactionService = new TransactionService()
const goodsSalesService = new GoodsSalesService()
const accountsService = new AccountService()
const logService = new LogService()
const hotelInfoService = new HotelInfoService()
const goodsService = new GoodsService()
const supplyService = new SupplyService()
const cancelledService = new CancelledTransactionService()
const finesService = new FinesService()
const logisticBalanceService = new LogisticBalanceService()
const balanceLogsService = new BalanceLogService()
const roomTransactionLogsService = new RoomTransactionLogsService()
const creditService = new CreditService()

const moment = require('../../../public/scripts/moment.min.js')
const { formatISODate, formatDate, toInputDate } = require('../../../globals/date.js')
class Dashboard {
  constructor() {
    autoBind(this)
  }

  async main(req, res) {
    const simplifiedDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
        2,
        '0'
      )}`
    }

    const todaysDate = new Date()
    const tommorowsDate = new Date()
    tommorowsDate.setDate(todaysDate.getDate() + 1)

    const todaysDateSimplified = simplifiedDate(todaysDate)

    const tommorowsDateSimplified = simplifiedDate(tommorowsDate)

    try {
      const { role, name: accName } = req.session.user
      const upcomingCheckIn = await bookingService.getBookInfoByCheckIn(5)
      const upcomingCheckOut = await bookingService.getBookInfoByCheckOut(5)
      const numberOfRooms = await roomService.getRoomFreqs()
      const guestSleepIn = await bookingService.getGuestSleepIn()
      const { total } = await roomService.getRoomsDirty()
      const bookingSource = await bookingService.getBookingBySource()
      const cancelledBookings = await cancelledService.getCancelled(
        '',
        20,
        todaysDateSimplified,
        tommorowsDateSimplified
      )

      const hotel = await this._getHotelInfo()
      if (role === 'logistic') {
        return res.redirect('/goods')
      }

      res.render('index.ejs', {
        title: 'Dashboard',
        role,
        accName,
        upcomingCheckIn,
        upcomingCheckOut,
        numberOfRooms,
        guestSleepIn,
        dirtyRooms: total,
        hotel,
        bookingSource,
        isToday,
        cancelledBookings: cancelledBookings.length,
        todaysDateSimplified,
        tommorowsDateSimplified
      })
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: error.message
      })
    }
  }

  async login(req, res) {
    try {
      if (req.session.user) {
        return res.status(301).redirect('/')
      }
      const hotel = await this._getHotelInfo()

      res.render('login.ejs', {
        layout: 'partials/auth-layout',
        title: 'Masuk Akun Anda',
        hotel
      })
    } catch (error) {
      res.render('/')
    }
  }

  async roomCategory(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('room-cat.ejs', {
        title: 'Tambahkan Kategori Kamar',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.render('/')
    }
  }

  async roomCategoryDetail(req, res) {
    const roomCatService = new RoomCatService()
    const { roomId } = req.params
    const { role, name: accName } = req.session.user

    try {
      const hotel = await this._getHotelInfo()
      const data = await roomCatService.getRoomById(roomId)

      res.render('room-cat-detail.ejs', {
        title: 'Edit kategori',
        data,
        role,
        accName,
        hotel,
        addSeparator
      })
    } catch (error) {
      res.redirect('/category')
    }
  }

  async room(req, res) {
    const { role, name: accName } = req.session.user
    const { search, smoking, bed, limit, clean } = req.query

    try {
      const rooms = (await roomService.getRooms(search, smoking, bed, clean, limit)).rooms
      const hotel = await this._getHotelInfo()

      res.render('room.ejs', {
        title: 'Tambahkan Kamar Baru',
        query: req.query,
        role,
        accName,
        rooms,
        addSeparator,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async roomDetail(req, res) {
    const roomService = new RoomService()
    const { roomId } = req.params
    const { role, name: accName } = req.session.user

    try {
      const data = await roomService.getRoomById(roomId)
      const hotel = await this._getHotelInfo()

      res.render('room-detail.ejs', {
        title: 'Edit Kamar',
        data,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/room')
    }
  }

  async booking(req, res) {
    try {
      const extraPriceService = new ExtraPriceService()
      const extraPrice = await extraPriceService.getExtraPrice()
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const OTAS = require('../../../globals/otas.js')

      const prices = {
        person: 0,
        bed: 0,
        breakfast: 0
      }

      /* eslint-disable no-prototype-builtins */
      extraPrice.forEach((data) => {
        const { extra, price } = data
        if (prices.hasOwnProperty(extra)) {
          prices[extra] = price
        }
      })

      res.render('booking.ejs', {
        title: 'Tambahkan Data Booking Baru',
        person: prices.person,
        bed: prices.bed,
        breakfast: prices.breakfast,
        role,
        accName,
        hotel,
        OTAS
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async guestsPopup(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('guest-popup.ejs', {
        layout: 'partials/auth-layout',
        title: 'Tambahkan Tamu Baru',
        nationalities,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async guest(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('guest.ejs', {
        title: 'Daftar Tamu',
        query: req.query,
        role,
        nationalities,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async guestDetail(req, res) {
    const { role, name: accName } = req.session.user
    const hotel = await this._getHotelInfo()
    const { guestId } = req.params

    const guestDetail = await guestService.getGuestById(guestId)
    res.render('guest-detail.ejs', {
      title: 'Detail Tamu',
      query: req.query,
      role,
      nationalities,
      guestDetail,
      accName,
      hotel
    })
  }

  async checkIn(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('check-in', {
        title: 'Daftar Check-In Yang Akan Datang',
        query: req.query,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async checkInDetail(req, res) {
    const extraPrice = await extraPriceService.getExtraPrice()
    const initialDeposit = await depositService.getDeposit()
    const { role, name: accName } = req.session.user

    const prices = {
      person: 0,
      bed: 0,
      breakfast: 0
    }

    /* eslint-disable no-prototype-builtins */
    extraPrice.forEach((data) => {
      const { extra, price } = data
      if (prices.hasOwnProperty(extra)) {
        prices[extra] = price
      }
    })

    const { id } = req.params
    const setIDDatestyle = (input) => {
      return input.split('-').reverse().join('-')
    }

    try {
      const detail = await bookingService.getBookInfoById(id)
      const { number, bed, smoking, category: roomCat } = await roomService.getRoomById(detail.room)
      const { category } = await roomCatService.getRoomById(roomCat)

      const hotel = await this._getHotelInfo()

      detail.startDateReverse = setIDDatestyle(detail.startDate)
      detail.endDateReverse = setIDDatestyle(detail.endDate)
      detail.roomNumber = number
      detail.bed = bed
      detail.smoking = smoking
      detail.roomCat = category

      if (detail.checkedIn) {
        throw new Error('Sudah check-in')
      }

      res.render('check-in-detail', {
        title: 'Atur Check-In tamu',
        detail,
        params: id,
        person: prices.person,
        bed: prices.bed,
        breakfast: prices.breakfast,
        deposit: initialDeposit,
        role,
        accName,
        addSeparator,
        hotel
      })
    } catch (error) {
      console.log(error)
      res.redirect('/checkin')
    }
  }

  async checkOut(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${year}-${month}-${day}`
      }

      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      const todayFormatted = formatDate(today)
      const tomorrowFormatted = formatDate(tomorrow)

      res.render('check-out', {
        title: 'Daftar Check-Out Yang Akan Datang',
        query: req.query,
        role,
        accName,
        hotel,
        todayFormatted,
        tomorrowFormatted
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async checkOutDetail(req, res) {
    const extraPrice = await extraPriceService.getExtraPrice()
    const initialDeposit = await depositService.getDeposit()
    const { role, name: accName } = req.session.user

    const prices = {
      person: 0,
      bed: 0,
      breakfast: 0
    }

    /* eslint-disable no-prototype-builtins */
    extraPrice.forEach((data) => {
      const { extra, price } = data
      if (prices.hasOwnProperty(extra)) {
        prices[extra] = price
      }
    })

    const { id } = req.params
    const setIDDatestyle = (input) => {
      return input.split('-').reverse().join('-')
    }

    try {
      const detail = await bookingService.getBookInfoById(id)
      const { number, bed, smoking, category: roomCat } = await roomService.getRoomById(detail.room)
      const { category, detail: roomDetail } = await roomCatService.getRoomById(roomCat)

      const hotel = await this._getHotelInfo()

      detail.startDateReverse = setIDDatestyle(detail.startDate)
      detail.endDateReverse = setIDDatestyle(detail.endDate)
      detail.roomNumber = number
      detail.bed = bed
      detail.smoking = smoking
      detail.roomCat = category
      detail.roomDetail = roomDetail

      if (detail.checkedOut) {
        throw new Error('Sudah check-out')
      }

      res.render('check-out-detail', {
        title: 'Atur Check-Out tamu',
        detail,
        params: id,
        person: prices.person,
        bed: prices.bed,
        breakfast: prices.breakfast,
        deposit: initialDeposit,
        role,
        addSeparator,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/checkout')
    }
  }

  async extraPrice(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      const extraPriceService = new ExtraPriceService()
      const extraPrice = await extraPriceService.getExtraPrice()
      res.render('extra-price.ejs', {
        title: 'Atur Harga Ekstra Kamar',
        extraPrice,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async deposit(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      const currentDeposit = await depositService.getDeposit()
      res.render('deposit.ejs', {
        title: 'Atur Harga Deposit',
        currentDeposit,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async fines(req, res) {
    const { role, name: accName } = req.session.user
    try {
      const hotel = await this._getHotelInfo()
      const fines = await finesService.getFines()

      res.render('fines.ejs', {
        title: 'Atur Denda',
        role,
        accName,
        hotel,
        fines,
        addSeparator
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async finesDetail(req, res) {
    const { role, name: accName } = req.session.user
    const { id } = req.params
    try {
      const hotel = await this._getHotelInfo()
      const fines = await finesService.getFineById(id)

      res.render('fines-detail.ejs', {
        title: 'Detail Denda',
        role,
        accName,
        fines,
        hotel,
        addSeparator
      })
    } catch (error) {
      res.redirect('/fine')
    }
  }

  async goods(req, res) {
    const { search, limit, stock } = req.query
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const goods = await goodsService.getGoods(search, limit, stock)
      const goodsFreq = await goodsService.getGoodsFreq()
      const goodsUnderStock = await goodsService.getGoodsUnderStock()

      res.render('goods.ejs', {
        title: 'Atur Barang Penjualan',
        role,
        query: req.query,
        accName,
        hotel,
        goods,
        addSeparator,
        goodsFreq,
        goodsUnderStock
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async goodsPrint(req, res) {
    const { search, limit, stock } = req.query
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const goods = await goodsService.getGoods(search, limit, stock)
      const goodsFreq = await goodsService.getGoodsFreq()
      const goodsUnderStock = await goodsService.getGoodsUnderStock()

      res.render('goods-print.ejs', {
        title: 'Cetak Daftar Barang',
        layout: 'partials/print-layout',
        role,
        query: req.query,
        accName,
        hotel,
        goods,
        addSeparator,
        goodsFreq,
        goodsUnderStock
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async goodsDetail(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const { updatedBy, updatedAt } = await goodsService.getGoodsById(req.params.id)
      const hotel = await this._getHotelInfo()

      res.render('goods-detail.ejs', {
        title: 'Atur Barang Penjualan',
        role,
        goodsId: req.params.id,
        accName,
        hotel,
        updatedBy,
        updatedAt
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async goodsSales(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('goods-sales.ejs', {
        title: 'Tambah Data Pembelian Barang',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async transactions(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('transactions.ejs', {
        title: 'Daftar Transaksi Hotel',
        query: req.query,
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async transactionDetail(req, res) {
    const { role, name: accName } = req.session.user
    const { id } = req.params

    try {
      const resTransaction = await transactionService.getTransactionById(id)

      const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)
      const hotel = await this._getHotelInfo()
      const credits = await creditService.getCreditTransactionsBySettledId(id)

      let salesTotal = 0
      if (resSales.length) {
        salesTotal = resSales.reduce((a, b) => {
          return a + b.price * b.quantity
        }, 0)
      }

      const sales = {
        total: salesTotal,
        data: resSales
      }

      await res.render('transactions-detail.ejs', {
        title: 'Detail Transaksi',
        role,
        transaction: resTransaction,
        sales,
        credits,
        addSeparator,
        calculateNights,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/transaction')
    }
  }

  async invoice(req, res) {
    const { role, name: accName } = req.session.user

    const { id } = req.params

    try {
      const resTransaction = await transactionService.getTransactionById(id)
      const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)
      const hotel = await this._getHotelInfo()

      let salesTotal = 0
      if (resSales.length) {
        salesTotal = resSales.reduce((a, b) => {
          return a + b.price * b.quantity
        }, 0)
      }
      const sales = {
        total: salesTotal,
        data: resSales
      }
      const nightQty = calculateNights(resTransaction.startDate, resTransaction.endDate)
      resTransaction.roomPrice = resTransaction.totalRoom / nightQty

      res.render('invoice.ejs', {
        layout: 'partials/auth-layout',
        title: 'Bill Hotel',
        role,
        transaction: resTransaction,
        sales,
        addSeparator,
        calculateNights,
        moment,
        accName,
        hotel,
        capitalized
      })
    } catch (error) {
      res.redirect('/transaction')
    }
  }

  async invoiceMeetingRoom(req, res) {
    const { role, name: accName } = req.session.user

    const { id } = req.params

    try {
      const resTransaction = await transactionService.getTransactionById(id)
      const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)
      const hotel = await this._getHotelInfo()

      let salesTotal = 0
      if (resSales.length) {
        salesTotal = resSales.reduce((a, b) => {
          return a + b.price * b.quantity
        }, 0)
      }
      const sales = {
        total: salesTotal,
        data: resSales
      }

      const nightQty = calculateNights(resTransaction.startDate, resTransaction.endDate)
      resTransaction.roomPrice = resTransaction.totalRoom / nightQty

      const adjustDate = (date) => {
        const day = date.getDate()
        date.setDate(day - 1)
        return new Date(date)
      }

      const endDate = adjustDate(new Date(resTransaction.endDate))

      res.render('invoice-mr.ejs', {
        layout: 'partials/auth-layout',
        title: 'Bill Hotel',
        role,
        transaction: resTransaction,
        sales,
        addSeparator,
        calculateNights,
        moment,
        accName,
        hotel,
        capitalized,
        endDate
      })
    } catch (error) {
      console.log(error)
      res.redirect('/transaction')
    }
  }

  async invoiceHistoric(req, res) {
    const { role, name: accName } = req.session.user

    const { id } = req.params

    try {
      const resTransaction = await transactionService.getTransactionById(id)
      const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)
      const hotel = await this._getHotelInfo()

      let salesTotal = 0
      if (resSales.length) {
        salesTotal = resSales.reduce((a, b) => {
          return a + b.price * b.quantity
        }, 0)
      }

      const sales = {
        total: salesTotal,
        data: resSales
      }
      const nightQty = calculateNights(resTransaction.startDate, resTransaction.endDate)
      resTransaction.roomPrice = resTransaction.totalRoom / nightQty
      res.render('invoice-historic.ejs', {
        layout: 'partials/auth-layout',
        title: 'Bill Hotel Historis',
        role,
        transaction: resTransaction,
        sales,
        addSeparator,
        calculateNights,
        moment,
        accName,
        hotel,
        capitalized
      })
    } catch (error) {
      res.redirect('/transaction')
    }
  }

  async transactionReport(req, res) {
    const { role, name: accName } = req.session.user

    const { limit, start, end, search } = req.query

    try {
      const reports = await transactionService.transactionsReport(limit, search, start, end)
      const hotel = await this._getHotelInfo()

      let total = 0
      if (reports.length) {
        total = reports.reduce((a, b) => {
          return a + b.grandTotal
        }, 0)
      }
      const creditGrandTotal = reports.reduce((a, b) => {
        return a + b.totalCredit
      }, 0)

      res.render('transaction-report.ejs', {
        title: 'Laporan Transaksi',
        role,
        reports,
        creditGrandTotal,
        addSeparator,
        total,
        query: req.query,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/transaction')
    }
  }

  async transactionReportPrint(req, res) {
    const { role, name: accName } = req.session.user

    const { limit, start, end, search } = req.query

    try {
      const reports = await transactionService.transactionsReport(limit, search, start, end, 'ASC')
      const hotel = await this._getHotelInfo()

      let total = 0
      if (reports.length) {
        total = reports.reduce((a, b) => {
          return a + b.grandTotal
        }, 0)
      }
      res.render('transaction-report-print.ejs', {
        title: 'Laporan Transaksi',
        layout: 'partials/print-layout',
        role,
        reports,
        addSeparator,
        total,
        query: req.query,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/transaction')
    }
  }

  async posReport(req, res) {
    const { role, name: accName } = req.session.user
    const { limit, start, end, search } = req.query

    try {
      const reports = await goodsSalesService.getGoodsSales(limit, search, start, end)
      const hotel = await this._getHotelInfo()

      const total = reports.reduce((a, b) => {
        return a + b.totalSales
      }, 0)

      res.render('pos-report.ejs', {
        title: 'Laporan POS',
        role,
        reports,
        addSeparator,
        query: req.query,
        accName,
        hotel,
        total
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async posReportPrint(req, res) {
    const { role, name: accName } = req.session.user
    const { limit, start, search, end } = req.query

    try {
      const reports = await goodsSalesService.getGoodsSales(limit, search, start, end, 'DESC')
      const hotel = await this._getHotelInfo()

      const total = reports.reduce((a, b) => {
        return a + b.totalSales
      }, 0)

      res.render('pos-report-print.ejs', {
        title: 'Laporan POS',
        layout: 'partials/print-layout.ejs',
        role,
        reports,
        addSeparator,
        query: req.query,
        accName,
        hotel,
        total
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async accounts(req, res) {
    const { role, name: accName } = req.session.user
    const { search } = req.query

    try {
      const accounts = await accountsService.getAccounts(search)
      const hotel = await this._getHotelInfo()

      res.render('account.ejs', {
        title: 'Manajemen Akun',
        role,
        accName,
        accounts,
        query: req.query,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async accountDetail(req, res) {
    const { role, name: accName } = req.session.user
    const { id } = req.params
    try {
      const account = await accountsService.getAccountById(id)
      const hotel = await this._getHotelInfo()

      res.render('account-detail.ejs', {
        title: 'Ubah Akun',
        role,
        accName,
        account,
        id,
        hotel
      })
    } catch (error) {
      res.redirect('/account')
    }
  }

  async credential(req, res) {
    const { role, name: accName } = req.session.user

    try {
      const hotel = await this._getHotelInfo()

      res.render('credential.ejs', {
        title: 'Atur Kredensial',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async resetCredential(req, res) {
    const { role, name: accName } = req.session.user

    try {
      const hotel = await this._getHotelInfo()

      res.render('reset-credential.ejs', {
        title: 'Reset Kredensial',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async logs(req, res) {
    const { limit } = req.query
    const { role, name: accName } = req.session.user

    try {
      const logs = await logService.getLogs(limit)
      const hotel = await this._getHotelInfo()

      res.render('logs.ejs', {
        title: 'Log Aktivitas',
        role,
        accName,
        logs,
        query: req.query,
        hotel,
        moment
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async roomAvailability(req, res) {
    const { role, name: accName } = req.session.user
    const { start, end } = req.query

    try {
      let rooms = []
      const roomsList = await bookingService.getBookInfoByDateAvailability(start, end)
      if (roomsList.length) {
        rooms = roomsList
      }
      const hotel = await this._getHotelInfo()

      res.render('room-availability.ejs', {
        title: 'Cek Ketersediaan Kamar',
        role,
        accName,
        rooms,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async printActiveRoom(req, res) {
    const { role, name: accName } = req.session.user

    try {
      const response = await bookingService.getBookInfoByCheckOut(100)
      const hotel = await this._getHotelInfo()

      res.render('print-active-guest.ejs', {
        title: 'Cetak Tamu Aktif',
        layout: 'partials/print-layout.ejs',
        role,
        accName,
        response,
        hotel
      })
    } catch (error) {
      res.redirect('/checkout')
    }
  }

  async activeRoomTotal(req, res) {
    const { role, name: accName } = req.session.user
    const { start, end, limit } = req.query

    try {
      const response = await bookingService.getBookInfoByCheckOutExt(limit, start, end, '')
      const calculateRoomTotal = this._calculateActiveRoomTotals(response)

      const hotel = await this._getHotelInfo()

      res.render('active-room-total.ejs', {
        title: 'Total Kamar Aktif',
        layout: 'partials/print-layout.ejs',
        role,
        accName,
        response,
        hotel,
        query: req.query,
        calculateRoomTotal,
        addSeparator
      })
    } catch (error) {
      res.redirect('/checkout')
    }
  }

  async printDirtyRoom(req, res) {
    const { role, name: accName } = req.session.user

    try {
      const response = (await roomService.getRoomsDirty()).data
      const hotel = await this._getHotelInfo()

      res.render('print-dirty-room.ejs', {
        title: 'Cetak Kamar Kotor',
        layout: 'partials/print-layout.ejs',
        role,
        accName,
        response,
        hotel
      })
    } catch (error) {
      res.redirect('/room')
    }
  }

  async hotelInfo(req, res) {
    const { role, name: accName } = req.session.user

    try {
      const hotel = await this._getHotelInfo()

      res.render('hotel-info.ejs', {
        title: 'Informasi Dasar Hotel',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async supplies(req, res) {
    const { search, limit, start, end } = req.query
    const { role, name: accName } = req.session.user

    try {
      const goods = await goodsService.getGoods('', 999999)
      const supplies = await supplyService.getSupplies(search, limit, start, end)
      const hotel = await this._getHotelInfo()

      res.render('supplies.ejs', {
        title: 'Kelola Barang Masuk',
        goods,
        supplies,
        role,
        accName,
        hotel,
        addSeparator,
        query: req.query,
        moment
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async suppliesPrint(req, res) {
    const { search, limit, start, end } = req.query
    const { role, name: accName } = req.session.user

    try {
      const goods = await goodsService.getGoods()
      const supplies = await supplyService.getSupplies(search, limit, start, end, 'ASC')
      const suppliesTotal = supplies.reduce((a, b) => {
        return a + b.price
      }, 0)
      const hotel = await this._getHotelInfo()

      res.render('print-supplies.ejs', {
        title: 'Kelola Barang Masuk',
        layout: 'partials/print-layout.ejs',
        goods,
        supplies,
        role,
        accName,
        hotel,
        addSeparator,
        query: req.query,
        moment,
        suppliesTotal
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async cancelReport(req, res) {
    const { role, name: accName } = req.session.user

    const { limit, start, end, search } = req.query

    try {
      const cancels = await cancelledService.getCancelled(search, limit, start, end)

      const hotel = await this._getHotelInfo()

      let total = 0
      if (cancels.length) {
        total = cancels.reduce((a, b) => {
          return a + b.paid
        }, 0)
      }
      res.render('cancelled-bookings.ejs', {
        title: 'Laporan Booking Batal',
        role,
        cancels,
        addSeparator,
        total,
        query: req.query,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async cancelReportPrint(req, res) {
    const { role, name: accName } = req.session.user

    const { limit, start, end, search } = req.query

    try {
      const cancels = await cancelledService.getCancelled(search, limit, start, end, 'ASC')

      const hotel = await this._getHotelInfo()

      let total = 0
      if (cancels.length) {
        total = cancels.reduce((a, b) => {
          return a + b.paid
        }, 0)
      }
      res.render('cancelled-bookings-print.ejs', {
        title: 'Laporan Booking Batal',
        layout: 'partials/print-layout.ejs',
        role,
        cancels,
        addSeparator,
        total,
        query: req.query,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async logisticBalance(req, res) {
    const { role, name: accName } = req.session.user
    const { search, limit, start, end } = req.query

    try {
      const hotel = await this._getHotelInfo()
      const balance = await logisticBalanceService.getBalance()
      const balanceLogs = await balanceLogsService.getBalanceLogs(search, limit, start, end)

      res.render('logistic-balance.ejs', {
        title: 'Saldo Logistik',
        hotel,
        role,
        accName,
        balance,
        addSeparator,
        balanceLogs,
        moment,
        query: req.query
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async logisticBalancePrint(req, res) {
    const { role, name: accName } = req.session.user
    const { search, limit, start, end } = req.query

    try {
      const hotel = await this._getHotelInfo()
      const balance = await logisticBalanceService.getBalance()
      const balanceLogs = await balanceLogsService.getBalanceLogs(search, limit, start, end, 'ASC')

      res.render('logistic-balance-print.ejs', {
        title: 'Cetak Riwayat Saldo',
        layout: 'partials/print-layout.ejs',
        hotel,
        role,
        accName,
        balance,
        addSeparator,
        balanceLogs,
        moment,
        query: req.query
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async roomTransactionLogs(req, res) {
    const { role, name: accName } = req.session.user
    const { start, end, limit } = req.query
    const hotel = await this._getHotelInfo()

    const roomTransactionLogs = await roomTransactionLogsService.getRoomTransactionsLogs(start, end, limit)
    let total = 0
    if (roomTransactionLogs.length) {
      total = roomTransactionLogs.reduce((a, b) => {
        return a + b.paid
      }, 0)
    }
    try {
      return res.render('room-transaction-logs-print.ejs', {
        title: 'Logs Transaksi Kamar',
        layout: 'partials/print-layout.ejs',
        hotel,
        role,
        accName,
        addSeparator,
        query: req.query,
        roomTransactionLogs,
        total
      })
    } catch (error) {
      console.log(error)
      return res.redirect('/report')
    }
  }

  async extendsRoom(req, res) {
    const { role, name: accName } = req.session.user
    const { id } = req.params
    const hotel = await this._getHotelInfo()
    try {
      const detail = await bookingService.getBookInfoById(id)
      const { category } = await roomService.getRoomById(detail.room)
      const { price } = await roomCatService.getRoomById(category)
      const initialNight = calculateNights(detail.startDate, detail.endDate)
      const { number } = await roomService.getRoomById(detail.room)

      detail.roomNumber = number

      return res.render('extends-room.ejs', {
        title: 'Atur Durasi Menginap Tamu',
        hotel,
        role,
        accName,
        addSeparator,
        detail,
        price,
        initialNight
      })
    } catch (error) {
      console.log(error)
      return res.redirect('/')
    }
  }

  async creditPopup(req, res) {
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      res.render('credit-popup.ejs', {
        layout: 'partials/auth-layout',
        title: 'Tambahkan Tagihan Baru',
        role,
        accName,
        hotel
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async creditPopupEdit(req, res) {
    const { creditId } = req.params
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()

      const credit = await creditService.getCreditById(creditId)
      const due = toInputDate(new Date(credit.due))

      res.render('credit-popup-edit.ejs', {
        layout: 'partials/auth-layout',
        title: 'Perbaharui Detail Tagihan',
        role,
        accName,
        hotel,
        credit,
        due
      })
    } catch (error) {
      res.redirect('/')
    }
  }

  async creditList(req, res) {
    const { search, limit, start, end } = req.query

    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const credits = await creditService.getCredits(search, limit, start, end)

      res.render('credits-list.ejs', {
        title: 'Daftar Kredit',
        role,
        accName,
        hotel,
        credits,
        query: req.query,
        formatISODate
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async creditDetail(req, res) {
    const { creditId } = req.params
    try {
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const credit = await creditService.getCreditById(creditId)

      const totalAmount = credit.transactions.reduce((a, b) => {
        return a + b.amount
      }, 0)

      res.render('credit-detail.ejs', {
        title: 'Detail Kredit',
        role,
        accName,
        hotel,
        credit,
        formatISODate,
        addSeparator,
        totalAmount
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async creditDetailPrint(req, res) {
    const { creditId } = req.params
    const { rows } = req.query
    let rowsArr = []
    const notes = []

    try {
      if (rows) {
        rowsArr = this._parseRows(rows)
      }
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const credit = await creditService.getCreditById(creditId)

      let transactions = credit.transactions

      if (rows) {
        transactions = transactions.filter((trx) => rowsArr.includes(trx.settledId))
      }

      const transactionsMapped = await Promise.all(
        transactions.map(async (trx) => {
          const resTransaction = await transactionService.getTransactionById(trx.settledTransaction)
          const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)

          const resLivePriceTotal = resSales.reduce((accum, curr) => {
            return accum + curr.total
          }, 0)
          if (resLivePriceTotal !== resTransaction.totalSales) {
            notes.push({
              in: resTransaction.id,
              case: `Nilai POS tidak sesuai karena mungkin ada perubahan data harga: Seharusnya total POS bernilai ${addSeparator(
                resTransaction.totalSales
              )} namun didapatkan ${addSeparator(resLivePriceTotal)}`
            })
          }

          const nightQty = calculateNights(resTransaction.startDate, resTransaction.endDate)

          return {
            ...trx,
            bookingDetail: {
              ...resTransaction,
              nightQty
            },
            posInfo: resSales
          }
        })
      )

      const totalAmount = transactions.reduce((a, b) => {
        return a + b.amount
      }, 0)
      const totalPaid = transactions.reduce((a, b) => {
        return a + b.paid
      }, 0)

      res.render('credit-detail-print.ejs', {
        title: 'Cetak Detail Kredit',
        layout: 'partials/print-layout',
        role,
        accName,
        hotel,
        credit,
        formatISODate,
        formatDate,
        addSeparator,
        totalAmount,
        transactions: transactionsMapped,
        totalPaid,
        moment,
        notes,
        rows
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async creditDetailPrintHistoric(req, res) {
    const { creditId } = req.params
    const { rows } = req.query
    let rowsArr = []

    try {
      if (rows) {
        rowsArr = this._parseRows(rows)
      }
      const { role, name: accName } = req.session.user
      const hotel = await this._getHotelInfo()
      const credit = await creditService.getCreditById(creditId)

      let transactions = credit.transactions

      if (rows) {
        transactions = transactions.filter((trx) => rowsArr.includes(trx.settledId))
      }

      const transactionsMapped = await Promise.all(
        transactions.map(async (trx) => {
          const resTransaction = await transactionService.getTransactionById(trx.settledTransaction)
          const resSales = await goodsSalesService.getGoodsSalesByBooking(resTransaction.bookingId)

          const nightQty = calculateNights(resTransaction.startDate, resTransaction.endDate)

          return {
            ...trx,
            bookingDetail: {
              ...resTransaction,
              nightQty
            },
            posInfo: resSales
          }
        })
      )

      const totalAmount = transactions.reduce((a, b) => {
        return a + b.amount
      }, 0)
      const totalPaid = transactions.reduce((a, b) => {
        return a + b.paid
      }, 0)

      res.render('credit-detail-print-historic.ejs', {
        title: 'Cetak Detail Kredit',
        layout: 'partials/print-layout',
        role,
        accName,
        hotel,
        credit,
        formatISODate,
        formatDate,
        addSeparator,
        totalAmount,
        transactions: transactionsMapped,
        totalPaid,
        moment
      })
    } catch (error) {
      console.log(error)
      res.redirect('/')
    }
  }

  async _getHotelInfo() {
    const hotel = await hotelInfoService.getHotelInfo()
    return hotel
  }

  _parseRows(rows) {
    return String(rows).split('_')
  }

  _calculateActiveRoomTotals(data) {
    return data.reduce(
      (acc, item) => {
        acc.roomTotal += item.totalUsedRoom || 0
        acc.extraTotal += item.totalExtra || 0
        return acc
      },
      { roomTotal: 0, extraTotal: 0 }
    )
  }
}

module.exports = Dashboard
