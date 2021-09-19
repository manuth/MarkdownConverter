import { basename } from "path";
import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { ConversionRunnerTests } from "./ConversionRunner.test";
import { ConversionTaskTests } from "./ConversionTask.test";
import { ConvertTaskTests } from "./ConvertTask.test";
import { NoConversionTypeExceptionTests } from "./NoConversionTypeException.test";
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
        basename(__dirname),
        () =>
        {
            PuppeteerTaskTests(context);
            ConversionRunnerTests(context);
            NoConversionTypeExceptionTests();
            ConversionTaskTests(context);
            ConvertTaskTests(context);
        });
}
