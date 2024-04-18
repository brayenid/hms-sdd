const path = require('path')
const env = process.env.NODE_ENV?.trimEnd() || 'prod'

if (env === 'dev') {
  require('dotenv').config({
    path: path.resolve(process.cwd(), '.env')
  })
} else {
  require('dotenv').config({
    path: path.resolve(process.cwd(), '.env.production')
  })
}

const config = {
  host: process.env.HOST_APP,
  port: process.env.PORT_APP,
  session: {
    key: process.env.SESSION_KEY,
    name: process.env.SESSION_NAME
  },
  sudo: {
    username: process.env.USERNAME_APP,
    password: process.env.PASSWORD_APP
  },
  db: {
    sudo: {
      user: process.env.PG_SUDO_USER,
      password: process.env.PG_SUDO_PASS
    },
    dev: {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    }
  }
}

module.exports = config
