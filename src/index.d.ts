declare module '@benricheson101/i18n' {
  import { PathLike } from 'fs'

  export class I18n {
    placeholderRegex: RegExp
    regex: RegExp
    langs: any
    raw: any

    constructor ()

    parseDir (dir: PathLike): this
    parseFile (dir: PathLike): this
    parse (dir: PathLike): this

    get (code: string, string: string): string
    replace (code: string, string: string, replace: any): string
  }
}
