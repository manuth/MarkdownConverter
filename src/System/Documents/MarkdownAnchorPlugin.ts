import MarkdownIt = require("markdown-it");
import anchor from "markdown-it-anchor";
import { Slugifier } from "./Slugifier";

/**
 * Registers a plugin for generating anchors.
 *
 * @param parser
 * The parser to add the plugin to.
 *
 * @param options
 * The options of the plugin.
 */
export function Anchor(parser: MarkdownIt, options: anchor.AnchorOptions): void
{
    let slugifier = new Slugifier();

    parser.use(
        anchor,
        {
            slugify: (heading: string) => slugifier.CreateSlug(heading),
            ...options
        });

    parser.core.ruler.before(
        "anchor",
        "markdownConverterAnchorInitializer",
        () =>
        {
            slugifier.Reset();
            return false;
        });
}
