/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('goods', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    name: {
      type: 'VARCHAR(20)',
      notNull: true
    },
    price: {
      type: 'INTEGER',
      notNull: true
    },
    stock: {
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
  pgm.dropTable('goods')
}
