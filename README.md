<h1 align="center">Welcome to pixel-image 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Easy to generate piexel image.

## Install

```sh
npm install pixel-image
```

### ✨ [Example](https://github.com/wantao666/pc-queue/blob/master/example.js)
```
const http = require('http')
const PNGlib = require('pixel-image')

http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') return res.end('')
  const png = new PNGlib(100, 50)
  switch (req.url) {
    case '/drawText':
      png.drawText('HelloWorld', 5, 20)
      break
    case '/drawLine': {
      // from (0, 20)
      const lineIndex = png.index(0, 20)
      for (let i = 0; i < 100; i++) {
        png.buffer[lineIndex + i] = png.color('blue')
      }
    }
      break
    case '/drawRectangle':
      for (let i = 10; i < 80; i++) {
        for (let j = 10; j < 40; j++) {
          png.setPixel(i, j, '#cc0044')
        }
      }
      break
    case '/drawWave':
      for (let i = 0, num = 100 / 10; i <= num; i += 0.01) {
        const x = i * 10
        const y = Math.sin(i) * 10 + 20
        png.setPixel(x, (y - 10), '#0000FF')
        png.setPixel(x, (y), '#FF0000')
        png.setPixel(x, (y + 10), 'rgb(0,255,0)')
      }
      break
  }
  res.setHeader('Content-Type', 'image/png')
  res.end(png.getBuffer())
}).listen(3000)
```
------output------<br/>
`drawLine.png`<br/>
![drawLine.png](https://user-images.githubusercontent.com/29670394/158381224-64ac0abd-9e9d-4ee6-bffd-e29b5484d184.png)<br/><br/>
`drawRectangle.png`<br/>
![drawRectangle.png](https://user-images.githubusercontent.com/29670394/158381220-120d1a76-b2de-479d-b97c-37fcca036368.png)<br/><br/>
`drawWave.png`<br/>
![drawWave.png](https://user-images.githubusercontent.com/29670394/158381230-5e896b1d-e533-4b09-85a6-bc1e4dca95ce.png)<br/><br/>
`drawText.png`<br/>
![drawText.png](https://user-images.githubusercontent.com/29670394/158381227-c2d2c43d-bc24-4a4c-a24e-aa3bc198da7f.png)<br/><br/>
## Author

👤 **Selenium39**

* Website: https://blog.csdn.net/qq_45453266
* Github: [@Selenium39](https://github.com/Selenium39)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
