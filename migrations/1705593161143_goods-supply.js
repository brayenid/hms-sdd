/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('goods_supply', {
    id: 'SERIAL',
    goods: {
      type: 'VARCHAR(32)',
      references: '"goods"',
      notNull: true
    },
    quantity: {
      type: 'INTEGER',
      notNull: true
    },
    price: {
      type: 'INTEGER',
      notNull: true
    },
    supplier: {
      type: 'TEXT',
      default: 0
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
  pgm.dropTable('goods_supply')
}
