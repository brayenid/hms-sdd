const express = require('express')
const session = require('express-session')
const config = require('./globals/config')
const router = require('./routes')
const app = express()
const { Pool } = require('pg')
const expressEjsLayouts = require('express-ejs-layouts')
const { backupDb } = require('./globals/backuppg')
const PgSession = require('connect-pg-simple')(session)
const pgPool = new Pool()
const cron = require('node-cron')
const { clearOldLogs } = require('./globals/logs-control')

app.use(
  session({
    secret: config.session.key,
    name: config.session.name,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hrs
    },
    store: new PgSession({
      pool: pgPool,
      tableName: 'sessions'
    })
  })
)
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(expressEjsLayouts)
app.set('layout', 'partials/layout')
app.use(express.json())
app.use('/', router)
app.use((req, res) => {
  return res.status(404).json({
    status: 'fail',
    message: 'Resource invalid/unavailable'
  })
})

cron.schedule('0 15 * * *', () => {
  backupDb('backup', 7)
})

cron.schedule('0 15 * * *', async () => {
  clearOldLogs()
})

app.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log(`server is running on http://${config.host}:${config.port}`)
})
