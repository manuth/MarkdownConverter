import { ConvertAllTaskTests } from "./ConvertAllTask.test";

/**
 * Registers tests for tasks.
 */
export function TaskTests(): void
{
    suite(
        "Tasks",
        () =>
        {
            ConvertAllTaskTests();
        });
}
