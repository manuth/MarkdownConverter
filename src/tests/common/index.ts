import { ISettings } from "../../Properties/ISettings";
import { ITestContext } from "../ITestContext";
import { ConversionTests } from "./Conversion";
import { PropertyTests } from "./Properties";
import { SystemTests } from "./System";

/**
 * Regisrers common tests.
 *
 * @param context
 * The test-context.
 */
export function CommonTests(context: ITestContext<ISettings>): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            PropertyTests(context);
            SystemTests(context);
            ConversionTests();
        });
}
