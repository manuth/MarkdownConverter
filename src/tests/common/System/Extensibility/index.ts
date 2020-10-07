import { ExtensionTests } from "./Extension.test";

/**
 * Registers tests for the extensibility.
 */
export function ExtensibilityTests(): void
{
    suite(
        "Extensibility",
        () =>
        {
            ExtensionTests();
        });
}
