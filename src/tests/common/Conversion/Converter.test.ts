import { doesNotReject, ok, rejects, strictEqual } from "assert";
import { pathExists, remove, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { TempDirectory, TempFile } from "temp-filesystem";
import { changeExt } from "upath";
import { TextDocument, workspace } from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType";
import { Converter } from "../../../Conversion/Converter";
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
            async () =>
            {
                let parser = new MarkdownIt();
                tempDir = new TempDirectory();

                tempFile = new TempFile(
                    {
                        dir: tempDir.FullName,
                        postfix: ".md"
                    });

                await writeFile(tempFile.FullName, "This is a test");
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
                        strictEqual(converter.WorkspaceRoot, tempDir.FullName);
                        strictEqual(converter.Document, document);
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
                        ok(!converter.Initialized && !converter.Disposed);
                    });

                test(
                    "Checking whether unitialized properties equal to `null`…",
                    () =>
                    {
                        strictEqual(converter.URL, null);
                        strictEqual(converter.PortNumber, null);
                        strictEqual(converter["WebServer"], null);
                        strictEqual(converter["Browser"], null);
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
                        await rejects(converter.Start(ConversionType.HTML, ""));
                    });
            });

        suite(
            "Initialize(progressReporter?: Progress<IProgressState>)",
            () =>
            {
                test(
                    "Checking whether the converter can be initialized…",
                    async function()
                    {
                        this.slow(380);
                        await doesNotReject(() => converter.Initialize());
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
                        ok(converter.Initialized);
                    });

                test(
                    "Checking whether the properties have been initialized…",
                    () =>
                    {
                        ok(converter.URL);
                        ok(converter.PortNumber);
                        ok(converter["WebServer"]);
                        ok(converter["Browser"]);
                    });
            });

        suite(
            "Checking whether the methods act as expected…",
            async () =>
            {
                test(
                    "Initialize(Progress<IProgressState> progressReporter?)",
                    async () =>
                    {
                        await rejects(converter.Initialize());
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
                        this.slow(15 * 1000);
                        this.timeout(1 * 60 * 1000);

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

                            let path = changeExt(tempFile.FullName, extension);
                            await converter.Start(conversionType, path);
                            ok(await pathExists(path));
                            await remove(path);

                            if (conversionType === ConversionType.SelfContainedHTML)
                            {
                                let resourcePath = changeExt(path, null);

                                if (await pathExists(resourcePath))
                                {
                                    await remove(resourcePath);
                                }
                            }
                        }
                    });
            });
    });
