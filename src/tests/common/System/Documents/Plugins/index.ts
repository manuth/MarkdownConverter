import { basename } from "path";
import { MarkdownAnchorPluginTests } from "./MarkdownAnchorPlugin.test.js";
import { MarkdownTocPluginTests } from "./MarkdownTocPlugin.test.js";

/**
 * Registers tests for `markdown-it`-plugins.
 */
export function PluginTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            MarkdownAnchorPluginTests();
            MarkdownTocPluginTests();
        });
}
