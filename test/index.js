const I18n = require('../src/index.js')

const i = new I18n()
  .parseRecursive('./yml')

console.log(
  'array:',
  i.replace(
    'en-US',
    'skadlfjsaf',
    { number: 'three' }
  )
)
