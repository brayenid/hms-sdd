/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('credits', {
    id: {
      type: 'VARCHAR(20)',
      primaryKey: true
    },
    creditor: {
      type: 'VARCHAR(32)',
      references: '"guests"',
      notNull: true
    },
    detail: {
      type: 'TEXT',
      default: 'No detail'
    },
    due: {
      type: 'TIMESTAMPTZ',
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
  pgm.dropTable('credits')
}
