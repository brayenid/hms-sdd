/* eslint-disable */
const generateId = require('../globals/idgenerator')
const config = require('../globals/config')

exports.up = (pgm) => {
  const id = `SUDO-${generateId(12)}`
  pgm.sql(`
        INSERT INTO accounts (id, username, name, password, role)
        VALUES ('${id}', '${config.sudo.username}', 'Super Admin', '$2a$10$Iecpuf9V4HsdQhudLyVLr.OyTWXBX0k2MTjs.qHx5002HKON1i1Jq', 'sudo')
        `)
}

exports.down = (pgm) => {}
