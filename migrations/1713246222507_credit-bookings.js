/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('credit_transactions', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    credit: {
      type: 'VARCHAR(20)',
      references: '"credits"',
      notNull: true,
      onDelete: 'CASCADE'
    },
    settled_transaction: {
      type: 'VARCHAR(20)',
      references: '"settled_transactions"',
      notNull: true,
      onDelete: 'CASCADE'
    },
    amount: {
      type: 'INT',
      notNull: true
    },
    paid: {
      type: 'INT',
      notNull: true
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
  pgm.dropTable('credit_transactions')
}
