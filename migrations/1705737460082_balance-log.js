/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('balance_log', {
    id: 'SERIAL PRIMARY KEY',
    detail: {
      type: 'TEXT',
      default: '-'
    },
    amount: {
      type: 'INTEGER',
      notNull: true
    },
    action: {
      type: 'VARCHAR(5)',
      notNull: true
    },
    last_balance: {
      type: 'INTEGER',
      notNull: true
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
  pgm.dropTable('balance_log')
}
