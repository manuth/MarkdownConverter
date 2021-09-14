import { basename } from "path";
import { ConvertAllTaskTests } from "./ConvertAllTask.test";

/**
 * Registers tests for tasks.
 */
export function TaskTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            ConvertAllTaskTests();
        });
}
