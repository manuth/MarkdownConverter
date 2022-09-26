import { basename } from "node:path";
import { ISettings } from "../../../Properties/ISettings.js";
import { ITestContext } from "../../ITestContext.js";
import { FilesTests } from "./Files.test.js";
import { ResourceTests } from "./Resources.test.js";
import { SettingTests } from "./Settings.test.js";

/**
 * Registers tests for properties.
 *
 * @param context
 * The test-context.
 */
export function PropertyTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            SettingTests(context);
            FilesTests();
            ResourceTests();
        });
}
