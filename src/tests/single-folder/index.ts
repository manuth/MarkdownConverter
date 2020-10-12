import { ISettings } from "../../Properties/ISettings";
import { ITestContext } from "../ITestContext";
import { SystemTests } from "./System";

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
