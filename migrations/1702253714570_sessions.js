exports.up = async (pgm) => {
  // Buat Tabel "session"
  await pgm.createTable('sessions', {
    sid: {
      type: 'varchar',
      notNull: true,
      primaryKey: true
    },
    sess: {
      type: 'json',
      notNull: true
    },
    expire: {
      type: 'timestamp(6)',
      notNull: true
    }
  })

  // Tambahkan Index pada Kolom "expire"
  await pgm.createIndex('sessions', 'expire')
}

exports.down = async (pgm) => {
  // Hapus Index pada Kolom "expire"
  await pgm.dropIndex('sessions', 'expire')

  // Hapus Tabel "session"
  await pgm.dropTable('sessions')
}
