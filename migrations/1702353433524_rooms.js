/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('rooms', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    number: {
      type: 'INTEGER',
      notNull: true,
      unique: true
    },
    category: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"rooms_cat"'
    },
    smoking: {
      type: 'BOOLEAN',
      notNull: true
    },
    bed: {
      type: 'VARCHAR(15)',
      notNull: true
    },
    cleaned: {
      type: 'BOOLEAN',
      default: true
    },
    available: {
      type: 'BOOLEAN',
      default: true
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
  pgm.dropTable('rooms')
}
