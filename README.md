<h1 align="center">i18n 🌐</h1>
This is a very tiny internationalization library.

## Usage:
1. Instantiate the constructor
```js
const i = new I18n()
```
2. Parse yaml
```js
i.parseDir('./i18n')
  .parseFile('./en.yml')
  .parse(`
en:
  STRING: 'aaaaaa'
  PLACEHOLDER: 'This has a placeholder: %{food}'
  COMMAND:
    MAN:
      SHORT_DESC: 'Read a command\'s manual'
  `)
```
3. Use the string methods!
```js
i.get('en', 'STRING') // aaaaaa
i.replace('en', 'PLACEHOLDER', { food: 'potato' }) // This has a placeholder: potato
i.get('en', 'COMMAND:MAN:SHORT_DESC') // Read a command's manual
```

## Methods:
### Parse Methods:
- `parseDir(dir: PathLike)` - adds all files ending in `.yml` from the specified dir
- `parseFile(dir: PathLike)` - adds a single file
- `parse(yml: string)` - adds a yml string

### String Methods:
- `get(code: string, stringKey: string)` - gets a string
- `replace(code: string, stringKey: string, placeholders: object)` - gets a string and replaces placeholders

### Setters/Getters:
- `regex () = placeholder_regex: RegExp` - regex for extracting and replacing placeholders. note: the placeholder name capture group MUST be named `placeholder`

### Static Properties:
- `langs` - the added language files/strings
- `raw` - an array of raw language file data

## Usage Example:
```yaml
# i18n/en.yml
en:
  STRING: 'This is a string'
  STRING_WITH_PLACEHOLDER: 'This is a placeholder: %{placeholder}'
  NESTED:
    OBJECTS:
      WORK:
        TOO: 'abcde'
```
```js
const i = new I18n()
  .parseDir('./i18n')

 i.get('en', 'STRING') // This is a string
 i.replace('en', 'STRING_WITH_PLACEHOLDER', { placeholder: 'abc123' }) // This is a placeholder: abc123
 i.get('en', 'NESTED:OBJECTS:WORK:TOO') // abcde
```
