import Assert = require("assert");
import Dedent = require("dedent");
import FileSystem = require("fs-extra");
import { TempDirectory, TempFile } from "temp-filesystem";
import Path = require("upath");
import { commands, ConfigurationTarget, TextEditor, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { Settings } from "../../../../Properties/Settings";
import { Extension } from "../../../../System/Extensibility/Extension";

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
                        extension = new Extension(Path.resolve(__dirname, "..", "..", "..", "..", "..", ".."));
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
                let originalSettings: Array<ReturnType<WorkspaceConfiguration["inspect"]>>;
                let config: WorkspaceConfiguration;

                suiteSetup(
                    async () =>
                    {
                        config = workspace.getConfiguration();
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

                        originalSettings = [];
                        let settingKeys = [
                            "ConversionType",
                            "DestinationPattern",
                            "IgnoreLanguageMode"
                        ];

                        for (let key of settingKeys)
                        {
                            originalSettings.push(config.inspect(`${Settings["configKey"]}.${key}`));
                        }

                        for (let setting of originalSettings)
                        {
                            if (setting.globalValue !== undefined)
                            {
                                await config.update(setting.key, undefined, ConfigurationTarget.Global);
                            }

                            if (setting.workspaceValue !== undefined)
                            {
                                await config.update(setting.key, undefined, ConfigurationTarget.Workspace);
                            }

                            if (setting.workspaceFolderValue !== undefined)
                            {
                                await config.update(setting.key, undefined, ConfigurationTarget.WorkspaceFolder);
                            }
                        }

                        await config.update(`${Settings["configKey"]}.ConversionType`, [ConversionType[ConversionType.PDF]], ConfigurationTarget.Global);
                        await config.update(`${Settings["configKey"]}.DestinationPattern`, Path.normalizeSafe(pdfFile), ConfigurationTarget.Global);
                        await config.update(`${Settings["configKey"]}.IgnoreLanguageMode`, true, ConfigurationTarget.Global);
                    });

                suiteTeardown(
                    async () =>
                    {
                        for (let setting of originalSettings)
                        {
                            let newSetting = config.inspect(setting.key);

                            if (setting.globalValue !== newSetting.globalValue)
                            {
                                await config.update(setting.key, setting.globalValue, ConfigurationTarget.Global);
                            }

                            if (setting.workspaceValue !== newSetting.workspaceValue)
                            {
                                await config.update(setting.key, setting.workspaceValue, ConfigurationTarget.Workspace);
                            }

                            if (setting.workspaceFolderValue !== newSetting.workspaceFolderValue)
                            {
                                await config.update(setting.key, setting.workspaceFolderValue, ConfigurationTarget.WorkspaceFolder);
                            }
                        }

                        await commands.executeCommand("workbench.action.closeActiveEditor");
                        mdFile.Dispose();
                        destinationDirectory.Dispose();
                    });

                test(
                    "Checking whether the system-parser can be enabled manually…",
                    async function()
                    {
                        this.enableTimeouts(false);
                        await Assert.doesNotReject(
                            async () =>
                            {
                                await commands.executeCommand("markdownConverter.Convert");
                            });
                        Assert(await FileSystem.pathExists(pdfFile));
                    });
            });
    });