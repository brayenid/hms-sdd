/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('logs', {
    id: 'SERIAL PRIMARY KEY',
    cases: {
      type: 'TEXT',
      notNull: true
    },
    created_by: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"accounts"',
      onDelete: 'cascade'
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('logs')
}
