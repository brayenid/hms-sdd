// logger.js
const { createLogger, format, transports } = require('winston')
const fs = require('fs')

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

const logger = createLogger({
  level: 'error',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.File({ filename: 'logs/error.log' })]
})

module.exports = logger
