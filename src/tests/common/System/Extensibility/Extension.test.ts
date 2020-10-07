import { doesNotReject, ok, strictEqual } from "assert";
import { Package } from "@manuth/package-json-editor";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import dedent = require("dedent");
import { pathExists, writeFile } from "fs-extra";
import { normalize, resolve } from "upath";
import { commands, Uri, window } from "vscode";
import { Constants } from "../../../../Constants";
import { ISettings } from "../../../../Properties/ISettings";
import { Extension } from "../../../../System/Extensibility/Extension";
import { ITestContext } from "../../../ITestContext";

/**
 * Registers tests for the `Extension` class.
 *
 * @param context
 * The test-context.
 */
export function ExtensionTests(context: ITestContext<ISettings>): void
{
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
                            extension = new Extension(new Package(resolve(Constants.PackageDirectory, "package.json")));
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
                            strictEqual(extension.Author, "manuth");
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
                            strictEqual(extension.Name, "markdown-converter");
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
                            strictEqual(extension.FullName, "manuth.markdown-converter");
                        });
                });

            suite(
                "EnableSystemParser()",
                () =>
                {
                    let mdFile: TempFile;
                    let destinationDirectory: TempDirectory;
                    let pdfFile: string;

                    suiteSetup(
                        async function()
                        {
                            this.timeout(8 * 1000);

                            mdFile = new TempFile(
                                {
                                    Suffix: ".txt"
                                });

                            destinationDirectory = new TempDirectory();
                            pdfFile = destinationDirectory.MakePath("test.pdf");

                            await writeFile(
                                mdFile.FullName,
                                dedent(
                                    `
                                    # Hello World`));

                            await window.showTextDocument(Uri.file(mdFile.FullName));
                        });

                    suiteTeardown(
                        async function()
                        {
                            this.timeout(8 * 1000);
                            await commands.executeCommand("workbench.action.closeActiveEditor");
                            mdFile.Dispose();
                            destinationDirectory.Dispose();
                        });

                    setup(
                        () =>
                        {
                            context.Settings.ConversionType = ["PDF"];
                            context.Settings.DestinationPattern = normalize(pdfFile);
                            context.Settings.IgnoreLanguageMode = true;
                        });

                    test(
                        "Checking whether the system-parser can be enabled manually…",
                        async function()
                        {
                            this.slow(11.5 * 1000);
                            this.timeout(46 * 1000);

                            await doesNotReject(
                                async () =>
                                {
                                    await commands.executeCommand("markdownConverter.Convert");
                                });

                            ok(await pathExists(pdfFile));
                        });
                });
        });
}
