const { safeLoad } = require('js-yaml')
const { readFileSync, readdirSync } = require('fs')

class I18n {
  constructor () {
    this.placeholderRegex = /%{(?<placeholder>.*?)}/g
    this.langs = {}
    this.raw = {}
  }

  /** Parse a yaml string */
  parse (yml) {
    const file = safeLoad(yml)
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

  /** Parse all yaml files in a specified directory */
  parseDir (dir) {
    const files = readdirSync(dir, { encoding: 'utf-8' }).filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }
    return this
  }

  /** Parse a single yaml file */
  parseFile (path) {
    if (!path) throw new Error('no path')

    const contents = readFileSync(path, { encoding: 'utf-8' })
    this.parse(contents)

    return this
  }

  /**
   * Get a translated string
   * @param {string} code - langauge code
   * @param {string} string - the string key to return
   * @returns {string} - the translated string
   */
  get (code, string) {
    return this._parseKeyString(code, string) ?? string
  }

  /**
   * Get a translated string with replaced placeholders
   * @param {string} code - langauge code
   * @param {string} string - the string key to return
   * @param {object} replace - placeholders
   * @returns {string} - the translated string
   */
  replace (code, string, replace = {}) {
    const str = this._parseKeyString(code, string)
    if (!str) return string

    return str.replace(this.placeholderRegex, (match) => {
      const e = this.placeholderRegex.exec(match)
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

  set regex (r) {
    this.placeholderRegex = r
    return this
  }

  get regex () {
    return this.placeholderRegex
  }
}

module.exports = I18n
