import { ConversionRunnerTests } from "./ConversionRunner.test";
import { ConvertTaskTests } from "./ConvertTask.test";
import { PuppeteerTaskTests } from "./PuppeteerTask.test";

/**
 * Registers tests for tasks.
 */
export function TaskTests(): void
{
    suite(
        "Tasks",
        () =>
        {
            PuppeteerTaskTests();
            ConversionRunnerTests();
            ConvertTaskTests();
        });
}
