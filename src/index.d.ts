declare module '@benricheson101/i18n' {
  export default class I18n {
    placeholderRegex: RegExp
    regex: RegExp
    langs: any
    raw: any

    constructor ()

    parseDir (dir: string): this
    parseFile (file: string): this
    parse (yaml: string): this

    get (code: string, string: string): string

    replace (code: string, string: string, replace: any): string
  }
}
