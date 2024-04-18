/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('settled_transactions', {
    id: {
      type: 'VARCHAR(20)',
      primaryKey: true
    },
    booking: {
      type: 'VARCHAR(40)',
      notNull: true,
      references: '"bookings"'
    },
    total_room: {
      type: 'INTEGER',
      notNull: true
    },
    total_extra: {
      type: 'INTEGER',
      notNull: true
    },
    total_fines: {
      type: 'INTEGER',
      notNull: true
    },
    total_sales: {
      type: 'INTEGER',
      notNull: true
    },
    discount: {
      type: 'INTEGER',
      default: 0
    },
    created_by: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"accounts"'
    },
    updated_by: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"accounts"'
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
  pgm.dropTable('settled_transactions')
}
