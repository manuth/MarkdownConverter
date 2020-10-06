import { ok, rejects, strictEqual } from "assert";
import { TempDirectory } from "@manuth/temp-files";
import { pathExists } from "fs-extra";
import { join } from "upath";
import { commands, ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { extension } from "../../../../extension";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { Settings } from "../../../../Properties/Settings";
import { ConfigRestorer } from "../../../ConfigRestorer";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

suite(
    "ConvertAllTask",
    () =>
    {
        let task: TestConvertAllTask;
        let config: WorkspaceConfiguration;
        let markdownConfig: WorkspaceConfiguration;
        let configRestorer: ConfigRestorer;
        let markdownConfigRestorer: ConfigRestorer;

        suiteSetup(
            () =>
            {
                task = new TestConvertAllTask(extension);
                config = workspace.getConfiguration();
                markdownConfig = workspace.getConfiguration(Settings.ConfigKey);

                configRestorer = new ConfigRestorer(
                    [
                        "files.exclude"
                    ]);

                markdownConfigRestorer = new ConfigRestorer(
                    [
                        "ConversionType",
                        "DestinationPattern"
                    ],
                    Settings.ConfigKey);
            });

        suiteTeardown(
            async () =>
            {
                await configRestorer.Restore();
                await markdownConfigRestorer.Restore();
            });

        setup(
            async () =>
            {
                await configRestorer.Clear();
                await markdownConfigRestorer.Clear();
            });

        suite(
            "ExecuteTask(Progress<IProgressState> progressReporter?, CancellationToken cancellationToken?, Progress<IConvertedFile> fileReporter?)",
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
                        this.slow(16.5 * 1000);
                        this.timeout(1.1 * 60 * 1000);
                        await markdownConfig.update("DestinationPattern", join(tempDir.FullName, "${basename}.${extension}"), ConfigurationTarget.Global);
                        await markdownConfig.update("ConversionType", [ConversionType[ConversionType.PDF]], ConfigurationTarget.Global);
                        await commands.executeCommand("markdownConverter.ConvertAll");
                        ok(await pathExists(tempDir.MakePath("Test1.pdf")));
                        ok(await pathExists(tempDir.MakePath("Test2.pdf")));
                    });

                test(
                    "Checking whether an exception is thrown if no markdown-file exists in the workspace…",
                    async function()
                    {
                        this.slow(1.2 * 1000);
                        this.timeout(4.8 * 1000);
                        await config.update("files.exclude", { "**/*.md": true }, ConfigurationTarget.Global);
                        await rejects(() => task.Execute(), MarkdownFileNotFoundException);
                    });
            });

        suite(
            "GetDocuments()",
            () =>
            {
                test(
                    "Checking whether all documents in the folder are found…",
                    async function()
                    {
                        this.slow(1.2 * 1000);
                        this.timeout(4.8 * 1000);
                        strictEqual((await task.GetDocuments()).length, 2);
                    });
            });
    });
