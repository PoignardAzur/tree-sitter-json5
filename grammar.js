module.exports = grammar({
    name: 'json5',

    rules: {
        // TODO: add the actual grammar rules
        source_file: $ => $._value,

        identifier: $ => /[A-Za-z0-9]+/,
        null: $ => "null",
        boolean: $ => choice("true", "false"),
        string: $ => choice(
            seq(`"`, /[^"]*/, `"`),
            seq(`'`, /[^']*/, `'`),
        ),
        number: $ => choice(
            seq("+", $._number_literal),
            seq("-", $._number_literal),
            $._number_literal,
        ),
        _number_literal: $ => choice(
            "Infinity",
            "Nan",
            /0x[A-Fa-f0-9]+/,
            $._decimal_literal,
        ),
        _decimal_literal: $ => token(choice(
            seq(/[0-9]+/, ".", /[0-9]+/, optional(/[eE][+-]?[0-9]+/)),
            seq(".", /[0-9]+/, optional(/[eE][+-]?[0-9]+/)),
            seq(/[0-9]+/, optional(/[eE][+-]?[0-9]+/)),
        )),

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
            optional($._object_members),
            "}",
        ),
        _object_members: $ => seq(
            $._object_member,
            repeat(seq(",", $._object_member)),
            optional(","),
        ),
        _object_member: $ => seq(
            choice(),
            ":",
            $._value,
        ),
        array: $ => seq(
            "[",
            optional($._array_elements),
            "]",
        ),
        _array_elements: $ => seq(
            $._value,
            repeat(seq(",", $._value)),
            optional(","),
        ),
    }
});
