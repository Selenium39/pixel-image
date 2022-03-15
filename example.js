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
