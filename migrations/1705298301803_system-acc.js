/* eslint-disable */

exports.up = (pgm) => {
  pgm.sql(`
      INSERT INTO accounts (id, username, name, password, role)
      VALUES ('system', 'system', 'System', '$2a$10$7MTpVLl7Mnashh/zp6MAFOkcfRZBLfnI0KuMKDuZLepO4bmd3peIO', 'sudo')
      `)
}

exports.down = (pgm) => {
  pgm.sql(`
  DELETE FROM accounts WHERE id = 'system'
  `)
}
