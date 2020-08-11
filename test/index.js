const { I18n } = require('../src/index.js')

const i = new I18n()
  .parseDir('./yml')

i.regex = /{{(?<placeholder>.*?)}}/g

// const get = i.get('en', 'KEY')
// const replace = i.replace('owo', 'NESTED:OBJECTS:WORK', { placeholder: 'placeholder' })
console.log(
  i.replace('en', 'STRING', { one: 1, three: 3 })
)
console.log(
  i.replace('owo', 'STRING', { one: 1, three: 3 })
)
