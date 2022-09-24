const { join } = require("path");
const { PluginName, PresetName } = require("@manuth/eslint-plugin-typescript");

module.exports = {
    extends: [
        `plugin:${PluginName}/${PresetName.RecommendedWithTypeChecking}`
    ],
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.app.json"),
            join(__dirname, "tsconfig.eslint.json"),
            join(__dirname, "tsconfig.web.json"),
            join(__dirname, "src", "test", "tsconfig.json"),
            join(__dirname, "src", "tests", "tsconfig.json")
        ]
    }
};
