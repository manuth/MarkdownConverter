import { basename } from "node:path";
import { ISettings } from "../../../../Properties/ISettings.js";
import { ITestContext } from "../../../ITestContext.js";
import { ConversionRunnerTests } from "./ConversionRunner.test.js";
import { ConvertAllTaskTests } from "./ConvertAllTask.test.js";

/**
 * Registers tests for tasks.
 *
 * @param context
 * The test-context.
 */
export function TaskTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            ConversionRunnerTests(context);
            ConvertAllTaskTests();
        });
}
