import { basename } from "path";
import { ConversionRunnerTests } from "./ConversionRunner.test";
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
            ConversionRunnerTests();
            ConvertAllTaskTests();
        });
}
