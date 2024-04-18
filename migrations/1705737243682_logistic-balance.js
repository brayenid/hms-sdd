/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('logistic_balance', {
    id: {
      type: 'VARCHAR(10)',
      default: 'balance',
      primaryKey: true
    },
    balance: {
      type: 'INTEGER',
      default: 0
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  })

  pgm.sql(`
  INSERT INTO
    logistic_balance (balance)
  VALUES ('0')
  `)
}

exports.down = (pgm) => {
  pgm.dropTable('logistic_balance')
}
