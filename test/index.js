const { I18n } = require('../src/index.js')

const i = new I18n()
  .parse(`
en:
  STRING: 'en: %{one} %{two}'
`)
  .parse(`
owo:
  STRING: 'owo: %{one} %{two}'
  `)

console.log(i.replace('en', 'STRING', { one: 1, three: 3 }))
console.log(i.replace('owo', 'STRING', { one: 1, three: 3 }))
