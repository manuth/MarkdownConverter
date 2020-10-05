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
            join(__dirname, "tsconfig.webpack.json"),
            join(__dirname, "src", "test", "tsconfig.json"),
            join(__dirname, "src", "tests", "tsconfig.json")
        ]
    }
};
