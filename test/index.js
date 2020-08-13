const I18n = require('../src/index.js')
const assert = require('assert')

const i = new I18n()

i.parseRecursive('./yml')

// console.log(i.langs?.en)

console.log(i.get('en', 'THING2'))

// assert(i.get('en', 'THING') === 'abcd')
