/* eslint-disable */

exports.up = (pgm) => {
  pgm.addColumn('guests', {
    phone: {
      type: 'TEXT',
      default: '0'
    }
  })
}

exports.down = (pgm) => {
  pgm.dropColumn('guests', 'phone')
}
