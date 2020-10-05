import Assert = require("assert");
import Dedent = require("dedent");
import FileSystem = require("fs-extra");
import { TempDirectory, TempFile } from "temp-filesystem";
import Path = require("upath");
import { commands, ConfigurationTarget, TextEditor, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { Constants } from "../../../../Constants";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { Settings } from "../../../../Properties/Settings";
import { Extension } from "../../../../System/Extensibility/Extension";
import { ConfigRestorer } from "../../../ConfigRestorer";

suite(
    "Extension",
    () =>
    {
        let extension: Extension;

        suite(
            "constructor()",
            () =>
            {
                test(
                    "Checking whether the extension can be initialized correctly…",
                    () =>
                    {
                        extension = new Extension(Path.resolve(Constants.PackageDirectory));
                    });
            });

        suite(
            "Author",
            () =>
            {
                test(
                    "Checking whether the author is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.Author, "manuth");
                    });
            });

        suite(
            "Name",
            () =>
            {
                test(
                    "Checking whether the extension-name is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.Name, "markdown-converter");
                    });
            });

        suite(
            "FullName",
            () =>
            {
                test(
                    "Checking whether the full extension-name is resolved correctly…",
                    () =>
                    {
                        Assert.strictEqual(extension.FullName, "manuth.markdown-converter");
                    });
            });

        suite(
            "EnableSystemParser()",
            () =>
            {
                let mdFile: TempFile;
                let destinationDirectory: TempDirectory;
                let pdfFile: string;
                let configRestorer: ConfigRestorer;
                let config: WorkspaceConfiguration;

                suiteSetup(
                    async function()
                    {
                        this.timeout(4 * 1000);

                        configRestorer = new ConfigRestorer(
                            [
                                "ConversionType",
                                "DestinationPattern",
                                "IgnoreLanguageMode"
                            ],
                            Settings["configKey"]);

                        config = workspace.getConfiguration(Settings["configKey"]);
                        mdFile = new TempFile(
                            {
                                postfix: ".txt"
                            });

                        destinationDirectory = new TempDirectory();
                        pdfFile = destinationDirectory.MakePath("test.pdf");

                        await FileSystem.writeFile(
                            mdFile.FullName,
                            Dedent(
                                `
                                # Hello World`));

                        await window.showTextDocument(Uri.file(mdFile.FullName));
                        await configRestorer.Clear();
                        await config.update("ConversionType", [ConversionType[ConversionType.PDF]], ConfigurationTarget.Global);
                        await config.update("DestinationPattern", Path.normalizeSafe(pdfFile), ConfigurationTarget.Global);
                        await config.update("IgnoreLanguageMode", true, ConfigurationTarget.Global);
                    });

                suiteTeardown(
                    async function()
                    {
                        this.timeout(4 * 1000);
                        await configRestorer.Restore();
                        await commands.executeCommand("workbench.action.closeActiveEditor");
                        mdFile.Dispose();
                        destinationDirectory.Dispose();
                    });

                test(
                    "Checking whether the system-parser can be enabled manually…",
                    async function()
                    {
                        this.slow(11.5 * 1000);
                        this.timeout(46 * 1000);
                        await Assert.doesNotReject(
                            async () =>
                            {
                                await commands.executeCommand("markdownConverter.Convert");
                            });
                        Assert(await FileSystem.pathExists(pdfFile));
                    });
            });
    });