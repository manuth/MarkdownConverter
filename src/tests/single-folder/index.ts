import { ISettings } from "../../Properties/ISettings.js";
import { ITestContext } from "../ITestContext.js";
import { SystemTests } from "./System/index.js";

/**
 * Registers tests for the single-folder environment of vscode.
 *
 * @param context
 * The test-context.
 */
export function SingleFolderTests(context: ITestContext<ISettings>): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            SystemTests(context);
        });
}
