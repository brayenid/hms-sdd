const autoBind = require('auto-bind')
const AccountService = require('../../services/AccountService')

class AuthMiddleware {
  constructor(role, type) {
    this.service = new AccountService()
    this.role = role
    this.type = type

    autoBind(this)
  }

  async validateSession(req, res, next) {
    const { user } = req.session
    if (!user) {
      if (this.type === 'view') {
        return res.render('login')
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Anda tidak terautentikasi'
      })
    }

    next()
  }

  async validate(req, res, next) {
    const { user } = req.session
    if (!user) {
      if (this.type === 'view') {
        return res.redirect('/login')
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Anda tidak terautentikasi'
      })
    }

    if (user.role !== this.role && user.role !== 'manager' && user.role !== 'sudo') {
      if (this.type === 'view') {
        if (user.role === 'logistic') {
          return res.redirect('/goods')
        }
        return res.render('forbidden.ejs', {
          title: '403',
          layout: 'partials/auth-layout'
        })
      }
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak berhak mengakses layanan ini'
      })
    }

    try {
      await this.service.getAccountById(user.id)

      next()
    } catch (error) {
      if (this.type === 'view') {
        return res.render('login')
      }
      return res.status(400).json({
        status: 'fail',
        message: `Auth validation : ${error.message}`
      })
    }
  }

  async validateStrict(req, res, next) {
    const { user } = req.session
    if (!user) {
      if (this.type === 'view') {
        return res.redirect('/login')
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Anda tidak terautentikasi'
      })
    }

    if (user.role !== this.role && user.role !== 'sudo') {
      if (this.type === 'view') {
        if (user.role === 'logistic') {
          return res.redirect('/goods')
        }
        return res.render('forbidden.ejs', {
          title: '403',
          layout: 'partials/auth-layout'
        })
      }
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak berhak mengakses layanan ini'
      })
    }

    try {
      await this.service.getAccountById(user.id)

      next()
    } catch (error) {
      if (this.type === 'view') {
        return res.render('login')
      }
      return res.status(400).json({
        status: 'fail',
        message: `Auth validation : ${error.message}`
      })
    }
  }
}

module.exports = AuthMiddleware
