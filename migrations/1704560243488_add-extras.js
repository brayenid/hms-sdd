/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql("INSERT INTO extra_price (extra, price) VALUES ('person', 0)")
  pgm.sql("INSERT INTO extra_price (extra, price) VALUES ('bed', 0)")
  pgm.sql("INSERT INTO extra_price (extra, price) VALUES ('breakfast', 0)")
}

exports.down = (pgm) => {
  pgm.sql('DELETE FROM extra_price WHERE 1=1')
}
