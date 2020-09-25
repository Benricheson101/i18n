const { safeLoad } = require('js-yaml')
const { readFileSync, readdirSync } = require('fs')
const merge = require('merge-deep')
const recursive = require('fs-readdir-recursive')

class I18n {
  constructor (ops = {}) {
    this.placeholderRegex = /%{(?<placeholder>.*?)}/g
    this.langs = new Set()
    this.strings = {}
    this.raw = {}

    this.fallback = ops && ops.fallback
  }

  /** Parse a yaml string 
   * @param {string} string - parse yaml text
   */
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

  /** Parse all yaml files in a specified directory 
   * @param {string} string - the path to the directory
   */
  parseDir (dir) {
    const files = readdirSync(dir, { encoding: 'utf-8' }).filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }
    return this
  }

  /** 
   * Parse all yaml files in a dir/subdirs recursively 
   * @param {string} string - the path to the directory
   */
  parseRecursive (dir) {
    const files = recursive(dir)
      .filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }

    return this
  }

  /** 
   * Parse a single yaml file
   * @param {string} string - the path to the yml file
   */
  parseFile (path) {
    if (!path) throw new Error('no path')
    if (!path.endsWith('.yml')) throw new Error("File must end with yaml/yml.")

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
    return this._parseKeyString(code, string) || string
  }

  /**
   * Get a translated string with replaced placeholders
   * @param {string} code - langauge code
   * @param {string} string - the string key to return
   * @param {object} replace - placeholders
   * @returns {string} - the translated string
   */
  replace (code, string, replace = {}) {
    const replacer = (str) => {
      return str.replace(this.placeholderRegex, (match) => {
        const e = new RegExp(this.placeholderRegex).exec(match)
        return replace[
          e &&
          e.groups &&
          e.groups.placeholder
        ] || match
      })
    }

    const m = this._parseKeyString(code, string)
    if (!m) return string

    const returnedStrings = []

    if (Array.isArray(m)) {
      for (const str of m) {
        if (typeof str !== 'string') {
          returnedStrings.push(str)
          continue
        }

        returnedStrings.push(
          replacer(str)
        )
      }
    } else if (typeof m === 'string') {
      returnedStrings.push(
        replacer(m)
      )
    } else {
      returnedStrings.push(m)
    }

    return returnedStrings.length === 1 ? returnedStrings[0] : returnedStrings
  }

  _parseKeyString (code, str) {
    if (!this.langs.has(code)) {
      if (this.fallback !== code) {
        return this._parseKeyString(this.fallback, str)
      }
      return null
    }

    let out = this.strings[code]
    let output

    const layer = str.split(/[:.]/)
    for (const l of layer) {
      if (Object.keys(out).includes(l)) {
        out = out[l]
        output = out
      } else output = null
    }

    if (
      !output &&
      this.fallback &&
      code !== this.fallback
    ) {
      return this._parseKeyString(this.fallback, str)
    }
    return output
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
