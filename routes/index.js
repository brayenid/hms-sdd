const express = require('express')
const router = express.Router()

const SudoController = require('../controllers/sudo')
const AuthenticationController = require('../controllers/authentication')
const AuthMiddleware = require('../middlewares/Auth')
const AdminController = require('../controllers/admins')
const RoomCatController = require('../controllers/category')
const RoomController = require('../controllers/rooms')
const GuestController = require('../controllers/guests')

const { validateAdminBody, validatePatchBody } = require('../middlewares/Validator/Account')
const { validateRoomCatBody } = require('../middlewares/Validator/RoomCat')
const { validateRoomBody, validateRoomGet } = require('../middlewares/Validator/Rooms')
const BookingController = require('../controllers/bookings')
const { validateBookingBody } = require('../middlewares/Validator/Bookings')
const Dashboard = require('../controllers/views/main')
const ExtraPriceController = require('../controllers/extra-price')
const DepositController = require('../controllers/deposit')
const FinesController = require('../controllers/fines')
const GoodsController = require('../controllers/goods')
const GoodSalesController = require('../controllers/goods-sales')
const TransactionController = require('../controllers/transactions')
const LogsController = require('../controllers/logs')
const HotelInfoController = require('../controllers/hotel-info')
const SupplyController = require('../controllers/supply')
const BalanceLogController = require('../controllers/balance-logs')
const CreditController = require('../controllers/credits')

// CONTROLLERS
const sudoController = new SudoController()
const authenticationController = new AuthenticationController()
const adminController = new AdminController()
const roomCatController = new RoomCatController()
const roomController = new RoomController()
const guestController = new GuestController()
const bookingController = new BookingController()
const extraPriceController = new ExtraPriceController()
const depositController = new DepositController()
const finesController = new FinesController()
const goodsController = new GoodsController()
const goodsSalesController = new GoodSalesController()
const transactionsController = new TransactionController()
const logsController = new LogsController()
const hotelInfoController = new HotelInfoController()
const supplyController = new SupplyController()
const balanceLogController = new BalanceLogController()
const creditController = new CreditController()

// MIDDLEWARES
const authMiddleware = new AuthMiddleware()
const authMiddlewareSudo = new AuthMiddleware('sudo')
const authMiddlewareSudoView = new AuthMiddleware('sudo', 'view')
const authMiddlewareFD = new AuthMiddleware('frontdesk')
const authMiddlewareFDView = new AuthMiddleware('frontdesk', 'view')
const authMiddlewareManager = new AuthMiddleware('manager')
const authMiddlewareManagerView = new AuthMiddleware('manager', 'view')
const authMiddlewareLogistic = new AuthMiddleware('logistic')
const authMiddlewareLogisticView = new AuthMiddleware('logistic', 'view')

// VIEWS
const dashboard = new Dashboard()

// ACCOUNTS
router.get('/api/sudo/create', sudoController.addAccount)
router.patch('/api/sudo/credential', authMiddlewareSudo.validateStrict, validatePatchBody, sudoController.patchPassword)
router.post('/api/sudo/admin', authMiddlewareSudo.validateStrict, validateAdminBody, sudoController.addAdmin)
router.delete('/api/sudo/admin/:id', authMiddlewareSudo.validateStrict, sudoController.removeAccount)
router.put('/api/sudo/admin/:id', authMiddlewareSudo.validateStrict, sudoController.putAdmin)
router.patch('/api/sudo/admin/credential', authMiddlewareSudo.validateStrict, adminController.patchPasswordById)

router.post('/api/auth', authenticationController.addSession)
router.delete('/api/auth', authenticationController.removeSession)

router.get('/api/sudo/reset', sudoController.resetSudo)

router.patch('/api/admin/credential', authMiddleware.validateSession, validatePatchBody, adminController.patchPassword)

// ROOMS CATEGORY
router.post('/api/rooms/category', authMiddlewareFD.validate, validateRoomCatBody, roomCatController.addRoomCategory)
router.put(
  '/api/rooms/category/:catId',
  authMiddlewareFD.validate,
  validateRoomCatBody,
  roomCatController.putRoomCategory
)
router.delete('/api/rooms/category/:catId', authMiddlewareFD.validate, roomCatController.removeRoomCategory)
router.get('/api/rooms/category', authMiddlewareFD.validate, roomCatController.getCategories)
router.get('/api/rooms/category/:catId', authMiddlewareFD.validate, roomCatController.getCategoryById)

