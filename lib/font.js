'use strict'
class Font {
  constructor (version, comments, properties, glyphs) {
    this.version = version
    this.comments = comments
    this.properties = properties
    this.glyphs = glyphs
  }

  size () {
    return this.SIZE[0]
  }

  getGlyph (character) {
    const c = character.charCodeAt(0)

    return this.glyphs[c]
  }

  defaultWidth () {
    return this.FONTBOUNDINGBOX[0]
  }

  defaultHeight () {
    return this.FONTBOUNDINGBOX[1]
  }

  bit (text, row, column) {
    const t = ~~(column / 8)
    if (t < 0 || t > text.length - 1) return false
    const c = text.charCodeAt(t)

    // console.log(t);
    const g = this.glyphs[c]
    if (g) { return g.bit(row, column % 8) } else { return false }
  }

  getPixels (text) {
    const hspacing = this.FONTBOUNDINGBOX[0]
    const pixels = []
    for (let t = 0; t < text.length; t++) {
      const chr = text.charCodeAt(t)
      const glyph = this.glyphs[chr]

      const bitmap = glyph.bitmap
      const dx = t * hspacing
      const dy = this.defaultHeight() - glyph.height()

      for (let r = 0; r < bitmap.length; r++) {
        const row = bitmap[r]
        for (let b = 0; b < row.length; b++) {
          const byt = row[b]
          let offset = b * 8
          let bit = 256
          while ((bit >>>= 1)) {
            if (byt & bit) {
              const px = dx + offset
              const py = dy + r
              pixels.push({ x: px, y: py, row: r, column: offset })
            }
            offset++
          }
        }
      }
    }
    return pixels
  }
}

module.exports = Font
