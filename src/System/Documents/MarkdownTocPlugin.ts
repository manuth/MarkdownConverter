import MarkdownIt = require("markdown-it");
import toc = require("markdown-it-table-of-contents");
import { Slugifier } from "./Slugifier";

/**
 * Registers a plugin for generating a table of contents.
 *
 * @param parser
 * The parser to add the plugin to.
 *
 * @param options
 * The options of the plugin.
 */
export function TOC(parser: MarkdownIt, options: any): void
{
    let slugifier = new Slugifier();

    parser.use(
        toc,
        {
            slugify: (heading: string) => slugifier.CreateSlug(heading),
            ...options
        });

    let originalRule = parser.renderer.rules.toc_body;

    parser.renderer.rules.toc_body = (tokens, index, options, env, self) =>
    {
        slugifier.Reset();
        return originalRule(tokens, index, options, env, self);
    };
}
