const { safeLoad } = require('js-yaml')
const { readFileSync, readdirSync } = require('fs')
const merge = require('merge-deep')
const recursive = require('fs-readdir-recursive')

class I18n {
  constructor () {
    this.placeholderRegex = /%{(?<placeholder>.*?)}/g
    this.langs = new Set()
    this.strings = {}
    this.raw = {}
  }

  /** Parse a yaml string */
  parse (yml) {
    const file = safeLoad(yml)
    const code = Object.keys(file)[0]
    this.langs.add(code)

    if (this.strings[code]) {
      this.strings[code] = merge(this.strings[code], file[code])
      this.raw[code].push(file)
    } else {
      this.strings[code] = file[code]
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

  /** Parse all yaml files in a dir/subdirs recursively */
  parseRecursive (dir) {
    const files = recursive(dir)
      .filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }

    return this
  }

  /** Parse a single yaml file */
  parseFile (path) {
    if (!path) throw new Error('no path')
    if (!path.endsWith('.yml')) return

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
      const e = new RegExp(this.placeholderRegex).exec(match)
      return replace[e?.groups?.placeholder] ?? match
    })
  }

  _parseKeyString (code, str) {
    if (!this.langs.has(code)) return null
    let out = this.strings[code]

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
