const { I18n } = require('../src/index.js')

const i = new I18n()
  .parseDir('./yml')

const str = 'NESTED:OBJECTS:WORK'
const replaced = i.replace('en', str)
console.log(replaced) // This is a nested object
