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

const logger = require('./globals/logger')
const errorViewer = require('./controllers/_logs/error')

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

cron.schedule('10 15 * * *', async () => {
  try {
    await backupDb('backup', 7)
  } catch (err) {
    console.error('Cron Error (backup):', err)
  }
})

cron.schedule('10 15 * * *', async () => {
  try {
    await clearOldLogs()
  } catch (err) {
    console.error('Cron Error (log cleanup):', err)
  }
})

app.get('/dev/logs', errorViewer)

app.use((err, req, res, next) => {
  logger.error({
    message: err.message ?? 'No message!',
    stack: err.stack ?? 'No Stack',
    route: req.originalUrl ?? 'No Original URL',
    time: new Date().toISOString()
  })

  return res.status(500).json({
    status: 'fail',
    message: err.message
  })
})

app.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log(`server is running on http://${config.host}:${config.port}`)
})
