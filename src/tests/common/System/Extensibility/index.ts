import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { ExtensionTests } from "./Extension.test";

/**
 * Registers tests for the extensibility.
 *
 * @param context
 * The test-context.
 */
export function ExtensibilityTests(context: ITestContext<ISettings>): void
{
    suite(
        "Extensibility",
        () =>
        {
            ExtensionTests(context);
        });
}
