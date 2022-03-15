const jsparse = require('jsparse')
const PxxlFont = require('./font')
const PxxlGlyph = require('./glyph')

const ch = jsparse.ch
const range = jsparse.range
const choice = jsparse.choice
const sequence = jsparse.sequence
const action = jsparse.action
const join_action = jsparse.join_action
const token = jsparse.token
const ps = jsparse.ps
const repeat1 = jsparse.repeat1
const repeat0 = jsparse.repeat0
const butnot = jsparse.butnot
const optional = jsparse.optional

const EXCLAMATION_MARK = ch('!')
const AT = ch('@')
const HASH = ch('#')
const DOLLAR = ch('$')
const PERCENT = ch('%')
const CARET = ch('^')
const AMPERSAND = ch('&')
const ASTERISK = ch('*')
const LEFT_PARENTHESIS = ch('(')
const RIGHT_PARENTHESIS = ch(')')
const MINUS = ch('-')
const UNDERSCORE = ch('_')
const PLUS = ch('+')
const EQUALS = ch('=')
const LEFT_ACCOLADE = ch('{')
const RIGHT_ACCOLADE = ch('}')
const LEFT_BRACKET = ch('[')
const RIGHT_BRACKET = ch(']')
const COLON = ch(':')
const SEMICOLON = ch(';')
const QUOTE = ch("'")
const DOUBLE_QUOTE = ch('"')
const PIPE = ch('|')
const BACKSLASH = ch('\\')
const TILDE = ch('~')
const BACKTICK = ch('`')
const COMMA = ch(',')
const PERIOD = ch('.')
const LESS_THAN = ch('<')
const GREATER_THAN = ch('>')
const QUESTION_MARK = ch('?')
const SLASH = ch('/')

const SpecialChar = choice(EXCLAMATION_MARK, AT, HASH, DOLLAR, PERCENT, CARET, AMPERSAND, ASTERISK, LEFT_PARENTHESIS, RIGHT_PARENTHESIS, MINUS, UNDERSCORE, PLUS, EQUALS, LEFT_ACCOLADE, RIGHT_ACCOLADE, LEFT_BRACKET, RIGHT_BRACKET, COLON, SEMICOLON, QUOTE, DOUBLE_QUOTE, PIPE, BACKSLASH, TILDE, BACKTICK, COMMA, PERIOD, LESS_THAN, GREATER_THAN, QUESTION_MARK, SLASH)

const Digit = range('0', '9')
const LowerCase = range('a', 'z')
const UpperCase = range('A', 'Z')

const CR = ch('\r')
const LF = ch('\n')
const CRLF = sequence(CR, LF)
const LINE_END = choice(CRLF, CR, LF)

const Space = ch(' ')

const Alpha = choice(LowerCase, UpperCase)
const AlphaNum = choice(Alpha, Digit)
const NoSpaceChar = choice(AlphaNum, SpecialChar)
const Char = choice(NoSpaceChar, Space)
const Spaces = flatten(repeat1(Space))
const Text = flatten(repeat1(Char))

const EOL = sequence(repeat0(Space), LINE_END)

const QUOTED_STRING = pick(1, sequence(DOUBLE_QUOTE, flatten(repeat1(butnot(Char, DOUBLE_QUOTE))), DOUBLE_QUOTE))

const HexDigit = choice(range('a', 'f'), range('A', 'F'), Digit)
const Byte = action(flatten(sequence(HexDigit, HexDigit)), function (s) { return parseInt(s, 16) })
const ByteArray = repeat1(Byte)
const Natural = flatten(repeat1(Digit))

const NegativeNumber = flatten(sequence(MINUS, Natural))
const Integer = action(choice(Natural, NegativeNumber), parseInt)
// var Word = flatten(repeat1(Alpha));

// var PropName = flatten(sequence(Alpha, flatten(repeat0(choice(Alpha, UNDERSCORE)))));
const PropName = flatten(repeat1(choice(Alpha, UNDERSCORE)))
const Prop1 = action(sequence(PropName, repeat1(pick(1, sequence(Spaces, Integer)))), MakeProp1)
const Prop2 = action(sequence(PropName, Spaces, QUOTED_STRING), MakeProp2)
const Prop3 = action(sequence(PropName, Spaces, flatten(repeat1(NoSpaceChar))), MakeProp2)
const ENDPROPERTIES = token('ENDPROPERTIES')
const Prop = trace(choice(Prop1, Prop2, Prop3, ENDPROPERTIES), 'prop')
const PropRow = pick(0, sequence(Prop, EOL))

