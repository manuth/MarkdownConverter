import Assert = require("assert");
import FileSystem = require("fs-extra");
import MarkdownIt = require("markdown-it");
import Puppeteer = require("puppeteer-core");
import { TempDirectory, TempFile } from "temp-filesystem";
import Path = require("upath");
import { isNullOrUndefined } from "util";
import { TextDocument, workspace } from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType";
import { Converter } from "../../../Conversion/Converter";
import { extension } from "../../../extension";
import { Document } from "../../../System/Documents/Document";

suite(
    "Converter",
    () =>
    {
        let converter: Converter;
        let document: Document;
        let tempDir: TempDirectory;
        let tempFile: TempFile;
        let textDocument: TextDocument;

        suiteSetup(
            async function()
            {
                this.enableTimeouts(false);
                let parser = new MarkdownIt();
                tempDir = new TempDirectory();
                tempFile = new TempFile(
                    {
                        dir: tempDir.FullName,
                        postfix: ".md"
                    });

                await FileSystem.writeFile(tempFile.FullName, "This is a test");
                textDocument = await workspace.openTextDocument(tempFile.FullName);
                document = new Document(textDocument, parser);
            });

        suiteTeardown(
            () =>
            {
                tempDir.Dispose();
                tempFile.Dispose();
            });

        suite(
            "constructor(string workspaceRoot, Document document)",
            () =>
            {
                test(
                    "Checking whether the properties are set correctly…",
                    () =>
                    {
                        converter = new Converter(tempDir.FullName, document);
                        Assert.strictEqual(converter.WorkspaceRoot, tempDir.FullName);
                        Assert.strictEqual(converter.Document, document);
                    });
            });

        suite(
            "Checking the state of the converter before the initialization…",
            () =>
            {
                test(
                    "Checking whether the object is neither initialized nor disposed…",
                    () =>
                    {
                        Assert(!converter.Initialized && !converter.Disposed);
                    });

                test(
                    "Checking whether unitialized properties equal to `null`…",
                    () =>
                    {
                        Assert.strictEqual(converter.URL, null);
                        Assert.strictEqual(converter.PortNumber, null);
                        Assert.strictEqual(converter["WebServer"], null);
                        Assert.strictEqual(converter["Browser"], null);
                    });
            });

        suite(
            "Checking whether the methods act as expected…",
            () =>
            {
                test(
                    "Start(ConversionType conversionType, string path, Progress<IProgressState> progressReporter?)",
                    async () =>
                    {
                        await Assert.rejects(converter.Start(ConversionType.HTML, ""));
                    });
            });

        suite(
            "Initialize(progressReporter?: Progress<IProgressState>)",
            () =>
            {
                test(
                    "Checking whether the converter can be initialized…",
                    async () =>
                    {
                        await Assert.doesNotReject(converter.Initialize());
                    });
            });

        suite(
            "Checking the state of the converter after the initialization…",
            () =>
            {
                test(
                    "Checking whether the converter is initialized…",
                    () =>
                    {
                        Assert(converter.Initialized);
                    });

                test(
                    "Checking whether the properties have been initialized…",
                    () =>
                    {
                        Assert(!isNullOrUndefined(converter.URL));
                        Assert(!isNullOrUndefined(converter.PortNumber));
                        Assert(!isNullOrUndefined(converter["WebServer"]));
                        Assert(!isNullOrUndefined(converter["Browser"]));
                    });

                suite(
                    "Checking whether the methods act as expected…",
                    async () =>
                    {
                        test(
                            "Initialize(Progress<IProgressState> progressReporter?)",
                            async () =>
                            {
                                await Assert.rejects(converter.Initialize());
                            });
                    });
            });

        suite(
            "Start(ConversionType conversionType, string path, Progress<IProgressState> progressReporter?)",
            () =>
            {
                test(
                    "Checking whether files can be converted…",
                    async function()
                    {
                        this.enableTimeouts(false);

                        let conversionTypes = [
                            ConversionType.HTML,
                            ConversionType.JPEG,
                            ConversionType.PDF,
                            ConversionType.PNG,
                            ConversionType.SelfContainedHTML
                        ];

                        for (let conversionType of conversionTypes)
                        {
                            let extension: string;

                            switch (conversionType)
                            {
                                case ConversionType.HTML:
                                case ConversionType.SelfContainedHTML:
                                    extension = "html";
                                    break;
                                case ConversionType.JPEG:
                                    extension = "jpg";
                                    break;
                                case ConversionType.PDF:
                                    extension = "pdf";
                                    break;
                                case ConversionType.PNG:
                                    extension = "png";
                                    break;
                            }

                            let path = Path.changeExt(tempFile.FullName, extension);
                            await converter.Start(conversionType, path);
                            Assert(await FileSystem.pathExists(path));
                            await FileSystem.remove(path);

                            if (conversionType === ConversionType.SelfContainedHTML)
                            {
                                let resourcePath = Path.changeExt(path, null);

                                if (await FileSystem.pathExists(resourcePath))
                                {
                                    await FileSystem.remove(resourcePath);
                                }
                            }
                        }
                    });
            });
    });