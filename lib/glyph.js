'use strict'
class Glyph {
  constructor (name, bitmap) {
    this.name = name
    this.bitmap = bitmap
  }

  set (x, y, value) {
    let bit = 1 << this.width() - x - 1
    const byt = ~~(bit / 256)
    bit %= (byt + 1) * 256
    if (value) { this.bitmap[y][byt] |= bit } else { this.bitmap[y][byt] &= ~bit }
  }

  get (x, y) {
    let bit = 1 << this.width() - x - 1
    const byt = ~~(bit / 256)
    bit %= (byt + 1) * 256
    const result = this.bitmap[y][byt] & bit
    return !!result
  }

  width () {
    return this.BBX[0]
  }

  height () {
    return this.BBX[1]
  }

  toString () {
    let result = ''
    for (let y = 0; y < this.bitmap.length; y++) {
      for (let x = 0; x < this.width(); x++) {
        result += this.get(x, y) ? '*' : ' '
      }
      result += '/n'
    }
    return result
  }
}

module.exports = Glyph
