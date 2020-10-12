import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { ConversionRunnerTests } from "./ConversionRunner.test";
import { ConvertAllTaskTests } from "./ConvertAllTask.test";

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
            ConversionRunnerTests(context);
            ConvertAllTaskTests();
        });
}
