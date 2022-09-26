import { basename } from "node:path";
import { ISettings } from "../../../../Properties/ISettings.js";
import { ITestContext } from "../../../ITestContext.js";
import { ConversionRunnerTests } from "./ConversionRunner.test.js";
import { ConversionTaskTests } from "./ConversionTask.test.js";
import { ConvertTaskTests } from "./ConvertTask.test.js";
import { NoConversionTypeExceptionTests } from "./NoConversionTypeException.test.js";
import { OperationCancelledExceptionTests } from "./OperationCancelledException.test.js";
import { PuppeteerTaskTests } from "./PuppeteerTask.test.js";

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
            OperationCancelledExceptionTests();
            PuppeteerTaskTests(context);
            ConversionRunnerTests(context);
            NoConversionTypeExceptionTests();
            ConversionTaskTests(context);
            ConvertTaskTests(context);
        });
}