// ROOMS
router.post('/api/rooms', authMiddlewareFD.validate, validateRoomBody, roomController.addRoom)
router.put('/api/rooms/:roomId', authMiddlewareFD.validate, validateRoomBody, roomController.putRoom)
router.delete('/api/rooms/:roomId', authMiddlewareFD.validate, roomController.removeRoom)
router.get('/api/rooms', authMiddlewareFD.validate, validateRoomGet, roomController.getRooms)
router.get('/api/rooms/:roomId', authMiddlewareFD.validate, roomController.getRoomById)
router.patch('/api/rooms/cleaniness/:roomId', authMiddlewareFD.validate, roomController.setRoomCleaniness)

// GUESTS
router.post('/api/guests', authMiddlewareFD.validate, guestController.addGuest)
router.put('/api/guests/:guestId', authMiddlewareFD.validate, guestController.updateGuest)
router.get('/api/guests', authMiddlewareFD.validate, guestController.getGuests)
router.delete('/api/guests/:guestId', authMiddlewareFD.validate, guestController.removeGuest)

// BOOKINGS
router.post('/api/bookings', authMiddlewareFD.validate, validateBookingBody, bookingController.addBooking)
router.get('/api/bookings/detail/:bookId', authMiddlewareFD.validate, bookingController.getBookingById)
router.patch('/api/bookings/:bookId', authMiddlewareFD.validate, bookingController.patchBooking)
router.delete('/api/bookings/:bookId', authMiddlewareFD.validate, bookingController.removeBooking)
router.get('/api/bookings/validate', authMiddlewareFD.validate, bookingController.getBookingInfo)
router.get('/api/bookings/rooms/:roomId', authMiddlewareFD.validate, bookingController.getBookingInfoByRoom)
router.get('/api/bookings/date', authMiddlewareFD.validate, bookingController.getBookingInfoByDate)
router.get(
  '/api/bookings/date/availability',
  authMiddlewareFD.validate,
  bookingController.getBookingInfoByDateAvailability
)
router.get('/api/bookings/checkin', authMiddlewareFD.validate, bookingController.getBookInfoByCheckIn)
router.get('/api/bookings/statistic', authMiddlewareFD.validate, bookingController.bookingStatistic)
router.get('/api/bookings/checkout', authMiddlewareFD.validate, bookingController.getBookInfoByCheckOut)
router.get('/api/bookings/active', authMiddlewareFD.validate, bookingController.getActiveBookings)
router.patch('/api/bookings/checkin/:bookId', authMiddlewareFD.validate, bookingController.checkInBooking)
router.patch('/api/bookings/checkout/:bookId', authMiddlewareFD.validate, bookingController.checkOutBooking)
router.patch('/api/bookings/checkout/room/:bookId', authMiddlewareFD.validate, bookingController.patchCheckOutRoom)
router.get(
  '/api/bookings/availability/extends/:id',
  authMiddlewareFD.validate,
  bookingController.getBookingInfoByDateForExtends
)
router.patch('/api/bookings/extends/room', authMiddlewareFD.validate, bookingController.extendRoom)
router.patch('/api/bookings/payoff/:bookingId', authMiddlewareFD.validate, bookingController.payOffBook)
router.patch('/api/bookings/checkin/undo/:bookId', authMiddlewareManager.validate, bookingController.undoCheckIn) // NEW
router.patch('/api/bookings/checkout/undo/:bookId', authMiddlewareSudo.validateStrict, bookingController.undoCheckOut) // NEW

// EXTRA PRICE
router.put('/api/extraprice', authMiddlewareSudo.validateStrict, extraPriceController.putExtraPrice)
router.get('/api/extraprice', authMiddlewareSudo.validateStrict, extraPriceController.getExtraPrice)

// DEPOSIT
router.put('/api/deposit', authMiddlewareSudoView.validateStrict, depositController.putDeposit)

// FINES
router.post('/api/fines', authMiddlewareManager.validate, finesController.addFine)
router.put('/api/fines/:id', authMiddlewareManager.validate, finesController.putFine)
router.get('/api/fines', authMiddlewareFD.validate, finesController.getFines)
router.get('/api/fines/:id', authMiddlewareFD.validate, finesController.getFineById)
router.delete('/api/fines/:id', authMiddlewareManager.validate, finesController.removeFine)

