import { basename } from "path";
import { ExtensionTests } from "./Extension.test.js";
import { MarkdownContributionTests } from "./MarkdownContributions.test.js";

/**
 * Registers tests for the extensibility.
 */
export function ExtensibilityTests(): void
{
    suite(
        basename(new URL(".", new URL(import.meta.url)).pathname),
        () =>
        {
            MarkdownContributionTests();
            ExtensionTests();
        });
}
