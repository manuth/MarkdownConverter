import { basename } from "path";
import { ConversionRunnerTests } from "./ConversionRunner.test.js";
import { ConvertAllTaskTests } from "./ConvertAllTask.test.js";

/**
 * Registers tests for tasks.
 */
export function TaskTests(): void
{
    suite(
        basename(new URL(".", new URL(import.meta.url)).pathname),
        () =>
        {
            ConversionRunnerTests();
            ConvertAllTaskTests();
        });
}
