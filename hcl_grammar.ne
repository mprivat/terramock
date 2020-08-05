# EBNF grammar based on this doc:
# https://www.terraform.io/docs/configuration/syntax.html

@{%

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

%}

@lexer lexer

main -> _ml (statement):+

statement -> block _ml

block -> block_name _ml block_content {%
    d => [
            {
                type: "block",
                name: d[0][0].name,
                meta: true
            },
            d
        ]
%}

block_name -> %keyword (__ labels):? {%
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
%}

labels -> %string_literal __ labels {%
            d => [
                    {
                        name: d[0].value + "." + d[2][0].name,
                        meta: true
                    },
                    d
                ]
        %}
        | %string_literal {%
            d => [
                    {
                        name: d[0].value,
                        meta: true
                    },
                    d
                ]
        %}

block_content -> %lbrace _ml (property _ml):* %rbrace

property -> %keyword _ml %equals _ml value

value -> map
       | array
       | %string_literal
       | %number_literal
       | variable
       | ternary
       | function

map      -> %lbrace list_of_properties _ml %rbrace
array    -> %lsquare list_of_values _ml %rsquare
ternary  -> value _ml %question _ml value _ml %colon _ml value
function -> %keyword _ml %lparen list_of_values _ml %rparen
variable -> %keyword (%dot %keyword):* {%
    d => {
        return {
            type: "variable",
            text: aggregate(d)
        };
    }
%}

list_of_properties -> _ml property %comma list_of_properties | _ml property %comma:?
list_of_values     -> _ml value _ml %comma list_of_values | _ml value %comma:?

_ml -> multi_line_ws_char:*

multi_line_ws_char
    -> %ws
    | line_comment
    |  "\n"

__ -> %ws:+

_ -> %ws:*

line_comment -> %pound_comment | %double_slash_comment | %ml_comment