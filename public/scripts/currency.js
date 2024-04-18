const addCurrency = (number, currency) => {
  const processed = number
    .split('.')
    .join('')
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  if (currency) {
    return `${currency}. ${processed}`
  }
  return processed
}

const addSeparator = (number) => {
  const numString = number.toString()
  const parts = numString.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formattedNumber = parts.join('.')

  return formattedNumber
}
const removeCurrency = (number) => {
  return parseFloat(number.toString().replace(/\./g, ''))
}
const sanitizeNonNumber = (value) => {
  return value.replace(/[^0-9.]/g, '')
}

export { addCurrency, addSeparator, removeCurrency, sanitizeNonNumber }
