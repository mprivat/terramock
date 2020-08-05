// Generated automatically by nearley, version 2.19.5
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require('moo')
let lexer = moo.compile({
    ws: /[ \t]+/,
    nl: { match: "\n", lineBreaks: true },
    pound_comment: {
        match: /#[^\n]*/,
    },
    double_slash_comment: {
        match: /\/\/[^\n]*/,
    },
    ml_comment: {
        match: /\/\*[\s\S]*?\*\//,
    },
    string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
        value: s => JSON.parse(s)
    },    
    keyword: {
        match: /[a-zA-Z_][a-zA-Z_0-9]*/
    },
    number_literal: {
        match: /[0-9]+(?:\.[0-9]+)?/,
    },
    lbrace: "{",
    rbrace: "}",
    comma: ",",
    equals: "=",
    dot: ".",
    question: "?",
    colon: ":",
    lparen: "(",
    rparen: ")",
    lsquare: "[",
    rsquare: "]"
})

const aggregate = (tokens) => {
    r = ""

    for(token of tokens) {
        if(Array.isArray(token)) {
            r += aggregate(token)
        }
        else if(!token.meta) {
            r += token.text
        }
    }

    return r;
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["statement"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"]},
    {"name": "main$ebnf$1$subexpression$2", "symbols": ["statement"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["_ml", "main$ebnf$1"]},
    {"name": "statement", "symbols": ["block", "_ml"]},
    {"name": "block", "symbols": ["block_name", "_ml", "block_content"], "postprocess": 
        d => [
                {
                    type: "block",
                    name: d[0][0].name,
                    meta: true
                },
                d
            ]
        },
    {"name": "block_name$ebnf$1$subexpression$1", "symbols": ["__", "labels"]},
    {"name": "block_name$ebnf$1", "symbols": ["block_name$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "block_name$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "block_name", "symbols": [(lexer.has("keyword") ? {type: "keyword"} : keyword), "block_name$ebnf$1"], "postprocess": 
        d => {
            let labels = ""
            if(d.length > 1 && d[1]) {
                labels = `.${d[1][1][0].name}`;
            }
        
            return [
                {                
                    name: `${d[0].value}${labels}`,
                    meta: true
                },
                d
            ]
        }
        },
    {"name": "labels", "symbols": [(lexer.has("string_literal") ? {type: "string_literal"} : string_literal), "__", "labels"], "postprocess": 
        d => [
                {
                    name: d[0].value + "." + d[2][0].name,
                    meta: true
                },
                d
            ]
                },
    {"name": "labels", "symbols": [(lexer.has("string_literal") ? {type: "string_literal"} : string_literal)], "postprocess": 
        d => [
                {
                    name: d[0].value,
                    meta: true
                },
                d
            ]
                },
    {"name": "block_content$ebnf$1", "symbols": []},
    {"name": "block_content$ebnf$1$subexpression$1", "symbols": ["property", "_ml"]},
    {"name": "block_content$ebnf$1", "symbols": ["block_content$ebnf$1", "block_content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "block_content", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_ml", "block_content$ebnf$1", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)]},
    {"name": "property", "symbols": [(lexer.has("keyword") ? {type: "keyword"} : keyword), "_ml", (lexer.has("equals") ? {type: "equals"} : equals), "_ml", "value"]},
    {"name": "value", "symbols": ["map"]},
    {"name": "value", "symbols": ["array"]},
    {"name": "value", "symbols": [(lexer.has("string_literal") ? {type: "string_literal"} : string_literal)]},
    {"name": "value", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)]},
    {"name": "value", "symbols": ["variable"]},
    {"name": "value", "symbols": ["ternary"]},
    {"name": "value", "symbols": ["function"]},
    {"name": "map", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "list_of_properties", "_ml", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)]},
    {"name": "array", "symbols": [(lexer.has("lsquare") ? {type: "lsquare"} : lsquare), "list_of_values", "_ml", (lexer.has("rsquare") ? {type: "rsquare"} : rsquare)]},
    {"name": "ternary", "symbols": ["value", "_ml", (lexer.has("question") ? {type: "question"} : question), "_ml", "value", "_ml", (lexer.has("colon") ? {type: "colon"} : colon), "_ml", "value"]},
    {"name": "function", "symbols": [(lexer.has("keyword") ? {type: "keyword"} : keyword), "_ml", (lexer.has("lparen") ? {type: "lparen"} : lparen), "list_of_values", "_ml", (lexer.has("rparen") ? {type: "rparen"} : rparen)]},
    {"name": "variable$ebnf$1", "symbols": []},
    {"name": "variable$ebnf$1$subexpression$1", "symbols": [(lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("keyword") ? {type: "keyword"} : keyword)]},
    {"name": "variable$ebnf$1", "symbols": ["variable$ebnf$1", "variable$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "variable", "symbols": [(lexer.has("keyword") ? {type: "keyword"} : keyword), "variable$ebnf$1"], "postprocess": 
        d => {
            return {
                type: "variable",
                text: aggregate(d)
            };
        }
        },
    {"name": "list_of_properties", "symbols": ["_ml", "property", (lexer.has("comma") ? {type: "comma"} : comma), "list_of_properties"]},
    {"name": "list_of_properties$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "list_of_properties$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "list_of_properties", "symbols": ["_ml", "property", "list_of_properties$ebnf$1"]},
    {"name": "list_of_values", "symbols": ["_ml", "value", "_ml", (lexer.has("comma") ? {type: "comma"} : comma), "list_of_values"]},
    {"name": "list_of_values$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "list_of_values$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "list_of_values", "symbols": ["_ml", "value", "list_of_values$ebnf$1"]},
    {"name": "_ml$ebnf$1", "symbols": []},
    {"name": "_ml$ebnf$1", "symbols": ["_ml$ebnf$1", "multi_line_ws_char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_ml", "symbols": ["_ml$ebnf$1"]},
    {"name": "multi_line_ws_char", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "multi_line_ws_char", "symbols": ["line_comment"]},
    {"name": "multi_line_ws_char", "symbols": [{"literal":"\n"}]},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "line_comment", "symbols": [(lexer.has("pound_comment") ? {type: "pound_comment"} : pound_comment)]},
    {"name": "line_comment", "symbols": [(lexer.has("double_slash_comment") ? {type: "double_slash_comment"} : double_slash_comment)]},
    {"name": "line_comment", "symbols": [(lexer.has("ml_comment") ? {type: "ml_comment"} : ml_comment)]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
