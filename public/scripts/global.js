/* eslint-disable */

class CurrencyBeautify {
  constructor({ inputElement }) {
    this.inputElement = document.querySelector(inputElement)

    this.inputElement.addEventListener('input', (e) => {
      e.target.value = this._sanitizeNonNumber(e.target.value, 'Rp')
      e.target.value = this._addCurrency(e.target.value)
    })

    this._addCurrency = this._addCurrency.bind(this)
    this._sanitizeNonNumber = this._sanitizeNonNumber.bind(this)
  }

  _addCurrency(number, currency) {
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

  _sanitizeNonNumber(value) {
    return value.replace(/[^0-9.]/g, '')
  }

  static removeCurrency(number) {
    return parseFloat(number.toString().replace(/\./g, ''))
  }

  static addSeparator(number) {
    const numString = number.toString()
    const parts = numString.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const formattedNumber = parts.join('.')

    return formattedNumber
  }
}

class SuggestionBox {
  constructor({ inputElement, element, apiGet, listChildEl, onSelect }) {
    this.inputElementRaw = inputElement
    this.elementRaw = element
    this.listChild = listChildEl
    this.onSelect = onSelect

    this.inputElement = document.querySelector(inputElement) // Refers to the input element
    this.element = document.querySelector(element) // Refers to suggestions box (consist of list of suggestion)
    this.apiGet = apiGet
    this.selectedIndex = -1
    this.showSuggestionBox = false
    this.data = []

    this.keyDownEvent = this.keyDownEvent.bind(this)
    this.clickSuggestion = this.clickSuggestion.bind(this)
    this.suggestionBoxToggleVisibility = this.suggestionBoxToggleVisibility.bind(this)
    this.init = this.init.bind(this)
    this.getData = this.getData.bind(this)
    this.createSuggestionBoxChildren = this.createSuggestionBoxChildren.bind(this)
    this.resetDataAndEl = this.resetDataAndEl.bind(this)

    this.init()

    document.addEventListener('click', (e) => {
      const targetElement = e.target
      if (!targetElement.closest(this.inputElementRaw) && this.data.length > 0) {
        this.suggestionBoxToggleVisibility()
        this.showSuggestionBox = false
        this.resetDataAndEl()
      }
    })
  }

  //   Initialize all functions/datas at the first render
  init() {
    this.inputElement.addEventListener('keydown', this.keyDownEvent)
    this.inputElement.addEventListener('focus', this.suggestionBoxToggleVisibility)
    this.inputElement.addEventListener('input', this.getData)

    this.element.addEventListener('click', this.clickSuggestion)
  }

  //   Handle click event on suggestion item
  clickSuggestion(e) {
    if (e.target && e.target.classList.contains('suggestion-item')) {
      const index = Array.from(this.element.children).indexOf(e.target)
      this.selectedIndex = index
      this.selectSuggestion(this.selectedIndex)

      this.resetDataAndEl()
    }
    this.suggestionBoxToggleVisibility()
    this.resetDataAndEl()
  }

  /**
   * Handle select condition, when we change focus in suggestion item, it will highlight the item
   * and will set the inputValue with selected element dataset.id value.
   */
  selectSuggestion(index) {
    this.selectedIndex = index
    const items = this.element.querySelectorAll('li')
    items.forEach((item, i) => {
      const dataset = item.dataset

      if (i === this.selectedIndex) {
        if (this.onSelect) {
          this.onSelect(dataset)
        }

        item.classList.add('highlight')
        this.inputElement.value = dataset.id
      } else {
        item.classList.remove('highlight')
      }
    })
  }

  //   Handle keydown
  keyDownEvent(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.element.children.length - 1)
      this.selectSuggestion(this.selectedIndex)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
      this.selectSuggestion(this.selectedIndex)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      this.inputElement.blur()
      this.suggestionBoxToggleVisibility()
      this.resetDataAndEl()
    }
  }

  // Handle suggestion box visibility, by toggling its classes.
  suggestionBoxToggleVisibility() {
    if (!this.showSuggestionBox) {
      this.element.classList.add('block')
      this.element.classList.remove('hidden')
    } else {
      this.element.classList.remove('block')
      this.element.classList.add('hidden')
    }

    this.showSuggestionBox = !this.showSuggestionBox
    this.resetDataAndEl()
  }

  debounce(func, delay) {
    let timeoutId
    return function () {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func()
      }, delay)
    }
  }

  // Will make a fetch to apiGet URL and create children element in suggestion box
  async getData(e) {
    // Definisikan fungsi debounce di dalam getData
    if (this.inputElement.value) {
      const debounceFunc = this.debounce(async () => {
        if (!this.apiGet) {
          throw new Error('NO_APIGET_URL')
        }

        const searchQ = e.target.value || ''
        const response = await fetch(`${this.apiGet}?search=${searchQ}`, {
          method: 'GET'
        })
        const responseJson = await response.json()
        this.data = responseJson.data

        this.createSuggestionBoxChildren()
      }, 800) // Penundaan adalah 300 milidetik (atau 0,3 detik)

      // Panggil fungsi debounce setiap kali metode getData dipanggil
      debounceFunc()
    }
  }

  // Create suggestion box children
  createSuggestionBoxChildren() {
    let element = ''
    if (this.data.length > 0) {
      if (this.listChild) {
        this.data.forEach((data) => {
          element += this.listChild(data)
        })
      } else {
        this.data.forEach((data) => {
          element += `
          <li class="suggestion-item" data-id="${data.id}">${data.name}</li>
          `
        })
      }
    }
    this.element.innerHTML = element
  }

  //   Reset data and reset children element
  resetDataAndEl() {
    this.data = []
    this.createSuggestionBoxChildren()
  }
}

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
