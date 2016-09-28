var chai = require('chai')
var expect = chai.expect
var generate = require('../src/generate.js')

describe('Generate', () => {
    it('given an empty AST, produce an empty JS output', () => {
        expect(generate({})).to.equal('')
    })

    it('given a literal AST node, produce the JS for it', () => {
        expect(generate({'lit' : '1'})).to.equal('1;')
    })

    it('given a variable AST node, produce the JS for it', () => {
        expect(generate({'var' : 'x'})).to.equal('x;')
    })

    it('given a simple application AST tree, produce the JS for it', () => {
        expect(generate({
            'app' : 'f', 
            'args' : [{'var' : 'x'}, {'var' : 'y'}]
        })).to.equal('f(x,y);')
    })

    it('given a simple function AST tree, produce the JS for it', () => {
        expect(generate({
            'fn' : 'f',
            'args' : ['x', 'y'],
            'body' : {
                'rtn' : {'var' : 'x'}
            }
        })).to.equal('function f(x,y){return x;}')
    })

    it('given a stament block in the AST tree, produce the JS for it', () => {
        expect(generate({
            'blk' : [
                {'fn' : 'f', 'args' : ['x', 'y'], 'body' : {'rtn' : {'var' : 'x'}}},
                {'app' : 'f', 'args' : [{'lit' : '1'}, {'lit' : '2'}]}
            ]
        })).to.equal('function f(x,y){return x;}f(1,2);')
    })

    it('given a stament block in the AST tree, run the generated JS', () => {
        /* jshint evil:true */
        expect(eval(generate({
            'blk' : [
                {'fn' : 'f', 'args' : ['x', 'y'], 'body' : {'rtn' : {'var' : 'x'}}},
                {'app' : 'f', 'args' : [{'lit' : '1'}, {'lit' : '2'}]}
            ]
        }))).to.equal(1)
        /* jshint evil:false */
    })

    it('given a function definition and application, generate the AST', () => {
        expect(generate({
            'blk' : [
                {'ass' : 'id', 'exp' : {'fn' : 'id', 'args' : ['x'], 'body' : {'rtn' : {'var' : 'x'}}}},
                {'app' : 'id', 'args' : [{'lit' : 42}]}
             ]
        })).to.equal('id=function id(x){return x;};id(42);')
    })
})

