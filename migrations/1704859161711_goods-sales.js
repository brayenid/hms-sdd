/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('goods_sales', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    booking: {
      type: 'VARCHAR(40)',
      notNull: true
    },
    goods: {
      type: 'VARCHAR(32)',
      references: '"goods"'
    },
    quantity: {
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
  pgm.dropTable('goods_sales')
}
