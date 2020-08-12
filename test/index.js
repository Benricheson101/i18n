const I18n = require('../src/index.js')
const assert = require('assert')

const i = new I18n()
  .parseDir('./yml')
  .parse(`
en:
    THING: 'abcd'
    `)

assert(i.get('en', 'THING') === 'abcd')
