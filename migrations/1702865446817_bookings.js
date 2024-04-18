/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('bookings', {
    id: {
      type: 'VARCHAR(40)',
      primaryKey: true
    },
    guest: {
      type: 'VARCHAR(32)',
      default: '0'
    },
    booked_by: {
      type: 'TEXT',
      notNull: true
    },
    room: {
      type: 'VARCHAR(32)',
      notNull: true,
      references: '"rooms"'
    },
    start_date: {
      type: 'TEXT',
      notNull: true
    },
    end_date: {
      type: 'TEXT',
      notNull: true
    },
    deposit: {
      type: 'INTEGER',
      notNull: true
    },
    checked_in: {
      type: 'BOOLEAN',
      default: false
    },
    checked_out: {
      type: 'BOOLEAN',
      default: false
    },
    paid: {
      type: 'INTEGER',
      default: 0
    },
    source: {
      type: 'VARCHAR(20)',
      notNull: true
    },
    extra_person: {
      type: 'INTEGER',
      default: 0
    },
    extra_bed: {
      type: 'INTEGER',
      default: 0
    },
    extra_decor: {
      type: 'INTEGER',
      default: 0
    },
    extra_breakfast: {
      type: 'INTEGER',
      default: 0
    },
    total_room: {
      type: 'INTEGER',
      notNull: true
    },
    total_extra: {
      type: 'INTEGER',
      notNull: true
    },
    total_fines: {
      type: 'INTEGER',
      default: 0
    },
    discount: {
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
  pgm.dropTable('bookings')
}
