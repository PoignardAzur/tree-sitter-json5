function comma_separated(elem) {
    return optional(seq(
        elem,
        repeat(seq(",", elem)),
        optional(","),
    ));
}

module.exports = grammar({
    name: 'json5',

    extras: $ => [
        /\s/,
        $.comment,
    ],

    rules: {
        source_file: $ => $._value,

        comment: $ => token(choice(
            seq('//', /.*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/'
            )
        )),

        identifier: $ => {
            const identifierStart = choice(
                "$",
                "_",
                /\p{Letter}/,
                /\p{Letter_Number}/,
                /\\u[A-Fa-f0-9]{4}/
            );
            const identifierPart = choice(
                identifierStart,
                /\p{Mc}/, // Non_Spacing_Mark
                /\p{Mn}/, // Spacing_Combining_Mark
                /\p{Nd}/, // Decimal_Digit_Number
                /\p{Pc}/, // Connector_Punctuation
                "\u200C", // ZWNJ
                "\u200D", // ZWJ
            );
            return token(seq(identifierStart, repeat(identifierPart)));
        },
        null: $ => "null",
        boolean: $ => choice("true", "false"),
        string: $ => {
            const double_quote = seq(
                '"',
                repeat(choice(
                    seq("\\", choice('"', "\\", "b", "f", "n", "r", "t", "v")),
                    /[^"\\]/
                )),
                '"'
            );
            const single_quote = seq(
                "'",
                repeat(choice(
                    seq("\\", choice("'", "\\", "b", "f", "n", "r", "t", "v")),
                    /[^'\\]/
                )),
                "'"
            );

            return token(choice(double_quote, single_quote));
        },
        number: $ => {
            const exponent = /[eE][+-]?[0-9]+/;
            const decimal_literal = choice(
                seq(/[0-9]+/, ".", /[0-9]*/, optional(exponent)),
                seq(".", /[0-9]+/, optional(exponent)),
                seq(/[0-9]+/, optional(exponent)),
            );

            // Note - binary and octal literals are unsupported, but tree-sitter-json
            // parses them, so eh.
            const binary_literal = /0[bb][0-1]+/;
            const octal_literal = /0[oO][0-7]+/;
            const hex_literal = /0[xX][0-9A-Fa-f]+/;

            const number_literal = choice(
                "Infinity",
                "Nan",
                binary_literal,
                octal_literal,
                hex_literal,
                decimal_literal,
            );
            return token(seq(/[+-]?/, number_literal));
        },

        _value: $ => choice(
            $.null,
            $.boolean,
            $.string,
            $.number,
            $.object,
            $.array,
        ),

        object: $ => seq(
            "{",
            comma_separated($.member),
            "}",
        ),
        member: $ => seq(
            choice($.string, $.identifier),
            ":",
            $._value,
        ),
        array: $ => seq(
            "[",
            comma_separated($._value),
            "]",
        ),
    }
});
