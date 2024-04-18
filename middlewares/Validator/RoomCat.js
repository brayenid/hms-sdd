const validateRoomCatBody = (req, res, next) => {
  const { category, price } = req.body

  try {
    if (!category) {
      throw new Error('Nama kategori tidak boleh kosong')
    }

    if (category) {
      // Regex untuk memeriksa apakah ada spasi kosong dalam string
      const regex = /\S/

      // Menggunakan tes() untuk memeriksa apakah regex cocok dengan string
      const isWhitespaced = !regex.test(category)
      if (isWhitespaced) {
        throw new Error('Nama kategori tidak boleh kosong atau hanya mengandung spasi')
      }
    }

    if (!price) {
      throw new Error('Harga kategori tidak boleh kosong')
    }
    if (typeof price !== 'number') {
      throw new Error('Harga kategori haruslah bertipe angka')
    }
    if (price <= 1000) {
      throw new Error('Harga kategori tidak boleh kurang dari 1000')
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
  validateRoomCatBody
}
