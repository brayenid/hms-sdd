const { Pool } = require('pg')

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const pool = new Pool()

const clearOldLogs = async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - ONE_WEEK_IN_MILLISECONDS).toISOString()

    const deleteQuery = 'DELETE FROM logs WHERE created_at < $1'
    await pool.query(deleteQuery, [oneWeekAgo])
  } catch (error) {
    console.error('Error:', error)
  }
}
module.exports = { clearOldLogs }