const BitmapRow = pick(0, sequence(ByteArray, EOL))
const BITMAP = token('BITMAP')
const BitmapStart = sequence(BITMAP, EOL)
const Bitmap = trace(pick(1, sequence(BitmapStart, repeat0(BitmapRow))), 'bitmap')

const STARTCHAR = token('STARTCHAR')
const ENDCHAR = token('ENDCHAR')
const GlyphStart = trace(pick(2, sequence(STARTCHAR, Space, Text, EOL)), 'glyphstart')
const GlyphEnd = sequence(ENDCHAR, EOL)
const Glyph = trace(action(sequence(GlyphStart, repeat0(PropRow), Bitmap, GlyphEnd), MakeGlyph), 'glyph')

// var Glyph = action(_Glyph, function(ast) { console.log(ast)} );

const STARTFONT = token('STARTFONT')
const ENDFONT = token('ENDFONT')
const Version = flatten(sequence(Natural, PERIOD, Natural))
const FontStart = trace(pick(2, sequence(STARTFONT, Spaces, Version, EOL)), 'fontstart')
const FontEnd = trace(sequence(ENDFONT, optional(EOL)), 'fontend') // EOL optional for now
const COMMENT = token('COMMENT')
const Comment = pick(2, sequence(COMMENT, optional(Space), optional(Text)))
const CommentRow = trace(pick(0, sequence(Comment, EOL)), 'comment')

const BDF = action(sequence(repeat0(CommentRow), FontStart, repeat0(CommentRow), repeat0(butnot(PropRow, GlyphStart)), repeat0(Glyph), FontEnd), MakeFont) // empty container is allowed

// input: sequence( FontStart, repeat0(CommentRow), repeat0(butnot(PropRow, GlyphStart)), repeat0(Glyph), FontEnd)
function MakeFont (ast) {
  const formatVersion = ast[1]
  const comments = ast[0].concat(ast[2])
  const properties = ast[3]
  const glyphs = PropertyList2Hash(ast[4])
  const f = new PxxlFont(formatVersion, comments, properties, glyphs)
  return PropertyBagMixin(f, properties)
}

// input: sequence(GlyphStart, repeat0(PropRow), Bitmap, GlyphEnd
function MakeGlyph (ast) {
  const name = ast[0]
  const properties = ast[1]
  const bitmap = ast[2]

  let g = new PxxlGlyph(name, bitmap)
  g = PropertyBagMixin(g, properties)
  return { name: g.ENCODING, value: g }
}

function PropertyBagMixin (obj, proplist) {
  for (let i = 0; i < proplist.length; i++) {
    const prop = proplist[i]
    // WATCH OUT! possibly overwriting pre-existing properties!
    obj[prop.name] = prop.value
  }

  return obj
}

function PropertyList2Hash (proplist) {
  const hash = {}

  for (let i = 0; i < proplist.length; i++) {
    const prop = proplist[i]

    // WATCH OUT! possibly overwriting pre-existing properties!
    hash[prop.name] = prop.value
  }

  return hash
}

function MakeProp1 (ast) {
  let value = ast[1]
  const name = ast[0]

  if (name === 'ENCODING' || name === 'CHARS') { value = value[0] }

  return { name: name, value: value }
}

function MakeProp2 (ast) {
  return { name: ast[0], value: ast[2] }
}

function flatten (p) {
  return join_action(p, '')
}

function pick (i, p) {
  return action(p, function (ast) { return ast[i] })
}

function trace (p, label) {
  const traceon = false
  const traceall = false

  if (!traceon) return p

  return function (state) {
    let result
    let error
    try {
      result = p(state)
    } catch (err) {
      error = 1
    }
    if (error || !result.ast) {
      const matched = state.input.substring(0, state.index)
      const lines = matched.split('\n')
      console.error(label, 'failed at line', lines.length, state)
    }
    if (!error && result.ast && traceall) { console.log(label, 'matches', result.matched, '\nAST:', result.ast) }

    return result
  }
}

function pre (input) {
  const lines = input.split('\n')
  for (let l = lines.length - 1; l >= 0; l--) {
    const line = ltrim(lines[l])

    if (line === '') { lines.splice(l, 1) } else { lines[l] = line }
  }

  return lines.join('\n')
}

function ltrim (stringToTrim) {
  return stringToTrim.replace(/^\s+/, '')
}

function parseBDF (input) {
  input = pre(input)
  const state = ps(input)
  const result = BDF(state)
  if (result.ast) {
    return result.ast
  }
  throw new Error('Unable to parse font!')
}

module.exports = parseBDF
