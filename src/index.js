const { safeLoad, safeDump } = require('js-yaml')
const { readFileSync, readdirSync, writeFileSync } = require('fs')
const merge = require('merge-deep')
const recursive = require('fs-readdir-recursive')

class I18n {
  constructor (ops = {}) {
    this.placeholderRegex = /%{(?<placeholder>.*?)}/g
    this.langs = new Set()
    this.strings = {}
    this.raw = []

    this.fallback = ops && ops.fallback
  }

  /**
   * Parse a yaml string
   * @param {string} string - parse yaml text
   */
  parse (yml, filename = '') {
    const file = safeLoad(yml) || {}
    const keys = Object.keys(file)
    if (!keys.length) return

    const code = keys.filter((k) => k !== 'generator')[0]
    this.langs.add(code)

    if (this.strings[code]) {
      this.strings[code] = merge(this.strings[code], file[code])
      this.raw.push(
        [code, { raw: file, file: filename }]
      )
    } else {
      this.strings[code] = file[code]
      this.raw.push(
        [code, { raw: file, file: filename }]
      )
    }
    return this
  }

  /**
   * Parse all yaml files in a specified directory
   * @param {string} string - the path to the directory
   */
  parseDir (dir) {
    const files = readdirSync(dir, { encoding: 'utf-8' })
      .filter((e) => e.endsWith('.yml'))

    for (const file of files) {
      this.parseFile(`${dir}/${file}`)
    }
    return this
  }

  /**
   * Parse all yaml files in a dir/subdirs recursively
   * @param {string} dir - the path to the directory
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
   * @param {string} path - the path to the yml file
   */
  parseFile (path) {
    if (!path) throw new Error('no path')
    if (!path.endsWith('.yml')) throw new Error('File must end with yaml/yml.')

    const contents = readFileSync(path, { encoding: 'utf-8' })
    this.parse(contents, path)

    return this
  }

  /**
   * Generate missing strings as `''` in all translation files with a `generate` object
   *
   * each `generate` object must have an `id` field, containing a unique identifier (can be anything)
   *
   * @example
   * ```yaml
   * # en.yml
   * en:
   *  str: abc
   *
   * generate:
   *   id: 1
   *
   * # ------
   * # es.yml
   * es: {}
   *
   * generate:
   *   id: 1
   * ```
   * ```js
   * i.generate('en')
   * ```
   *
   * @param {string} [code] - override the default language code
   * @returns {I18n}
   */
  generate (code) {
    code = code || this.fallback
    if (!code) throw new Error('no default code specified')

    const codes = Array.from(new Set(this.raw.filter((e) => e[0] !== code).map((e) => e[0])))
    const ids = Array.from(new Set(this.raw.filter((e) => e[0] === code).map((e) => {
      return e[1] &&
        e[1].raw &&
        e[1].raw.generator &&
        e[1].raw.generator.id
    })))

    const findObj = (c, i) => {
      return this.raw.find((e) => {
        return e[0] === c &&
            e[1].raw &&
            e[1].raw.generator &&
            e[1].raw.generator.id &&
            e[1].raw.generator.id === i
      })
    }

    for (const c of codes) {
      for (const id of ids) {
        const def = findObj(code, id)
        if (
          !def ||
          !def.length >= 2 ||
          (def[1].raw.generator && def[1].raw.generator.ignore)
        ) continue

        const f = findObj(c, id)
        if (
          !f ||
          !f.length >= 2 ||
          (f[1].raw.generator && f[1].raw.generator.ignore)
        ) continue

        const g = this._generate(def[1].raw.en, f[1].raw[c])

        const final = { [c]: g, generator: f[1].raw.generator }

        writeFileSync(f[1].file, safeDump(final))
      }
    }

    return this
  }

  /**
   * Deeply merge two objects, `a` and `b`.
   *
   * all of `b`'s properties are copied, and missing props are set to `''`
   * @param {Object} a - the object containing all of the properties
   * @param {Object} b - the object wihh missing properties
   * @returns {Object} - merged object
   */
  _generate (a, b) {
    const replace = (o) => {
      const obj = {}
      for (const [k, v] of Object.entries(o)) {
        if (Array.isArray(v)) {
          obj[k] = new Array(v.length).fill('')
        } else if (typeof v === 'object') {
          if (Object.keys(v).length === 0) {
            obj[k] = {}
          } else {
            obj[k] = replace(v)
          }
        } else {
          obj[k] = ''
        }
      }
      return obj
    }
    return merge(replace(a), b)
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
