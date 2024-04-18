/* eslint-disable */

exports.up = (pgm) => {
  pgm.createTable('accounts', {
    id: {
      type: 'VARCHAR(32)',
      primaryKey: true
    },
    username: {
      type: 'TEXT',
      notNull: true,
      unique: true
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    password: {
      type: 'TEXT',
      notNull: true
    },
    role: {
      type: 'VARCHAR(20)',
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
  pgm.dropTable('accounts')
}
