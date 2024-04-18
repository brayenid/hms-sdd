/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('room_fines', {
    id: {
      type: 'VARCHAR(12)',
      primaryKey: true
    },
    fine: {
      type: 'TEXT',
      notNull: true
    },
    price: {
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
  pgm.dropTable('room_fines')
}
