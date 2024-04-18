const { pool } = require('../db/pool')

const invoiceNumberGenerator = (input) => {
  // Pisahkan bagian huruf dan angka dari string
  const matches = input.match(/([a-zA-Z-]+)(\d*)/)
  const prefix = matches[1]
  let numberPart = matches[2] || '0'

  // Ubah angka menjadi bilangan bulat
  let number = parseInt(numberPart, 10)

  // Increment angka
  number++

  // Ubah kembali ke string dan tambahkan nol di depan jika perlu
  numberPart = number.toString().padStart(numberPart.length, '0')

  // Gabungkan kembali huruf dan angka
  const result = `${prefix}${numberPart}`

  return result
}

const getLatestInvoice = async () => {
  try {
    const settledTransaction = await pool.query(`
    SELECT id FROM settled_transactions ORDER BY id DESC LIMIT 1
    `)

    const credit = await pool.query(`
    SELECT id FROM credits ORDER BY id DESC LIMIT 1
    `)

    const stCurrentInv = settledTransaction.rows[0]?.id || 'INV-SDD-0000000'
    const creditCurrentInv = credit.rows[0]?.id || 'INV-SDD-0000000'

    const invoice = returnLatestInv(stCurrentInv, creditCurrentInv)

    return invoice
  } catch (error) {
    throw new Error(`Get latest invoice : ${error.message}`)
  }
}

const automaticInvoiceNumber = async () => {
  const latestInvoice = await getLatestInvoice()

  return latestInvoice
}

const invToNum = (input) => {
  // Pisahkan bagian huruf dan angka dari string
  const matches = input.match(/([a-zA-Z-]+)(\d*)/)
  const numberPart = matches[2] || '0'

  // Ubah angka menjadi bilangan bulat
  const number = parseInt(numberPart, 10)

  return number
}

const getPrefix = (input) => {
  const matches = input.match(/([a-zA-Z-]+)(\d*)/)
  return matches[1]
}

const getSerialLength = (input) => {
  const matches = input.match(/([a-zA-Z-]+)(\d*)/)
  return matches[2].length
}

const returnLatestInv = (input1, input2) => {
  // Pisahkan bagian huruf dan angka dari string
  const prefix = getPrefix(input1) || getPrefix(input2)
  let serialLength = getSerialLength(input1) || '0'

  const number1 = invToNum(input1)
  const number2 = invToNum(input2)

  const biggestNumber = Math.max(number1, number2)

  // Ubah angka menjadi bilangan bulat
  let number = parseInt(biggestNumber, 10)

  // Increment angka
  number++

  // Ubah kembali ke string dan tambahkan nol di depan jika perlu
  serialLength = number.toString().padStart(serialLength, '0')

  // Gabungkan kembali huruf dan angka
  const result = `${prefix}${serialLength}`

  return result
}

module.exports = {
  invoiceNumberGenerator,
  automaticInvoiceNumber
}