// GOODS
router.post('/api/goods', authMiddlewareLogistic.validate, goodsController.addGoods)
router.put('/api/goods/:id', authMiddlewareLogistic.validate, goodsController.putGoods)
router.get('/api/goods', authMiddleware.validateSession, goodsController.getGoodsList)
router.get('/api/goods/:id', authMiddleware.validateSession, goodsController.getGoodsById)
router.delete('/api/goods/:id', authMiddlewareLogistic.validate, goodsController.removeGoods)

// GOODS SALES
router.post('/api/sales', authMiddlewareFD.validate, goodsSalesController.addGoodsSales)
router.get('/api/sales', authMiddlewareFD.validate, goodsSalesController.getGoodsSales)
router.get('/api/sales/:bookingId', authMiddlewareFD.validate, goodsSalesController.getGoodsSalesByBooking)
router.delete('/api/sales/:salesId', authMiddlewareSudo.validateStrict, goodsSalesController.removeGoodsSales)

// TRANSACTIONS
router.get('/api/transactions', authMiddlewareFD.validate, transactionsController.getTransactions)
router.get('/api/transactions/:transactionId', authMiddlewareFD.validate, transactionsController.getTransactionById)
router.get('/transaction/statistic/freq', authMiddlewareFD.validate, transactionsController.getTransactionsFreq)
router.get('/transaction/statistic/total', authMiddlewareFD.validate, transactionsController.getTransactionsTotalMonth)

// LOGS
router.delete('/api/logs', authMiddlewareSudo.validateStrict, logsController.removeLogs)

// HOTEL INFO
router.put('/api/hotel/info', authMiddlewareSudo.validate, hotelInfoController.putHotelInfo)

// GOODS SUPPLY
router.post('/api/supplies', authMiddlewareLogistic.validateStrict, supplyController.addSupply)
router.delete('/api/supplies/:id', authMiddlewareLogistic.validateStrict, supplyController.removeSupply)

// BALANCE LOG
router.post('/api/balance-log', authMiddlewareLogistic.validateStrict, balanceLogController.addBalanceLog)

// CREDIT
router.post('/api/credit', authMiddlewareFD.validate, creditController.addCredit)
router.put('/api/credit/:creditId', authMiddlewareFD.validate, creditController.updateCredit)
router.delete('/api/credit/:creditId', authMiddlewareFD.validate, creditController.deleteCredit)
router.get('/api/credit', authMiddlewareFD.validate, creditController.getCredit)
router.post('/api/credit-transaction', authMiddlewareFD.validate, creditController.addCreditTransaction)
router.get('/api/credit/detail/:creditId', authMiddlewareFD.validate, creditController.getCreditById)
router.patch('/api/credit-transaction', authMiddlewareFD.validate, creditController.updateCreditTransaction)
router.delete('/api/credit-transaction/:creditId', authMiddlewareFD.validate, creditController.deleteCreditTransaction)

// VIEWS

// MAIN
router.get('/', authMiddlewareFDView.validate, dashboard.main)

// AUTH
router.get('/login', dashboard.login)

// ROOM CATS
router.get('/category', authMiddlewareFDView.validate, dashboard.roomCategory)
router.get('/category/:roomId', authMiddlewareFDView.validate, dashboard.roomCategoryDetail)

// ROOM
router.get('/room', authMiddlewareFDView.validate, dashboard.room)
router.get('/room/:roomId', authMiddlewareFDView.validate, dashboard.roomDetail)
router.get('/room-availability', authMiddlewareFDView.validate, dashboard.roomAvailability)
router.get('/print/room-dirty', authMiddlewareFDView.validate, dashboard.printDirtyRoom)

// BOOKING
router.get('/booking', authMiddlewareFDView.validate, dashboard.booking)

// GUEST
router.get('/popup/guest', authMiddlewareFDView.validate, dashboard.guestsPopup)
router.get('/guest', authMiddlewareFDView.validate, dashboard.guest)
router.get('/guest/:guestId', authMiddlewareFDView.validate, dashboard.guestDetail)

// CHECK IN
router.get('/checkin', authMiddlewareFDView.validate, dashboard.checkIn)
router.get('/checkin/:id', authMiddlewareFDView.validate, dashboard.checkInDetail)

