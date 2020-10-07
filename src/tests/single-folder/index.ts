import { SystemTests } from "./System";

/**
 * Registers tests for the single-folder environment of vscode.
 */
export function SingleFolderTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            SystemTests();
        });
}
