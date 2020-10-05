import Assert = require("assert");
import { TempFile } from "temp-filesystem";
import { ConfigurationTarget, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { extension } from "../../../../extension";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { Settings } from "../../../../Properties/Settings";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ConvertTask } from "../../../../System/Tasks/ConvertTask";
import { ConfigRestorer } from "../../../ConfigRestorer";

suite(
    "ConvertTask",
    () =>
    {
        suite(
            "GetMarkdownDocument()",
            () =>
            {
                let config: WorkspaceConfiguration;
                let configRestorer: ConfigRestorer;
                let testFile: TempFile;
                let task: ConvertTask;

                suiteSetup(
                    async () =>
                    {
                        config = workspace.getConfiguration(Settings["configKey"]);
                        configRestorer = new ConfigRestorer(
                            [
                                "IgnoreLanguageMode"
                            ],
                            Settings["configKey"]);

                        testFile = new TempFile(
                            {
                                postfix: ".txt"
                            });

                        task = new ConvertTask(extension);
                        await window.showTextDocument(Uri.file(testFile.FullName));
                    });

                suiteTeardown(
                    async () =>
                    {
                        await configRestorer.Restore();
                        testFile.Dispose();
                    });

                setup(
                    async () =>
                    {
                        await configRestorer.Clear();
                        await config.update("IgnoreLanguageMode", false, ConfigurationTarget.Global);
                    });

                test(
                    "Checking whether an exception is thrown if no markdown-file is opened…",
                    () =>
                    {
                        Assert.throws(task["GetMarkdownDocument"], MarkdownFileNotFoundException);
                    });

                test(
                    "Checking whether no exception is thrown if `IgnoreLanguageMode` is enabled…",
                    async function()
                    {
                        this.slow(80);
                        await config.update("IgnoreLanguageMode", true, ConfigurationTarget.Global);
                        Assert.doesNotThrow(() => task["GetMarkdownDocument"]());
                    });
            });
    });