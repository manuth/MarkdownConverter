import { ISettings } from "../../Properties/ISettings.js";
import { ITestContext } from "../ITestContext.js";
import { SystemTests } from "./System/index.test.js";

/**
 * Registers tests for the single-file environment of vscode.
 *
 * @param context
 * The test-context.
 */
export function SingleFileTests(context: ITestContext<ISettings>): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            SystemTests(context);
        });
}
