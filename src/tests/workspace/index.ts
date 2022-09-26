import { SystemTests } from "./System/index.js";

/**
 * Registers tests for the workspace-environment of vscode.
 */
export function WorkspaceTests(): void
{
    suite(
        "MarkdownConverter",
        () =>
        {
            SystemTests();
        });
}
