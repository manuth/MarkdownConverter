import { basename } from "path";
import { ExtensionTests } from "./Extension.test";
import { MarkdownContributionTests } from "./MarkdownContributions.test";

/**
 * Registers tests for the extensibility.
 */
export function ExtensibilityTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            MarkdownContributionTests();
            ExtensionTests();
        });
}
