const I18n = require('../src/index.js')
const assert = require('assert')

const i = new I18n()
  .parseDir('./yml')
  .parse(`
en:
    THING: 'abcd'
    `)

console.log(i.replace('en', 'STRING', { one: 1, three: 3 }))
console.log(i.replace('owo', 'STRING', { one: 1, three: 3 }))

assert(i.get('en', 'THING') === 'abcd')
