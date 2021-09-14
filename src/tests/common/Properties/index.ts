import { basename } from "path";
import { ISettings } from "../../../Properties/ISettings";
import { ITestContext } from "../../ITestContext";
import { ResourceTests } from "./Resources.test";
import { SettingTests } from "./Settings.test";

/**
 * Registers tests for properties.
 *
 * @param context
 * The test-context.
 */
export function PropertyTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(__dirname),
        () =>
        {
            SettingTests(context);
            ResourceTests();
        });
}
