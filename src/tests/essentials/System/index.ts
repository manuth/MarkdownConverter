import { basename } from "path";
import { ExtensibilityTests } from "./Extensibility";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            ExtensibilityTests();
        });
}
