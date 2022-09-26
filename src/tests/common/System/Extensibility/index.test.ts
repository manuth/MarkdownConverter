import { basename } from "node:path";
import { ExtensionTests } from "./Extension.test.js";
import { MarkdownContributionTests } from "./MarkdownContributions.test.js";

/**
 * Registers tests for the extensibility.
 */
export function ExtensibilityTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            MarkdownContributionTests();
            ExtensionTests();
        });
}
