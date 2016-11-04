module.exports = (() => {
"use strict"

const AST = require('../src/ast.js')
const Show = require('../src/typing-show.js')

const show = new Show()

class Step {
   constructor(id, text) {
      this.id = id
      this.text = text
   }
}

function last(xs) {
   return xs[xs.length - 1]
}

AST.LiteralInt.prototype.explain = function(cxt) {
   return [new Step(cxt.id++, '[int ' + this.value.toString() + ']\t' + show.typing(this.typing) + '\n')]
}

/*
AST.LiteralArray.prototype.explain = function() {
   //return id + ' [array ' + 
   returt  explain(id) + '[array ' + this.expressions.map((x) => x.generate(indent)).join(', ') + ']' +
      ((this.typing) ? ('/*ARY: ' + show.typing(this.typing) + '\*\/ ') : '')
}
*/

AST.LiteralTuple.prototype.explain = function(cxt) {
   const ps = this.expressions.map((x) => x.explain(cxt)) 
   const t = [].concat.apply([], ps)
   t.push(new Step(cxt.id++, '[tpl ' + ps.map((x) => last(x).id).join(' ') + ']\t' +
      show.typing(this.typing) + '\n'))
   return t 
}

AST.Variable.prototype.explain = function(cxt) {
   return [new Step(cxt.id++, '[var ' + this.name + ']\t' + show.typing(this.typing) + '\n')]
}

AST.Application.prototype.explain = function(cxt) {
   const f = this.fun.explain(cxt)
   const a = this.arg.explain(cxt)
   const b = f.concat(a)
   b.push(new Step(cxt.id++, '[app ' + last(f).id + " " + last(a).id + ']\t' + show.typing(this.typing) + '\n'))
   return b 
}

AST.Fn.prototype.explain = function(cxt) {
   const body = this.body.explain(cxt)
   body.push(new Step(cxt.id++, '[fun ' + (this.name ? this.name + ' ' : '') + 
      this.args.map((x) => x.name).join(' ') + ']\t' + show.typing(this.typing) + '\n'))
   return body
}

AST.Declaration.prototype.explain = function(cxt) {
   const v = this.variable.explain(cxt)
   const e = this.expression.explain(cxt)
   const d = v.concat(e)
   d.push(new Step(cxt.id++, '[def ' + last(v).id + ' ' + last(e).id + ']\t' +
      show.typing(this.typing) + '\n'))
   return d 
}

/*
AST.Assignment.prototype.generate = function(indent) {
   return spaces(indent) + this.name + ' = ' + this.expression.generate(indent) + ';\n'
}
*/

AST.Return.prototype.explain = function(cxt) {
   const e = this.expression.explain(cxt)
   e.push(new Step(cxt.id++, '[rtn ' + last(e).id + ']\t' + show.typing(this.typing) + '\n'))
   return e
}

AST.Block.prototype.explain = function(cxt) {
   const s = this.statements.map((x) => x.explain(cxt))
   const b = [].concat.apply([], s)
   b.push(new Step(cxt.id++, '[blk ' + s.map((x) => last(x).id).join(' ') + ']\t' +
      show.typing(this.typing) + '\n'))
   return b
}


return (ast) => {
   const lines = ast.explain({
      id : 1
   })
   let str = ''
   for (let x of lines) {
      str += x.id + '. ' + x.text
   }
   return str
}

})()
