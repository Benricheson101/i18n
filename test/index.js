const I18n = require('../src/index.js')
const assert = require('assert')

const i = new I18n()

i.parseRecursive('./yml')

console.log(i.langs?.en)

// console.log(i.get('en', 'CMD:STR3'))

// assert(i.get('en', 'THING') === 'abcd')
