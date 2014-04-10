var assert = require('assert')
var jmespath = require('../jmespath')
var tokenize = jmespath.tokenize
var compile = jmespath.compile


describe('tokenize', function() {
    it('should tokenize unquoted identifier', function() {
        assert.deepEqual(tokenize('foo'),
                         [{type: "UnquotedIdentifier",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize unquoted identifier with underscore', function() {
        assert.deepEqual(tokenize('_underscore'),
                          [{type: "UnquotedIdentifier",
                           value: "_underscore",
                           start: 0}]);
    });
    it('should tokenize unquoted identifier with numbers', function() {
        assert.deepEqual(tokenize('foo123'),
                          [{type: "UnquotedIdentifier",
                           value: "foo123",
                           start: 0}]);
    });
    it('should tokenize dotted lookups', function() {
        assert.deepEqual(
            tokenize('foo.bar'),
            [{type: "UnquotedIdentifier", value: "foo", start: 0},
             {type: "Dot", value: ".", start: 3},
             {type: "UnquotedIdentifier", value: "bar", start: 4},
            ]);
    });
    it('should tokenize numbers', function() {
        assert.deepEqual(
            tokenize('foo[0]'),
            [{type: "UnquotedIdentifier", value: "foo", start: 0},
             {type: "Lbracket", value: "[", start: 3},
             {type: "Number", value: 0, start: 4},
             {type: "Rbracket", value: "]", start: 5},
            ]);
    });
    it('should tokenize numbers with multiple digits', function() {
        assert.deepEqual(
            tokenize("12345"),
            [{type: "Number", value: 12345, start: 0}]);
    });
    it('should tokenize negative numbers', function() {
        assert.deepEqual(
            tokenize("-12345"),
            [{type: "Number", value: -12345, start: 0}]);
    });
    it('should tokenize quoted identifier', function() {
        assert.deepEqual(tokenize('"foo"'),
                         [{type: "QuotedIdentifier",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize quoted identifier with unicode escape', function() {
        assert.deepEqual(tokenize('"\\u2713"'),
                         [{type: "QuotedIdentifier",
                          value: "✓",
                          start: 0}]);
    });
    it('should tokenize literal lists', function() {
        assert.deepEqual(tokenize("`[0, 1]`"),
                         [{type: "Literal",
                          value: [0, 1],
                          start: 0}]);
    });
    it('should tokenize literal dict', function() {
        assert.deepEqual(tokenize("`{\"foo\": \"bar\"}`"),
                         [{type: "Literal",
                          value: {"foo": "bar"},
                          start: 0}]);
    });
    it('should tokenize literal strings', function() {
        assert.deepEqual(tokenize("`\"foo\"`"),
                         [{type: "Literal",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize json literals', function() {
        assert.deepEqual(tokenize("`true`"),
                         [{type: "Literal",
                          value: true,
                          start: 0}]);
    });
    it('should not requiring surrounding quotes for strings', function() {
        assert.deepEqual(tokenize("`foo`"),
                         [{type: "Literal",
                          value: "foo",
                          start: 0}]);
    });
    it('should not requiring surrounding quotes for numbers', function() {
        assert.deepEqual(tokenize("`20`"),
                         [{type: "Literal",
                           value: 20,
                           start: 0}]);
    });
    it('should tokenize literal lists with chars afterwards', function() {
        assert.deepEqual(
            tokenize("`[0, 1]`[0]"), [
                {type: "Literal", value: [0, 1], start: 0},
                {type: "Lbracket", value: "[", start: 8},
                {type: "Number", value: 0, start: 9},
                {type: "Rbracket", value: "]", start: 10}
        ]);
    });
    it('should tokenize two char tokens with shared prefix', function() {
        assert.deepEqual(
            tokenize("[?foo]"),
            [{type: "Filter", value: "[?", start: 0},
             {type: "UnquotedIdentifier", value: "foo", start: 2},
             {type: "Rbracket", value: "]", start: 5}]
        );
    });
    it('should tokenize flatten operator', function() {
        assert.deepEqual(
            tokenize("[]"),
            [{type: "Flatten", value: "[]", start: 0}]);
    });
    it('should tokenize comparators', function() {
        assert.deepEqual(tokenize("<"),
                         [{type: "LT",
                          value: "<",
                          start: 0}]);
    });
    it('should tokenize two char tokens without shared prefix', function() {
        assert.deepEqual(
            tokenize("=="),
            [{type: "EQ", value: "==", start: 0}]
        );
    });
    it('should tokenize not equals', function() {
        assert.deepEqual(
            tokenize("!="),
            [{type: "NE", value: "!=", start: 0}]
        );
    });
    it('should tokenize the OR token', function() {
        assert.deepEqual(
            tokenize("a||b"),
            [
                {type: "UnquotedIdentifier", value: "a", start: 0},
                {type: "Or", value: "||", start: 1},
                {type: "UnquotedIdentifier", value: "b", start: 3}
            ]
        );
    });
});


describe('parsing', function() {
    it('should parse field node', function() {
        assert.deepEqual(compile('foo'),
                          {type: 'Field', name: 'foo'})
    });
});