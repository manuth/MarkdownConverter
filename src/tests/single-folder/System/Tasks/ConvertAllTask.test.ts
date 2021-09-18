import { ok, rejects, strictEqual } from "assert";
import { TempDirectory } from "@manuth/temp-files";
import { pathExists } from "fs-extra";
import { createSandbox, SinonSandbox } from "sinon";
import { join, normalize } from "upath";
import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { extension } from "../../../..";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { IConvertedFile } from "../../../../Conversion/IConvertedFile";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { ISettings } from "../../../../Properties/ISettings";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";
import { ITestContext } from "../../../ITestContext";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

/**
 * Registers tests for the {@link ConvertAllTask `ConvertAllTask`} class.
 *
 * @param context
 * The test-context.
 */
export function ConvertAllTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ConvertAllTask),
        () =>
        {
            let sandbox: SinonSandbox;
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

            setup(
                () =>
                {
                    context.Settings.ConversionType = [ConversionType[ConversionType.HTML] as keyof typeof ConversionType];
                    sandbox = createSandbox();

                    sandbox.replace(task.ConversionRunner, "Execute", async () => null);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameof<TestConvertAllTask>((task) => task.Execute),
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
                            let expectedFiles = ["Test1.html", "Test2.html"];
                            let files: IConvertedFile[] = [];
                            sandbox.restore();

                            context.Settings.DestinationPattern = join(tempDir.FullName, "${basename}.${extension}");

                            await task.Execute(
                                null,
                                null,
                                {
                                    report: (file) => files.push(file)
                                });

                            strictEqual(files.length, expectedFiles.length);

                            for (let expectedFile of expectedFiles)
                            {
                                files.some((file) => normalize(file.FileName) === normalize(tempDir.MakePath(expectedFile)));
                                ok(await pathExists(tempDir.MakePath(expectedFile)));
                            }
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
                nameof<TestConvertAllTask>((task) => task.ExecuteTask),
                () =>
                {
                    test(
                        "Checking whether the progress is reported…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            let reportCount = 0;

                            await task.ExecuteTask(
                                {
                                    report: () =>
                                    {
                                        reportCount++;
                                    }
                                });

                            ok(reportCount > 0);
                        });
                });

            suite(
                nameof<TestConvertAllTask>((task) => task.GetDocuments),
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
