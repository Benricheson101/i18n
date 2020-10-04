<h1 align="center">i18n 🌐</h1>
A simple internationalization library.

## Usage:
1. Install i18n
```bash
$ yarn add @benricheson101/i18n
# or
$ npm install @benricheson101/i18n
```
2. Import and instantiate the constructor
```js
const I18n = require('@benricheson101/i18n')
const i = new I18n({ fallback: 'en' })
```
3. Parse yaml
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
    OPTIONS:
      - 'works'
      - 'with'
      - '%{datatype}'
      - 'too'
  `)
```
4. Use the string methods!
```js
i.get('en', 'STRING') // aaaaaa
i.replace('en', 'PLACEHOLDER', { food: 'potato' }) // This has a placeholder: potato
i.get('en', 'COMMAND:MAN:SHORT_DESC') // Read a command's manual
i.replace('en', 'OPTIONS', { datatype: 'arrays' }) // ['works', 'with', 'arrays', 'too']
```

## Options and Methods:
### Constructor Options:
- `fallback: string` - set a fallback language code

### Parse Methods:
- `parseDir(dir: string)` - adds all files ending in `.yml` from the specified dir
- `parseFile(file: string)` - adds a single file
- `parseRecursive(dir: string)` - adds all yaml files in a dir/subdirs recursively
- `parse(yaml: string, file?: string)` - adds a yaml string

### Generator Method:
- `generate(code?: string)` - generate missing strings for all files. (See below for explanation)

### String Methods:
- `get(code: string, stringKey: string)` - gets a string
- `replace(code: string, stringKey: string, placeholders: object)` - gets a string and replaces placeholders

### Setters/Getters:
- `regex () = placeholder_regex: RegExp` - regex for extracting and replacing placeholders. note: the placeholder name capture group MUST be named `placeholder`

### Static Properties:
- `langs` - a set contain all of the added language codes
- `strings` - the added language files/strings
- `raw` - an array of raw language file data

## Usage Example:
### Basic Parsing:
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
> Note: yaml files must start with the language code on the first line, with no indentation, followed by translated strings. Refer to the above example.
```js
const i = new I18n()
  .parseDir('./i18n')

 i.get('en', 'STRING') // This is a string
 i.replace('en', 'STRING_WITH_PLACEHOLDER', { placeholder: 'abc123' }) // This is a placeholder: abc123
 i.get('en', 'NESTED:OBJECTS:WORK:TOO') // abcde
```

### Using the Generator:
#### What does it do?
Imagine you add 100 new strings to `en.yml`. Your translators may have a difficult time seeings which strings are missing or could easily miss one. The generator will add all of the new strings from the default (`fallback`) language as empty strings so it is easy to see what must be added and what already exists
#### Example:
```yaml
# i18n/en.yml
en:
  food:
    fruits:
      - apple
      - banana

generator:
  id: 1

# ------
# i18n/es.yml
es: {}

generator:
  id: 1
```
> Note: the `generator.id` property can be anything (string or number); after running the generator, all files with the same `generator.id` will have the same structure and strings. setting `generator.ignore` to `false` or not including a `generator` object at all will ignore the file.

```js
new I18n({ fallback: 'en' })
  .parseDir('./i18n')
  .generate()
```
> Note: the `generate` function returns the class instance, so methods can be chained.

After running the generate function, `i18n/es.yml` will look like this:
```yaml
es:
  food:
    fruits:
      - ''
      - ''
generator:
  id: 1
```