// CHECK OUT
router.get('/checkout', authMiddlewareFDView.validate, dashboard.checkOut)
router.get('/checkout/:id', authMiddlewareFDView.validate, dashboard.checkOutDetail)
router.get('/print/checkout/', authMiddlewareFDView.validate, dashboard.printActiveRoom)
router.get('/total/checkout/', authMiddlewareFDView.validate, dashboard.activeRoomTotal)

// EXTRA
router.get('/extraprice', authMiddlewareSudoView.validateStrict, dashboard.extraPrice)

// DEPOSIT
router.get('/deposit', authMiddlewareSudoView.validateStrict, dashboard.deposit)

// FINES
router.get('/fine', authMiddlewareManagerView.validate, dashboard.fines)
router.get('/fine/:id', authMiddlewareManagerView.validate, dashboard.finesDetail)

// GOODS
router.get('/goods', authMiddlewareLogisticView.validate, dashboard.goods)
router.get('/goods-print', authMiddlewareLogisticView.validate, dashboard.goodsPrint)
router.get('/goods/:id', authMiddlewareLogisticView.validate, dashboard.goodsDetail)

// GOODS SALES (POS)
router.get('/pos', authMiddlewareFDView.validate, dashboard.goodsSales)

// TRANSACTIONS
router.get('/transaction', authMiddlewareFDView.validate, dashboard.transactions)
router.get('/transaction/:id', authMiddlewareFDView.validate, dashboard.transactionDetail)
router.get('/transaction/:id/print/historic', authMiddlewareFDView.validate, dashboard.invoiceHistoric)
router.get('/transaction/:id/print', authMiddlewareFDView.validate, dashboard.invoice)
router.get('/transaction/:id/print/mr', authMiddlewareFDView.validate, dashboard.invoiceMeetingRoom)

// REPORTS
router.get('/report', authMiddlewareManagerView.validate, dashboard.transactionReport)
router.get('/print/report', authMiddlewareManagerView.validate, dashboard.transactionReportPrint)
router.get('/pos-report', authMiddlewareManagerView.validate, dashboard.posReport)
router.get('/print/pos-report', authMiddlewareManagerView.validate, dashboard.posReportPrint)

// ACCOUNTS
router.get('/account', authMiddlewareSudoView.validateStrict, dashboard.accounts)
router.get('/account/:id', authMiddlewareSudoView.validateStrict, dashboard.accountDetail)

// CREDENTIAL
router.get('/credential', authMiddlewareSudoView.validateStrict, dashboard.credential)
router.get('/reset-credential', authMiddlewareSudoView.validate, dashboard.resetCredential)

// LOGS
router.get('/log', authMiddlewareSudoView.validateStrict, dashboard.logs)

// HOTEL INFO
router.get('/hotel-info', authMiddlewareManagerView.validate, dashboard.hotelInfo)

// SUPPLIER
router.get('/supplies', authMiddlewareLogisticView.validate, dashboard.supplies)
router.get('/supplies-print', authMiddlewareLogisticView.validate, dashboard.suppliesPrint)

// CANCELLED BOOKING
router.get('/cancelled', authMiddlewareFDView.validate, dashboard.cancelReport)
router.get('/cancelled-print', authMiddlewareFDView.validate, dashboard.cancelReportPrint)

// LOGISTIC BALANCE
router.get('/balance', authMiddlewareLogisticView.validate, dashboard.logisticBalance)
router.get('/balance-print', authMiddlewareLogisticView.validate, dashboard.logisticBalancePrint)

// ROOM TRANSACTION LOGS
router.get('/report/logs', authMiddlewareFDView.validate, dashboard.roomTransactionLogs)

// EXTENDS ROOM
router.get('/checkout/:id/extends', authMiddlewareFDView.validate, dashboard.extendsRoom)

// CREDITS
router.get('/popup/credit', authMiddlewareFDView.validate, dashboard.creditPopup)
router.get('/credits', authMiddlewareFDView.validate, dashboard.creditList)
router.get('/credits/detail/:creditId', authMiddlewareFDView.validate, dashboard.creditDetail)
router.get('/credits/detail/:creditId/edit', authMiddlewareFDView.validate, dashboard.creditPopupEdit)
router.get('/credits/detail/:creditId/print', authMiddlewareFDView.validate, dashboard.creditDetailPrint)
router.get(
  '/credits/detail/:creditId/print/historis',
  authMiddlewareFDView.validate,
  dashboard.creditDetailPrintHistoric
)

module.exports = router
