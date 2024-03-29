import { basename } from "node:path";
import { ExtensibilityTests } from "./Extensibility/index.test.js";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            ExtensibilityTests();
        });
}
