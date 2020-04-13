# StringBean
#### What?
StringBean is a library designed with the purpose of intelligently modifying strings. This is good for patching files when you want to modify the latest version of a file without overwriting it or using an old file.

#### How?
To use StringBean, first install it with this command
```bash
npm install string-bean
```
Next import it in your script
```
const StringBean = require('string-bean')

const bean = new StringBean("this a test")
bean.injectBetween("this ", " a", "is") // Returns "This is a test"
```

#### StringBean Class Methods
injectBetween
