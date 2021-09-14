import { doesNotReject, ok, rejects, strictEqual } from "assert";
import { Server } from "http";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { pathExists, remove, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import puppeteer = require("puppeteer-core");
import { changeExt } from "upath";
import { TextDocument, workspace } from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType";
import { Converter } from "../../../Conversion/Converter";
import { Document } from "../../../System/Documents/Document";

/**
 * Registers tests for the {@link Converter `Converter`} class.
 */
export function ConverterTests(): void
{
    suite(
        nameof(Converter),
        () =>
        {
            let converter: TestConverter;
            let initializedConverter: TestConverter;
            let document: Document;
            let tempDir: TempDirectory;
            let tempFile: TempFile;
            let outFile: TempFile;
            let textDocument: TextDocument;

            /**
             * Provides an implementation of the {@link Converter `Converter`} class for testing.
             */
            class TestConverter extends Converter
            {
                /**
                 * @inheritdoc
                 */
                public override get WebServer(): Server
                {
                    return super.WebServer;
                }

                /**
                 * @inheritdoc
                 */
                public override get Browser(): puppeteer.Browser
                {
                    return super.Browser;
                }
            }

            suiteSetup(
                async () =>
                {
                    let parser = new MarkdownIt();
                    tempDir = new TempDirectory();

                    tempFile = new TempFile(
                        {
                            Directory: tempDir.FullName,
                            Suffix: ".md"
                        });

                    outFile = new TempFile(
                        {
                            Directory: tempDir.FullName,
                            Suffix: ".tmp"
                        });

                    await writeFile(tempFile.FullName, "This is a test");
                    textDocument = await workspace.openTextDocument(tempFile.FullName);
                    document = new Document(parser, textDocument);
                });

            suiteTeardown(
                () =>
                {
                    tempFile.Dispose();
                    outFile.Dispose();
                    tempDir.Dispose();
                });

            setup(
                async () =>
                {
                    converter = new TestConverter(tempDir.FullName, document);
                    converter.ChromiumExecutablePath = null;
                    initializedConverter = new TestConverter(tempDir.FullName, document);
                    await initializedConverter.Initialize();
                });

            suite(
                nameof(Converter.constructor),
                () =>
                {
                    test(
                        "Checking whether the properties are set correctly…",
                        () =>
                        {
                            converter = new TestConverter(tempDir.FullName, document);
                            strictEqual(converter.DocumentRoot, tempDir.FullName);
                            strictEqual(converter.Document, document);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Initialized),
                () =>
                {
                    test(
                        "Checking whether the value is initially `false`…",
                        () =>
                        {
                            ok(!converter.Initialized);
                        });

                    test(
                        "Checking whether the value is `true` after the initialization…",
                        async () =>
                        {
                            ok(initializedConverter.Initialized);
                        });

                    test(
                        "Checking whether the value is `false` after a disposal…",
                        async function()
                        {
                            this.timeout(2 * 1000);
                            this.slow(1 * 1000);
                            await initializedConverter.Dispose();
                            ok(!converter.Initialized);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Disposed),
                () =>
                {
                    test(
                        "Checking whether the value represents the state of the converter correctly…",
                        async function()
                        {
                            this.timeout(3 * 1000);
                            this.slow(1.5 * 1000);
                            ok(!converter.Disposed);
                            await converter.Initialize();
                            ok(!converter.Disposed);
                            await converter.Dispose();
                            ok(converter.Disposed);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.URL),
                () =>
                {
                    let browser: puppeteer.Browser;
                    let page: puppeteer.Page;

                    suiteSetup(
                        async () =>
                        {
                            browser = await puppeteer.launch(
                                {
                                    args: [
                                        "--no-sandbox"
                                    ]
                                });

                            page = await browser.newPage();
                        });

                    suiteTeardown(
                        async () =>
                        {
                            await browser.close();
                        });

                    test(
                        `Checking whether the \`${nameof<Converter>((c) => c.URL)}\` property equals \`${null}\` before the initialization…`,
                        () =>
                        {
                            strictEqual(converter.URL, null);
                        });

                    test(
                        `Checking whether the rendered document is served under the \`${nameof<Converter>((c) => c.URL)}\` after the initialization…`,
                        async function()
                        {
                            this.timeout(10 * 1000);
                            this.slow(5 * 1000);
                            let response = await page.goto(initializedConverter.URL);
                            strictEqual(await response.text(), await document.Render());
                        });

                    test(
                        "Checking whether changes made to the document take affect immediately…",
                        async function()
                        {
                            this.timeout(10 * 1000);
                            this.slow(5 * 1000);
                            let response = await page.goto(initializedConverter.URL);
                            strictEqual(await response.text(), await document.Render());
                            document.Content = "This is a test";
                            response = await page.reload();
                            strictEqual(await response.text(), await document.Render());
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.BrowserOptions),
                () =>
                {
                    test(
                        "Checking whether the Chromium Executable-Path is included only if specified…",
                        () =>
                        {
                            let executablePathOption = nameof<puppeteer.LaunchOptions>((options) => options.executablePath);
                            converter.ChromiumExecutablePath = null;
                            ok(!(executablePathOption in converter.BrowserOptions));
                            converter.ChromiumExecutablePath = "hello world";
                            ok(executablePathOption in converter.BrowserOptions);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Initialize),
                () =>
                {
                    test(
                        "Checking whether the converter can be initialized…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(2 * 1000);
                            await doesNotReject(() => converter.Initialize());
                        });

                    suite(
                        "Uninitialized Converter State Tests",
                        () =>
                        {
                            test(
                                "Checking whether uninitialized components are equal to `null`…",
                                async () =>
                                {
                                    strictEqual(converter.URL, null);
                                    strictEqual(converter.PortNumber, null);
                                    strictEqual(converter.WebServer, null);
                                    strictEqual(converter.Browser, null);
                                });
                        });

                    suite(
                        "Initialized Converter State Tests",
                        () =>
                        {
                            setup(
                                async () =>
                                {
                                    await converter.Initialize();
                                });

                            test(
                                "Checking whether all properties are initialized…",
                                () =>
                                {
                                    ok(converter.URL);
                                    ok(converter.PortNumber);
                                    ok(converter.WebServer);
                                    ok(converter.Browser);
                                });
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Dispose),
                () =>
                {
                    let browser: puppeteer.Browser;
                    let webServer: Server;

                    setup(
                        async () =>
                        {
                            browser = initializedConverter.Browser;
                            webServer = initializedConverter.WebServer;
                            await initializedConverter.Dispose();
                        });

                    test(
                        "Checking whether the browser of the converter is closed after the disposal…",
                        () =>
                        {
                            ok(!browser.isConnected());
                        });

                    test(
                        "Checking whether the temporary webserver is closed after the disposal…",
                        () =>
                        {
                            ok(!webServer.listening);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Start),
                () =>
                {
                    test(
                        "Checking whether the method raises an error if executed before initialization…",
                        async () =>
                        {
                            await rejects(() => converter.Start(ConversionType.HTML, outFile.FullName));
                        });

                    test(
                        "Checking whether the method can be executed after the initialization…",
                        async () =>
                        {
                            await doesNotReject(() => initializedConverter.Start(ConversionType.HTML, outFile.FullName));
                        });

                    test(
                        "Checking whether files can be converted using the method…",
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
                                await initializedConverter.Start(conversionType, outFile.FullName);
                                ok(await pathExists(outFile.FullName));
                                await remove(outFile.FullName);

                                if (conversionType === ConversionType.SelfContainedHTML)
                                {
                                    let resourcePath = changeExt(outFile.FullName, null);

                                    if (await pathExists(resourcePath))
                                    {
                                        await remove(resourcePath);
                                    }
                                }
                            }
                        });
                });
        });
}
