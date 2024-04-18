/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('rooms_cat', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true
    },
    category: {
      type: 'TEXT',
      notNull: true
    },
    price: {
      type: 'INTEGER',
      notNull: true
    },
    detail: {
      type: 'TEXT',
      default: '-'
    },
    created_by: {
      type: 'VARCHAR(32)',
      references: '"accounts"',
      notNull: true
    },
    updated_by: {
      type: 'VARCHAR(32)',
      references: '"accounts"',
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
  pgm.dropTable('rooms_cat')
}
