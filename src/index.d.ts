declare module '@benricheson101/i18n' {
  type obj = {[key: string]: any}

  export default class I18n {
    placeholderRegex: RegExp
    regex: RegExp
    langs: Set<string>
    strings: obj
    raw: [string, { raw: obj, file: string }][]

    constructor ()

    parseRecursive (dir: string): this
    parseDir (dir: string): this
    parseFile (path: string): this
    parse (yml: string, filename?: string): this

    generate (code: string): this

    get (code: string, string: string): string | string[] | obj
    replace (code: string, string: string, replace: obj): string | string[] | obj
  }
}
