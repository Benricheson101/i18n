const I18n = require('../src/index.js')

const i = new I18n({ fallback: 'en' })
  .parseDir('./test/test_yml')
  // .parseRecursive('./test/yml')

console.log(i.raw)
i.generate()

// console.log(i.raw.find((e) => e[0] === 'en'))

// console.log(
//   'array:',
//   i.replace(
//     'en-US',
//     'skadlfjsaf',
//     { number: 'three' }
//   )
// )
