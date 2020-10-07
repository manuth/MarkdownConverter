import { SystemTests } from "./System";

/**
 * Registers tests for the single-file environment of vscode.
 */
export function SingleFileTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            SystemTests();
        });
}
