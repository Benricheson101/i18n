<h1 align="center">i18 🌐</h1>
This is a very tiny (60 lines of code!!) internationalization library.

## Usage:
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

 i.replace('en', 'STRING') // This is a string
 i.replace('en', 'STRING_WITH_PLACEHOLDER', { placeholder: 'abc123' }) // This is a placeholder: abc123
 i.replace('en', 'NESTED.OBJECTS.WORK.TOO') // abcde
```
