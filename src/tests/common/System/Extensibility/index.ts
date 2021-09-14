import { basename } from "path";
import { ExtensionTests } from "./Extension.test";

/**
 * Registers tests for the extensibility.
 */
export function ExtensibilityTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            ExtensionTests();
        });
}
