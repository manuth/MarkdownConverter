const Path = require("path");

module.exports = {
    SystemStyle: Path.join(__dirname, "css", "styles.css"),
    DefaultStyle: Path.join(__dirname, "css", "markdown.css"),
    DefaultHighlight: Path.join(__dirname, "css", "highlight.css"),
    EmojiStyle: Path.join(__dirname, "css", "emoji.css"),
    SystemTemplate: Path.join(__dirname, "SystemTemplate.html"),
    HighlightJSStylesDir: Path.join(__dirname, "..", "node_modules", "highlightjs", "styles")
}