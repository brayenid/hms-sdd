const addSeparator = (number) => {
  const numString = number.toString()
  const parts = numString.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formattedNumber = parts.join('.')

  return formattedNumber
}

const calculateNights = (start, end) => {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
}

const isToday = (date) => {
  const today = new Date()
  const targetDate = new Date(date)
  if (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  ) {
    return true
  } else {
    return false
  }
}

const minuteDifference = (inputDate, minutes = 30) => {
  // Ubah timestamp ke dalam bentuk objek Date
  const currentTime = new Date()
  const targetDate = new Date(new Date(inputDate).getTime())

  // Hitung selisih waktu dalam milidetik
  const msDifference = Math.abs(currentTime - targetDate)

  // Konversi selisih waktu ke dalam menit
  const minutesDifference = msDifference / (1000 * 60)

  // Periksa apakah selisih lebih dari 30 menit
  return minutesDifference > minutes
}

const capitalized = (sentence) => {
  const words = sentence.split(' ')

  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  })

  return capitalizedWords.join(' ')
}

module.exports = {
  addSeparator,
  calculateNights,
  isToday,
  minuteDifference,
  capitalized
}
