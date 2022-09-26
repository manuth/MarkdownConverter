import { basename } from "path";
import { ExtensibilityTests } from "./Extensibility/index.js";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        basename(new URL(".", new URL(import.meta.url)).pathname),
        () =>
        {
            ExtensibilityTests();
        });
}
