const { join } = require("path");
const ESLintPresets = require("@manuth/eslint-plugin-typescript");

module.exports = {
    extends: [
        `plugin:${ESLintPresets.PluginName}/${ESLintPresets.PresetName.RecommendedWithTypeChecking}`
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
    },
    rules: {
        "@typescript-eslint/no-var-requires": 0
      }
};
