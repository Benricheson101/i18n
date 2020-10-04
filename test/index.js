const I18n = require('../src/index.js')
const assert = require('assert')

const i = new I18n({ fallback: 'en' })
  .parseDir('./i18n')
  .generate()

assert(
  i.get('en', 'food:fruit').toString() === ['apple', 'banana'].toString()
)

assert(
  i.replace('en', 'food:favorite', { favorite_food: 'pizza' }) === 'pizza'
)
