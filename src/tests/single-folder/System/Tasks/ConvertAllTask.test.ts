import { ok, rejects, strictEqual } from "assert";
import { TempDirectory } from "@manuth/temp-files";
import { pathExists } from "fs-extra";
import { join } from "upath";
import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { extension } from "../../../..";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

/**
 * Registers tests for the `ConvertAllTask` class.
 *
 * @param context
 * The test-context.
 */
export function ConvertAllTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        "ConvertAllTask",
        () =>
        {
            let excludeKey: string;
            let task: TestConvertAllTask;
            let config: WorkspaceConfiguration;

            suiteSetup(
                () =>
                {
                    excludeKey = "files.exclude";
                    task = new TestConvertAllTask(extension);
                    config = workspace.getConfiguration(undefined, workspace.workspaceFolders[0]);
                });

            suite(
                "Execute",
                () =>
                {
                    let tempDir: TempDirectory;

                    suiteSetup(
                        () =>
                        {
                            tempDir = new TempDirectory();
                        });

                    suiteTeardown(
                        () =>
                        {
                            tempDir.Dispose();
                        });

                    test(
                        "Checking whether all files are being converted…",
                        async function()
                        {
                            this.slow(0.5 * 60 * 1000);
                            this.timeout(1 * 60 * 1000);
                            context.Settings.DestinationPattern = join(tempDir.FullName, "${basename}.${extension}");
                            context.Settings.ConversionType = ["PDF"];
                            await task.Execute();
                            ok(await pathExists(tempDir.MakePath("Test1.pdf")));
                            ok(await pathExists(tempDir.MakePath("Test2.pdf")));
                        });

                    test(
                        "Checking whether an exception is thrown if no markdown-file exists in the workspace…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            await config.update(excludeKey, { "**/*.md": true }, ConfigurationTarget.Workspace);
                            await rejects(() => task.Execute(), MarkdownFileNotFoundException);
                            await config.update(excludeKey, undefined);
                        });
                });

            suite(
                "GetDocuments",
                () =>
                {
                    test(
                        "Checking whether all documents in the folder are found…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            strictEqual((await task.GetDocuments()).length, 2);
                        });
                });
        });
}
