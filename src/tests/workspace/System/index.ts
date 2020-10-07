import { TaskTests } from "./Tasks";

/**
 * Registers tests for system-components.
 */
export function SystemTests(): void
{
    suite(
        "System",
        () =>
        {
            TaskTests();
        });
}
