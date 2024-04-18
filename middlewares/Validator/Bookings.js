const validateBookingBody = (req, res, next) => {
  const { startDate, endDate, bookedBy, room } = req.body

  try {
    if (!startDate) {
      throw new Error('Tanggal mulai tidak boleh kosong')
    }
    if (!endDate) {
      throw new Error('Tanggal akhir tidak boleh kosong')
    }
    if (startDate === endDate) {
      throw new Error('Tanggal check-in tidak boleh sama dengan tanggal check-out')
    }
    if (startDate > endDate) {
      throw new Error('Tanggal check-in tidak boleh lebih besar dari tanggal check-out')
    }
    if (!bookedBy) {
      throw new Error('Nama pemesan tidak boleh kosong')
    }
    if (!room) {
      throw new Error('Kamar tidak boleh kosong')
    }

    next()
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message
    })
  }
}

module.exports = {
  validateBookingBody
}
