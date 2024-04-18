const validateAdminBody = (req, res, next) => {
  const { username, password, name, role } = req.body

  try {
    const roles = ['frontdesk', 'manager', 'logistic']
    // USERNAME
    if (!username) {
      throw new Error('Username tidak boleh kosong')
    }
    if (username.length > 10) {
      throw new Error('Username tidak boleh lebih dari 10 karakter')
    }
    if (username.indexOf(' ') !== -1) {
      throw new Error('Username tidak boleh mengandung spasi')
    }

    // PASSWORD
    if (!password) {
      throw new Error('Password tidak boleh kosong')
    }
    if (password.length < 8) {
      throw new Error('Password minimal memiliki 8 karakter')
    }

    // NAME
    if (!name) {
      throw new Error('Nama tidak boleh kosong')
    }
    if (name.length > 18) {
      throw new Error('Nama tidak boleh lebih dari 18 karakter')
    }

    // ROLES
    roles.forEach((r) => {
      if (!roles.includes(role)) {
        throw new Error(`${role} bukan role yang valid`)
      }
    })

    next()
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message
    })
  }
}

const validatePatchBody = (req, res, next) => {
  const { newPassword } = req.body

  try {
    if (newPassword.length < 8) {
      throw new Error('Password minimal 8 karakter')
    }
    next()
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message
    })
  }
}

module.exports = { validateAdminBody, validatePatchBody }
