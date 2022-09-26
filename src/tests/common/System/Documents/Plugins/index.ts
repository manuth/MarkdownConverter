import { basename } from "path";
import { MarkdownAnchorPluginTests } from "./MarkdownAnchorPlugin.test";
import { MarkdownTocPluginTests } from "./MarkdownTocPlugin.test";

/**
 * Registers tests for `markdown-it`-plugins.
 */
export function PluginTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            MarkdownAnchorPluginTests();
            MarkdownTocPluginTests();
        });
}
