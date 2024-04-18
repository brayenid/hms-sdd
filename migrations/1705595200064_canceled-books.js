/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('cancelled_books', {
    id: 'SERIAL',
    booked_by: {
      type: 'TEXT',
      notNull: true
    },
    start_date: {
      type: 'VARCHAR(10)',
      notNull: true
    },
    end_date: {
      type: 'VARCHAR(10)',
      notNull: true
    },
    room: {
      type: 'VARCHAR(32)',
      references: '"rooms"'
    },
    paid: {
      type: 'INTEGER',
      default: 0
    },
    deposit: {
      type: 'INTEGER',
      default: 0
    },
    created_by: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"accounts"'
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('cancelled_books')
}
