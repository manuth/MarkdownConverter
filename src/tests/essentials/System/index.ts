import { ExtensibilityTests } from "./Extensibility";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        "System",
        () =>
        {
            ExtensibilityTests();
        });
}
