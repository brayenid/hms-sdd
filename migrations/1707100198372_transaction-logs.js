/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('room_transaction_logs', {
    id: 'SERIAL PRIMARY KEY',
    booking: {
      type: 'VARCHAR(40)',
      notNull: true
    },
    paid: {
      type: 'INTEGER',
      notNull: true
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('room_transaction_logs')
}
