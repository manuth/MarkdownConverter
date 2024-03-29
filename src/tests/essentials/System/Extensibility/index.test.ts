import { basename } from "node:path";
import { ExtensionTests } from "./Extension.test.js";

/**
 * Registers tests for extensibility-components.
 */
export function ExtensibilityTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            ExtensionTests();
        });
}
