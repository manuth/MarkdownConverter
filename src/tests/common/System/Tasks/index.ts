import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { ConversionRunnerTests } from "./ConversionRunner.test";
import { ConvertTaskTests } from "./ConvertTask.test";
import { PuppeteerTaskTests } from "./PuppeteerTask.test";

/**
 * Registers tests for tasks.
 *
 * @param context
 * The test-context.
 */
export function TaskTests(context: ITestContext<ISettings>): void
{
    suite(
        "Tasks",
        () =>
        {
            PuppeteerTaskTests(context);
            ConversionRunnerTests(context);
            ConvertTaskTests(context);
        });
}
