const { safeLoad } = require('js-yaml')
const { readFileSync, readdirSync } = require('fs')

class I18n {
  constructor () {
    this.langs = {}
    this.raw = {}
  }

  parseDir (dir) {
    const files = readdirSync(dir, { encoding: 'utf-8' }).filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }
    return this
  }

  parseFile (path) {
    if (!path) throw new Error('no path')

    const contents = readFileSync(path, { encoding: 'utf-8' })
    const file = safeLoad(contents)
    const code = Object.keys(file)[0]

    if (this.langs[code]) {
      this.langs[code] = { ...this.langs[code], ...file[code] }
      this.raw[code].push(file)
    } else {
      this.langs[code] = file[code]
      this.raw[code] = [file]
    }

    return this
  }

  replace (code, string, replace = {}) {
    const str = this._parseKeyString(code, string)
    if (!str) return string

    const regex = new RegExp('%{(.*?)}', 'g')

    return str.replace(regex, (match) => {
      const e = /%{(?<placeholder>.*?)}/g.exec(match)
      return replace[e?.groups?.placeholder] ?? match
    })
  }

  _parseKeyString (code, str) {
    let out = this.langs[code]

    const layer = str.split(/[:.]/)
    for (const l of layer) {
      if (Object.keys(out).includes(l)) out = out[l]
      else return null
    }
    return out
  }
}

module.exports = { I18n }
