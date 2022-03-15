'use strict'
const PNGlib = require('node-pnglib')
const convert = require('./converter')

PNGlib.prototype.drawText = function (text, left_offset = 0, top_offset = 0, text_color = 'rgb(0,255,0)') {
  const buffer = convert.convertToPixelArr(text)
  const arr = []
  for (let line = 0; line < 8; line++) {
    arr.push(Array.from(buffer[line]))
  }
  for (let i = 0; i < arr[0].length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j][i] === '#') {
        this.setPixel(i + left_offset, j + top_offset, text_color)
      }
    }
  }
}

module.exports = PNGlib
