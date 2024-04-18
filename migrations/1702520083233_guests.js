/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('guests', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    identity_type: {
      type: 'TEXT',
      notNull: true
    },
    identity_number: {
      type: 'TEXT',
      notNull: true
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    gender: {
      type: 'TEXT',
      check: "gender IN ('male', 'female')",
      notNull: true
    },
    address: {
      type: 'TEXT',
      notNull: true
    },
    city: {
      type: 'TEXT',
      notNull: true
    },
    nationality: {
      type: 'TEXT',
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
  pgm.dropTable('guests')
}
