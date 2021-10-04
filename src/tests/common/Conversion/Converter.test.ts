import { doesNotReject, notStrictEqual, ok, rejects, strictEqual } from "assert";
import { Server } from "http";
import { relative } from "path";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { pathExists, remove, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import * as puppeteer from "puppeteer-core";
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import { changeExt, normalize } from "upath";
import { Progress, TextDocument, workspace } from "vscode";
import { ConversionType } from "../../../Conversion/ConversionType";
import { Converter } from "../../../Conversion/Converter";
import { Settings } from "../../../Properties/Settings";
import { Document } from "../../../System/Documents/Document";
import { IProgressState } from "../../../System/Tasks/IProgressState";

/**
 * Registers tests for the {@link Converter `Converter`} class.
 */
export function ConverterTests(): void
{
    suite(
        nameof(Converter),
        () =>
        {
            let sandbox: SinonSandbox;
            let random: Random;
            let converter: TestConverter;
            let initializedConverter: TestConverter;
            let document: Document;
            let initialized: boolean;
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
                public override get Initialized(): boolean
                {
                    return initialized ?? super.Initialized;
                }

                /**
                 * @inheritdoc
                 */
                public override get WebDocumentName(): string
                {
                    return super.WebDocumentName;
                }

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
                    sandbox = createSandbox();
                    random = new Random();
                    converter = new TestConverter(tempDir.FullName, document);
                    initialized = null;
                    initializedConverter = new TestConverter(tempDir.FullName, document);
                    await initializedConverter.Initialize();
                });

            teardown(
                async function()
                {
                    this.timeout(5 * 1000);
                    sandbox.restore();
                    initialized = null;

                    for (let entry of [converter, initializedConverter])
                    {
                        if (entry.Initialized)
                        {
                            await entry.Dispose();
                        }
                    }
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
                nameof<TestConverter>((converter) => converter.URL),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<TestConverter>((c) => c.URL)}\` property equals \`${null}\` if \`${nameof<TestConverter>((c) => c.Initialized)} is \`${false}\`…`,
                        () =>
                        {
                            initialized = false;
                            strictEqual(initializedConverter.URL, null);
                        });

                    test(
                        `Checking whether the the \`${nameof<TestConverter>((c) => c.URL)}\` returns the expected value if \`${nameof<TestConverter>((c) => c.Initialized)} is \`${true}\`…`,
                        async function()
                        {
                            initialized = true;
                            let url = new URL(initializedConverter.URL);
                            strictEqual(url.hostname, "localhost");
                            strictEqual(parseInt(url.port), initializedConverter.PortNumber);
                            strictEqual(normalize(`./${url.pathname}`), normalize(initializedConverter.WebDocumentName));
                        });
                });

            suite(
                nameof<TestConverter>((converter) => converter.PortNumber),
                () =>
                {
                    test(
                        `Checking whether ${null} is returned if \`${nameof<TestConverter>((c) => c.Initialized)}\` is \`${false}\`…`,
                        () =>
                        {
                            initialized = false;
                            strictEqual(initializedConverter.PortNumber, null);
                        });

                    test(
                        `Checking whether a port-number is returned if \`${nameof<TestConverter>((c) => c.Initialized)}\` is \`${true}\`…`,
                        () =>
                        {
                            initialized = true;
                            ok(typeof initializedConverter.PortNumber === "number");
                        });
                });

            suite(
                nameof<TestConverter>((converter) => converter.WebDocumentName),
                () =>
                {
                    let indexFileName = "index.html";
                    let fileNameProperty = nameof.full<TestConverter>((c) => c.Document.FileName);
                    let documentRootProperty = nameof<TestConverter>((c) => c.DocumentRoot);

                    test(
                        `Checking whether \`${indexFileName}\` is returned, if either \`${fileNameProperty}\` or \`${documentRootProperty}\` are \`${undefined}\`…`,
                        () =>
                        {
                            sandbox.replaceGetter(converter.Document, "FileName", () => undefined);
                            strictEqual(converter.WebDocumentName, indexFileName);
                            sandbox.restore();
                            sandbox.replaceGetter(converter, "DocumentRoot", () => undefined);
                            strictEqual(converter.WebDocumentName, indexFileName);
                        });
                });

            suite(
                nameof<TestConverter>((converter) => converter.WebServer),
                () =>
                {
                    test(
                        "Checking whether the web-server is returned only if the converter has been initialized…",
                        () =>
                        {
                            initialized = false;
                            strictEqual(initializedConverter.WebServer, null);
                            initialized = true;
                            notStrictEqual(initializedConverter.WebServer, null);
                        });
                });

            suite(
                nameof<TestConverter>((converter) => converter.BrowserOptions),
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
                nameof<TestConverter>((converter) => converter.Browser),
                () =>
                {
                    test(
                        "Checking whether the browser is returned only if the converter has been initialized…",
                        () =>
                        {
                            initialized = false;
                            strictEqual(initializedConverter.Browser, null);
                            initialized = true;
                            notStrictEqual(initializedConverter.Browser, null);
                        });
                });

            suite(
                nameof<Converter>((converter) => converter.Initialize),
                () =>
                {
                    let browser: puppeteer.Browser;
                    let page: puppeteer.Page;
                    let noSandboxArg = "--no-sandbox";

                    setup(
                        async () =>
                        {
                            browser = await puppeteer.launch(
                                {
                                    args: [
                                        noSandboxArg
                                    ]
                                });

                            page = await browser.newPage();
                        });

                    teardown(
                        async function()
                        {
                            await page.close();
                            await browser.close();
                        });

                    test(
                        "Checking whether the converter can be initialized…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            await doesNotReject(() => converter.Initialize());
                        });

                    test(
                        "Checking whether trying to initialize a converter multiple times throws an error…",
                        async () =>
                        {
                            await rejects(() => initializedConverter.Initialize());
                        });

                    test(
                        "Checking whether the state of the converter is set correctly after the initialization…",
                        () =>
                        {
                            ok(initializedConverter.Initialized);
                        });

                    test(
                        "Checking whether at least one message is reported during the initialization…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let reportCount = 0;

                            let reporter: Progress<IProgressState> = {
                                report()
                                {
                                    reportCount++;
                                }
                            };

                            await converter.Initialize(reporter);
                            ok(reportCount > 0);
                        });

                    test(
                        `Checking whether the configured \`${nameof<Settings>((s) => s.ChromiumArgs)}\` are passed to puppeteer…`,
                        async () =>
                        {
                            let args: string[];

                            sandbox.replace(
                                puppeteer,
                                "launch",
                                async (options) =>
                                {
                                    args = options.args;
                                    return browser;
                                });

                            await converter.Initialize();

                            ok(
                                Settings.Default.ChromiumArgs.every(
                                    (argument) =>
                                    {
                                        args.includes(argument);
                                    }));
                        });

                    test(
                        `Checking whether \`${noSandboxArg}\` is passed if launching \`puppeteer\` fails…`,
                        async () =>
                        {
                            let launchedDefault = false;
                            let launchedWithNoSandboxArg = false;

                            sandbox.replace(
                                puppeteer,
                                "launch",
                                async (options) =>
                                {
                                    if (options.args?.includes(noSandboxArg))
                                    {
                                        launchedWithNoSandboxArg = true;
                                        return browser;
                                    }
                                    else
                                    {
                                        launchedDefault = true;
                                        throw new Error();
                                    }
                                });

                            await converter.Initialize();
                            ok(launchedDefault);
                            ok(launchedWithNoSandboxArg);
                        });

                    test(
                        "Checking whether all required members are initialized during the initialization…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            strictEqual(converter.URL, null);
                            strictEqual(converter.PortNumber, null);
                            strictEqual(converter.WebServer, null);
                            strictEqual(converter.Browser, null);
                            await converter.Initialize();
                            ok(typeof converter.URL === "string");
                            ok(typeof converter.PortNumber === "number");
                            ok(converter.WebServer);
                            ok(converter.Browser);
                        });

                    test(
                        `Checking whether a website is served at the port indicated by the \`${nameof<Converter>((c) => c.PortNumber)}\`-property…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);

                            await doesNotReject(
                                async () =>
                                {
                                    return page.goto(`http://localhost:${initializedConverter.PortNumber}`);
                                });
                        });

                    test(
                        "Checking whether files inside the document-root are served…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);

                            let tempFile = new TempFile(
                                {
                                    Directory: tempDir.FullName,
                                    Suffix: ".txt"
                                });

                            let url = new URL(relative(tempDir.FullName, tempFile.FullName), initializedConverter.URL);
                            let content = random.string(10);
                            await writeFile(tempFile.FullName, content);
                            let response = await page.goto(url.toString());
                            strictEqual(await response.text(), content);
                            tempFile.Dispose();
                        });

                    test(
                        `Checking whether a rendered version of the document is served at the URL indicated by the \`${nameof<Converter>((c) => c.URL)}\`-property…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let response = await page.goto(initializedConverter.URL);
                            strictEqual(response.status(), 200);
                            strictEqual(await response.text(), await initializedConverter.Document.Render());
                        });

                    test(
                        "Checking whether documents with a path containing a space or special literals are served correctly…",
                        async function()
                        {
                            this.slow(5 * 1000);
                            this.timeout(0 * 10 * 1000);
                            let testSandbox = createSandbox();

                            for (let specialName of [
                                "ä",
                                "hello world",
                                "Pokémon",
                                "My Favorite Pokémon"
                            ])
                            {
                                /**
                                 * Replaces the {@link Converter.DocumentRoot `Converter.DocumentRoot`}-property with the {@link specialName `specialName`}.
                                 */
                                function replaceDocumentRoot(): void
                                {
                                    testSandbox.replaceGetter(initializedConverter, "DocumentRoot", () => specialName);
                                }

                                /**
                                 * Replaces the {@link Document.FileName `Document.FileName`}-property with the {@link specialName `specialName`}.
                                 */
                                function replaceFileName(): void
                                {
                                    testSandbox.replaceGetter(initializedConverter.Document, "FileName", () => specialName);
                                }

                                for (let injector of [
                                    replaceDocumentRoot,
                                    replaceFileName,
                                    () =>
                                    {
                                        replaceDocumentRoot();
                                        replaceFileName();
                                    }
                                ])
                                {
                                    let content = random.string(100);
                                    injector();
                                    testSandbox.replace(initializedConverter.Document, "Render", async () => content);
                                    let response = await page.goto(initializedConverter.URL);
                                    strictEqual(response.status(), 200);
                                    strictEqual(await response.text(), await initializedConverter.Document.Render());
                                    testSandbox.restore();
                                }
                            }
                        });

                    test(
                        "Checking whether an error message is printed if the document couldn't be rendered for some reason…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let message = random.string(50);

                            sandbox.replace(
                                initializedConverter.Document,
                                "Render",
                                () =>
                                {
                                    throw new Error(message);
                                });

                            let response = await page.goto(initializedConverter.URL);
                            strictEqual(response.status(), 500);
                            ok((await response.text()).includes(message));
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
                            await converter.Initialize();
                            browser = converter.Browser;
                            webServer = converter.WebServer;
                            await converter.Dispose();
                        });

                    test(
                        "Checking whether the state of the converter is set correctly after the disposal…",
                        () =>
                        {
                            strictEqual(converter.Initialized, false);
                            strictEqual(converter.Disposed, true);
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
                        "Checking whether the method raises an error if the converter hasn't been initialized…",
                        async () =>
                        {
                            await rejects(() => converter.Start(ConversionType.HTML, outFile.FullName));
                        });

                    test(
                        "Checking whether the method can be executed after the initialization…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            await doesNotReject(() => initializedConverter.Start(ConversionType.HTML, outFile.FullName));
                        });

                    test(
                        "Checking whether messages are reported during the conversion…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let reportCount = 0;

                            await initializedConverter.Start(
                                ConversionType.HTML,
                                outFile.FullName,
                                {
                                    report()
                                    {
                                        reportCount++;
                                    }
                                });

                            ok(reportCount > 0);
                        });

                    test(
                        "Checking whether files can be converted using the method…",
                        async function()
                        {
                            this.slow(30 * 1000);
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

                    test(
                        "Checking whether the conversion can be cancelled…",
                        async () =>
                        {
                            await rejects(() => initializedConverter.Start(ConversionType.HTML, tempFile.FullName, null, { isCancellationRequested: true, onCancellationRequested: null }));
                        });
                });
        });
}
