/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('extra_price', {
    id: 'SERIAL PRIMARY KEY',
    extra: {
      type: 'TEXT',
      notNull: true
    },
    price: {
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
  pgm.dropTable('extra_price')
}
