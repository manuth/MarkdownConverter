import Assert = require("assert");
import FileSystem = require("fs-extra");
import { TempDirectory } from "temp-filesystem";
import Path = require("upath");
import { commands, ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { extension } from "../../../../extension";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { Settings } from "../../../../Properties/Settings";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";
import { ConfigRestorer } from "../../../ConfigRestorer";

suite(
    "ConvertAllTask",
    () =>
    {
        let task: ConvertAllTask;
        let config: WorkspaceConfiguration;
        let markdownConfig: WorkspaceConfiguration;
        let configRestorer: ConfigRestorer;
        let markdownConfigRestorer: ConfigRestorer;

        suiteSetup(
            () =>
            {
                task = new ConvertAllTask(extension);
                config = workspace.getConfiguration();
                markdownConfig = workspace.getConfiguration(Settings["configKey"]);
                configRestorer = new ConfigRestorer(
                    [
                        "files.exclude"
                    ]);
                markdownConfigRestorer = new ConfigRestorer(
                    [
                        "ConversionType",
                        "DestinationPattern"
                    ],
                    Settings["configKey"]);
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
                        await markdownConfig.update("DestinationPattern", Path.joinSafe(tempDir.FullName, "${basename}.${extension}"), ConfigurationTarget.Global);
                        await markdownConfig.update("ConversionType", [ConversionType[ConversionType.PDF]], ConfigurationTarget.Global);
                        await commands.executeCommand("markdownConverter.ConvertAll");
                        Assert(await FileSystem.pathExists(tempDir.MakePath("Test1.pdf")));
                        Assert(await FileSystem.pathExists(tempDir.MakePath("Test2.pdf")));
                    });

                test(
                    "Checking whether an exception is thrown if no markdown-file exists in the workspace…",
                    async function()
                    {
                        this.slow(1.2 * 1000);
                        this.timeout(4.8 * 1000);
                        await config.update("files.exclude", { "**/*.md": true }, ConfigurationTarget.Global);
                        await Assert.rejects(() => task.Execute(), MarkdownFileNotFoundException);
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
                        Assert.strictEqual((await task["GetDocuments"]()).length, 2);
                    });
            });
    });