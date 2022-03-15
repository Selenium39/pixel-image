'use strict'
const fs = require('fs')
const parse = require('./bdf-parse')

class Converter {
  constructor () {
    const data = fs.readFileSync('./lib/fonts/c64.bdf', { encoding: 'ascii' })
    this.font = parse(data)
  }

  convertToPixelArr (text) {
    const buffer = []
    const pixels = this.font.getPixels(text)
    for (let line = 0; line < 8; line++) { buffer.push(new Array(text.length * 8).join('.')) }
    // draw pixels to buffer
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i]
      // for every pixel, replace a character in the buffer
      const tmp = buffer[p.y].split('')
      tmp.splice(p.x, 1, '#')
      buffer[p.y] = tmp.join('')
    }
    return buffer
  }
}

module.exports = new Converter()
