import { ISettings } from "../../Properties/ISettings";
import { ITestContext } from "../ITestContext";
import { SystemTests } from "./System";

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
