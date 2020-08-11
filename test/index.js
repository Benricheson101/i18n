const { I18n } = require('../src/index.js')

const i = new I18n()
  .parseDir('./yml')

const str = 'NESTED:AOBJECT:STR'
// const str = 'THING'
const replaced = i.replace('en', str, { one: 1, two: '2' })
console.log(replaced)
