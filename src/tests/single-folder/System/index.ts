import { basename } from "path";
import { ISettings } from "../../../Properties/ISettings.js";
import { ITestContext } from "../../ITestContext.js";
import { TaskTests } from "./Tasks/index.js";

/**
 * Registers tests for system-components.
 *
 * @param context
 * The test-context.
 */
export function SystemTests(context: ITestContext<ISettings>): void
{
    suite(
        basename(new URL(".", new URL(import.meta.url)).pathname),
        () =>
        {
            TaskTests(context);
        });
}
