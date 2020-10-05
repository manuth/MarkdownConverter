const { join } = require("path");

module.exports = {
    extends: [
        "plugin:@manuth/typescript/recommended-requiring-type-checking"
    ],
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.json"),
            join(__dirname, "tsconfig.eslint.json"),
            join(__dirname, "MarkdownConverter", "tsconfig.json"),
            join(__dirname, "MarkdownConverter", "src", "test", "tsconfig.json"),
            join(__dirname, "MarkdownConverter", "src", "tests", "tsconfig.json")
        ]
    }
};
