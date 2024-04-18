/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('deposit', {
    id: 'SERIAL UNIQUE',
    name: {
      type: 'VARCHAR(10)',
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

  pgm.sql("INSERT INTO deposit(name, price) VALUES('deposit', 0)")
}

exports.down = (pgm) => {
  pgm.dropTable('deposit')
}
