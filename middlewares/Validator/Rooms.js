const validateRoomBody = (req, res, next) => {
  const { number, category, smoking, bed } = req.body

  try {
    if (!number) {
      throw new Error('Nomor kamar tidak boleh kosong')
    }

    if (!category) {
      throw new Error('Nama kategori tidak boleh kosong')
    }

    if (typeof smoking !== 'boolean') {
      throw new Error('Tipe smoking harus boolean')
    }

    if (!bed) {
      throw new Error('Tipe bed tidak boleh kosong')
    }

    next()
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message
    })
  }
}

const validateRoomGet = (req, res, next) => {
  const bedEnums = ['double', 'twin']

  try {
    if (req.query.bed && !bedEnums.includes(req.query.bed)) {
      throw new Error('Nilai bed harus twin atau double')
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
  validateRoomBody,
  validateRoomGet
}
