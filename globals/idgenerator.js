const { customAlphabet } = require('nanoid')

const generateId = (length = 12, pattern = '1234567890') => {
  try {
    const nanoid = customAlphabet(pattern, length)

    return nanoid()
  } catch (error) {
    throw new Error(`Id Generator : ${error.message}`)
  }
}

module.exports = generateId
