// Define the function to format ISO date to the desired format
const formatISODate = (isoDateString) => {
  // Create a Date object from the ISO string
  const date = new Date(isoDateString)

  // Function to add leading zero to single digit numbers
  const addLeadingZero = (number) => (number < 10 ? '0' + number : number)

  // Extract day, month, year, hours, and minutes from the Date object
  const day = addLeadingZero(date.getDate())
  const month = addLeadingZero(date.getMonth() + 1)
  const year = addLeadingZero(date.getFullYear() % 100) // Get the last two digits of the year
  const hours = addLeadingZero(date.getHours())
  const minutes = addLeadingZero(date.getMinutes())

  // Format the date in the desired format
  const formattedDate = `${day}/${month}/${year} - ${hours}:${minutes}`

  // Return the formatted date
  return formattedDate
}

const formatDate = (date) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]

  const dayOfMonth = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${dayOfMonth} ${month} ${year}`
}

const toInputDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Menambahkan nol di depan jika perlu
  const day = String(date.getDate()).padStart(2, '0') // Menambahkan nol di depan jika perlu

  return `${year}-${month}-${day}`
}

module.exports = {
  formatISODate,
  formatDate,
  toInputDate
}
