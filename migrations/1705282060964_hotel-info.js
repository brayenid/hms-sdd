/* eslint-disable  */

exports.up = (pgm) => {
  pgm.createTable('hotel_info', {
    id: {
      type: 'VARCHAR(10)',
      unique: true,
      default: 'hotel-info'
    },
    name: {
      type: 'VARCHAR(18)',
      notNull: true
    },
    nickname: {
      type: 'VARCHAR(12)',
      notNull: true
    },
    address: {
      type: 'TEXT',
      notNull: true
    },
    city: {
      type: 'VARCHAR(25)',
      notNull: true
    },
    zip: {
      type: 'VARCHAR(10)',
      default: ''
    },
    phone: {
      type: 'VARCHAR(15)',
      notNull: true
    }
  })

  pgm.sql(`
  INSERT INTO hotel_info
  (name, nickname, address, city, zip, phone)
  VALUES 
  ('Hotel Kubar', 'Hotel Kubar', 'Barong Tongkok RT 00', 'Kutai Barat', '75576', '628222')
  `)
}

exports.down = (pgm) => {
  pgm.dropTable('hotel_info')
}
