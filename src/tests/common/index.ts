import { ISettings } from "../../Properties/ISettings.js";
import { ITestContext } from "../ITestContext.js";
import { ConversionTests } from "./Conversion/index.js";
import { MarkdownConverterExtensionTests } from "./MarkdownConverterExtension.test.js";
import { PropertyTests } from "./Properties/index.js";
import { SystemTests } from "./System/index.js";

/**
 * Registers common tests.
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
            MarkdownConverterExtensionTests(context);
        });
}
