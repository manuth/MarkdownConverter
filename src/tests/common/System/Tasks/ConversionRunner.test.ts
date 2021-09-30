import { notStrictEqual, ok, rejects, strictEqual } from "assert";
import { EOL } from "os";
import { isAbsolute, relative } from "path";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { Cheerio, CheerioAPI, load, Node } from "cheerio";
import dedent = require("dedent");
import { pathExists, readFile, remove, writeFile } from "fs-extra";
import kebabCase = require("lodash.kebabcase");
import MarkdownIt = require("markdown-it");
import MultiRange from "multi-integer-range";
import { randexp } from "randexp";
import { Random } from "random-js";
import { createSandbox, SinonSandbox, SinonSpiedMember } from "sinon";
import { dirname, normalize, resolve } from "upath";
import { ConfigurationTarget, TextDocument, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { Converter } from "../../../../Conversion/Converter";
import { IConvertedFile } from "../../../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../../../MarkdownConverterExtension";
import { IRunningBlockContent } from "../../../../Properties/IRunningBlockContent";
import { ISettings } from "../../../../Properties/ISettings";
import { Resources } from "../../../../Properties/Resources";
import { Settings } from "../../../../Properties/Settings";
import { Asset } from "../../../../System/Documents/Assets/Asset";
import { AssetURLType } from "../../../../System/Documents/Assets/AssetURLType";
import { InsertionType } from "../../../../System/Documents/Assets/InsertionType";
import { AttributeKey } from "../../../../System/Documents/AttributeKey";
import { Document } from "../../../../System/Documents/Document";
import { Margin } from "../../../../System/Documents/Margin";
import { PageOrientation } from "../../../../System/Documents/PageOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPageFormat } from "../../../../System/Documents/StandardizedPageFormat";
import { MarkdownContributions } from "../../../../System/Extensibility/MarkdownContributions";
import { OperationCancelledException } from "../../../../System/OperationCancelledException";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";
import { TestConstants } from "../../../TestConstants";
import { TestConversionRunner } from "../../../TestConversionRunner";

/**
 * Registers tests for the {@link ConversionRunner `ConversionRunner`} class.
 *
 * @param context
 * The test-context.
 */
export function ConversionRunnerTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ConversionRunner),
        () =>
        {
            let random: Random;
            let sandbox: SinonSandbox;
            let converterSandbox: SinonSandbox;
            let converterSpy: SinonSpiedMember<Converter["Start"]>;
            let extension: MarkdownConverterExtension;
            let conversionRunner: TestConversionRunner;
            let tempDir: TempDirectory;
            let tempFile: TempFile;
            let textDocument: TextDocument;
            let config: WorkspaceConfiguration;
            let lineBreakOption = "markdown.preview.breaks";
            let systemParserOption = "Parser.SystemParserEnabled" as const;
            let fullSystemParserOption = `markdownConverter.${systemParserOption}`;
            let emojiTypeOption = "Parser.EmojiType" as const;
            const line1Text = "Hello";
            const line2Text = "World";
            const text = `${line1Text}${EOL}${line2Text}`;
            const newLineSelector = "br";

            /**
             * Selects DOM-elements from the destination-file.
             *
             * @param body
             * The full html-body.
             *
             * @param selector
             * The selector to execute.
             *
             * @returns
             * The result of the selection.
             */
            async function Select(body: string, selector: string): Promise<Cheerio<Node>>
            {
                return load(body)(selector);
            }

            /**
             * Reloads the system-parser.
             */
            async function ReloadSystemParser(): Promise<void>
            {
                await context.CloseEditors();
                await context.OpenMarkdownDocument();
                await context.OpenPreview();
                await context.CloseEditors();
                await context.OpenMarkdownDocument();
                await context.ResetEditor();
                await context.FocusFirstEditor();
                await new Promise((resolve) => setTimeout(resolve, 100));
                await context.OpenPreview();
            }

            /**
             * Gets a random set of {@link ConversionType `ConversionType`}s.
             *
             * @returns
             * A random set of {@link ConversionType `ConversionType`}s.
             */
            function GetRandomConversionTypes(): ConversionType[]
            {
                return random.sample(
                    [
                        ConversionType.HTML,
                        ConversionType.JPEG,
                        ConversionType.PDF,
                        ConversionType.PNG
                    ],
                    random.integer(2, 4));
            }

            suiteSetup(
                () =>
                {
                    random = new Random();
                    extension = TestConstants.Extension;
                    config = workspace.getConfiguration(undefined, workspace.workspaceFolders[0]);
                });

            setup(
                async () =>
                {
                    sandbox = createSandbox();
                    converterSandbox = createSandbox();
                    context.Settings[systemParserOption] = true;
                    context.Settings.ConversionType = [ConversionType[ConversionType.HTML] as keyof typeof ConversionType];
                    conversionRunner = new TestConversionRunner(extension);
                    converterSandbox.replace(Converter.prototype, "Start", async () => { });
                    converterSpy = sandbox.mock(Converter.prototype).expects(nameof<Converter>((c) => c.Start)).atLeast(0) as any;
                    tempDir = new TempDirectory();

                    tempFile = new TempFile(
                        {
                            Directory: tempDir.FullName,
                            Suffix: ".md"
                        });

                    textDocument = await workspace.openTextDocument(Uri.file(tempFile.FullName));
                });

            teardown(
                () =>
                {
                    tempFile.Dispose();
                    tempDir.Dispose();
                    sandbox.restore();
                    converterSandbox.restore();
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.Execute),
                () =>
                {
                    let substitutionTester: SubstitutionTester;
                    let workspaceFolderPattern = "${workspaceFolder}";

                    setup(
                        () =>
                        {
                            substitutionTester = new SubstitutionTester(conversionRunner);
                        });

                    test(
                        `Checking whether the \`${nameof(ConversionRunner)}\` is not executed if a cancellation is requested…`,
                        async () =>
                        {
                            await rejects(
                                () => conversionRunner.Execute(textDocument, null, { isCancellationRequested: true, onCancellationRequested: null }),
                                OperationCancelledException);
                        });

                    test(
                        "Checking whether messages are reported during the conversion…",
                        async function()
                        {
                            this.slow(5 * 1000);
                            this.timeout(10 * 1000);
                            let reportCount = 0;

                            await conversionRunner.Execute(
                                textDocument,
                                {
                                    report: () => reportCount++
                                });

                            ok(reportCount > 0);
                        });

                    test(
                        `Checking whether the \`${nameof<Settings>((s) => s.DestinationPattern)}\` is normalized correctly…`,
                        async function()
                        {
                            this.slow(4 * 1000);
                            this.timeout(8 * 1000);

                            strictEqual(
                                resolve(Uri.file(await substitutionTester.Test(textDocument, `${tempDir.FullName}/./test/.././///./.`)).fsPath),
                                resolve(Uri.file(tempDir.FullName).fsPath));
                        });

                    test(
                        `Checking whether the user is prompted to input a workspace-path if no proper workspace-folder is found and the destination-pattern contains \`${workspaceFolderPattern}\`…`,
                        async function()
                        {
                            this.slow(2.5 * 1000);
                            this.timeout(5 * 1000);
                            sandbox.replace(conversionRunner, "GetWorkspacePath", () => null);
                            sandbox.replace(window, "showInputBox", async () => "example");
                            let spy = sandbox.spy(window);
                            await substitutionTester.Test(textDocument, workspaceFolderPattern);
                            ok(spy.showInputBox.calledOnce);
                        });

                    test(
                        `Checking whether the user is prompted to input a workspace-path if no proper workspace-folder is found and the path specified in the \`${nameof<Settings>((s) => s.DestinationPattern)}\`-setting is relative…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            sandbox.replace(conversionRunner, "GetWorkspacePath", () => null);
                            sandbox.replace(window, "showInputBox", async () => "example");
                            let spy = sandbox.spy(window);
                            await substitutionTester.Test(textDocument, "this/is/a/relative/path");
                            ok(spy.showInputBox.calledOnce);
                        });

                    test(
                        "Checking whether the destination-path is resolved…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            ok(isAbsolute(await substitutionTester.Test(textDocument, "this/is/a/test")));
                        });

                    test(
                        `Checking whether the destination-path is resolved to the workspace-folder if the destination-pattern is relative and doesn't contain \`${workspaceFolderPattern}\`…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let path = "this/is/a/test";
                            sandbox.replace(conversionRunner, "GetWorkspacePath", () => tempDir.FullName);

                            strictEqual(
                                normalize(await substitutionTester.Test(textDocument, path)),
                                normalize(tempDir.MakePath(path)));
                        });

                    test(
                        "Checking whether the converter is executed for each selected file-type…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let types = GetRandomConversionTypes();
                            context.Settings.ConversionType = types.map((type) => ConversionType[type] as keyof typeof ConversionType);
                            await conversionRunner.Execute(textDocument);
                            strictEqual(converterSpy.callCount, types.length);

                            ok(
                                types.every(
                                    (type) =>
                                    {
                                        return converterSpy.args.some(
                                            (args) =>
                                            {
                                                return args[0] === type;
                                            });
                                    }));
                        });

                    test(
                        "Checking whether all converted files are created once the method is resolved…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            let types = GetRandomConversionTypes();
                            let files: IConvertedFile[] = [];
                            converterSandbox.restore();
                            context.Settings.ConversionType = types.map((type) => ConversionType[type] as keyof typeof ConversionType);

                            try
                            {
                                await conversionRunner.Execute(
                                    textDocument,
                                    null,
                                    null,
                                    {
                                        report: (file) =>
                                        {
                                            files.push(file);
                                        }
                                    });

                                strictEqual(files.length, types.length);

                                for (let file of files)
                                {
                                    ok(await pathExists(file.FileName));
                                }
                            }
                            catch (exception)
                            {
                                throw exception;
                            }
                            finally
                            {
                                for (let file of files)
                                {
                                    if (await pathExists(file.FileName))
                                    {
                                        await remove(file.FileName);
                                    }
                                }
                            }
                        });
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.LoadConverter),
                () =>
                {
                    test(
                        "Checking whether the settings are applied correctly…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            let chromiumPath = random.string(50);
                            let conversionQuality = 78;

                            let attributes = {
                                hello: "world",
                                this: "is a test"
                            };

                            let locale = "en";
                            let dateFormat = "yyyy/MM/dd";
                            let testFormatName = "year";
                            let testFormat = "yyyy";
                            let format = nameof(StandardizedFormatType.Tabloid);
                            let orientation = nameof(PageOrientation.Landscape);

                            let margin: Partial<Margin> = {
                                Top: "29cm",
                                Left: "9mm",
                                Bottom: "18cm",
                                Right: "1m"
                            };

                            let insertionTypes = [
                                nameof(InsertionType.Default),
                                nameof(InsertionType.Include),
                                nameof(InsertionType.Link)
                            ] as Array<keyof typeof InsertionType>;

                            let templateFile = new TempFile();
                            let highlightStyle = "agate";
                            let styleSheet: [TempFile, keyof typeof InsertionType] = [new TempFile(), random.pick(insertionTypes)];
                            let script: [TempFile, keyof typeof InsertionType] = [new TempFile(), random.pick(insertionTypes)];
                            let headerFooterEnabled = false;
                            let headerTemplate = "Hello";
                            let footerTemplate = "World";

                            let headerContent: IRunningBlockContent = {
                                Left: random.string(10),
                                Right: random.string(15),
                                Center: random.string(20)
                            };

                            let footerContent: IRunningBlockContent = {
                                Left: random.string(9),
                                Right: random.string(14),
                                Center: random.string(19)
                            };

                            try
                            {
                                context.Settings.ChromiumExecutablePath = chromiumPath;
                                context.Settings.ConversionQuality = conversionQuality;
                                context.Settings["Document.Attributes"] = attributes;
                                context.Settings.Locale = locale;
                                context.Settings.DefaultDateFormat = dateFormat;

                                context.Settings.DateFormats = {
                                    [testFormatName]: testFormat
                                };

                                context.Settings["Document.Paper.PaperFormat"] = {
                                    Format: format,
                                    Orientation: orientation
                                };

                                context.Settings["Document.Paper.Margin"] = margin;
                                context.Settings["Document.Design.Template"] = templateFile.FullName;
                                context.Settings["Document.Design.HighlightStyle"] = highlightStyle;
                                context.Settings["Document.Design.StyleSheets"] = { [styleSheet[0].FullName]: styleSheet[1] };
                                context.Settings["Document.Design.Scripts"] = { [script[0].FullName]: script[1] };
                                context.Settings["Document.HeaderFooterEnabled"] = headerFooterEnabled;
                                context.Settings["Document.HeaderContent"] = headerContent;
                                context.Settings["Document.FooterContent"] = footerContent;
                                context.Settings["Document.HeaderTemplate"] = headerTemplate;
                                context.Settings["Document.FooterTemplate"] = footerTemplate;

                                let converter = await new TestConversionRunner(extension).LoadConverter(tempDir.FullName, textDocument);
                                strictEqual(converter.ChromiumExecutablePath, chromiumPath);
                                strictEqual(converter.Document.Quality, conversionQuality);

                                for (let key of Object.keys(attributes) as Array<keyof typeof attributes>)
                                {
                                    strictEqual(attributes[key], converter.Document.Attributes[key]);
                                }

                                strictEqual(converter.Document.Locale.Name, locale);
                                strictEqual(converter.Document.DefaultDateFormat, dateFormat);
                                strictEqual(converter.Document.DateFormats[testFormatName], testFormat);
                                strictEqual((converter.Document.Paper.Format as StandardizedPageFormat).Format, StandardizedFormatType[format as keyof typeof StandardizedFormatType]);
                                strictEqual((converter.Document.Paper.Format as StandardizedPageFormat).Orientation, PageOrientation[orientation as keyof typeof PageOrientation]);

                                for (let key of Object.keys(margin) as Array<keyof typeof margin>)
                                {
                                    strictEqual(converter.Document.Paper.Margin[key], margin[key]);
                                }

                                strictEqual(converter.Document.Template, (await readFile(templateFile.FullName)).toString());
                                ok(converter.Document.StyleSheets.some((stylesheet) => stylesheet.URL.includes(highlightStyle)));
                                ok(converter.Document.StyleSheets.some((entry) => entry.URL === styleSheet[0].FullName && entry.InsertionType === InsertionType[styleSheet[1]]));
                                ok(converter.Document.Scripts.some((entry) => entry.URL === script[0].FullName && entry.InsertionType === InsertionType[script[1]]));
                                strictEqual(converter.Document.HeaderFooterEnabled, headerFooterEnabled);
                                strictEqual(converter.Document.Header.Content, headerTemplate);
                                strictEqual(converter.Document.Header.Left, headerContent.Left);
                                strictEqual(converter.Document.Header.Right, headerContent.Right);
                                strictEqual(converter.Document.Header.Center, headerContent.Center);
                                strictEqual(converter.Document.Footer.Content, footerTemplate);
                                strictEqual(converter.Document.Footer.Left, footerContent.Left);
                                strictEqual(converter.Document.Footer.Right, footerContent.Right);
                                strictEqual(converter.Document.Footer.Center, footerContent.Center);

                                for (let defaultStylesEnabled of [true, false])
                                {
                                    context.Settings["Document.Design.DefaultStyles"] = defaultStylesEnabled;
                                    converter = await conversionRunner.LoadConverter(tempDir.FullName, textDocument);

                                    strictEqual(
                                        converter.Document.StyleSheets.some(
                                            (asset) =>
                                            {
                                                return asset.URL === Resources.Files.Get("SystemStyle");
                                            }),
                                        defaultStylesEnabled);
                                }
                            }
                            catch (exception)
                            {
                                throw exception;
                            }
                            finally
                            {
                                styleSheet[0].Dispose();
                                script[0].Dispose();
                                templateFile.Dispose();
                            }
                        });

                    test(
                        "Checking whether the metadata-, the header- and the footer-template are loaded from a file according to the attributes or the settings…",
                        async function()
                        {
                            this.slow(6 * 1000);
                            this.timeout(12 * 1000);
                            let document: TextDocument;
                            let metaData = random.string(30);
                            let header = "This is a header";
                            let footer = "This is a footer";
                            let metaTemplate = new TempFile();
                            let headerTemplate = new TempFile();
                            let footerTemplate = new TempFile();

                            try
                            {
                                await writeFile(metaTemplate.FullName, metaData);
                                await writeFile(headerTemplate.FullName, header);
                                await writeFile(footerTemplate.FullName, footer);

                                let templateSettings: Array<[string, string, string]> = [
                                    [
                                        metaTemplate.FullName,
                                        headerTemplate.FullName,
                                        footerTemplate.FullName
                                    ],
                                    [
                                        metaData,
                                        header,
                                        footer
                                    ]
                                ];

                                for (let settings of templateSettings)
                                {
                                    let templateInjectors: Array<() => Promise<void>> = [
                                        async () =>
                                        {
                                            document = await workspace.openTextDocument(
                                                {
                                                    content: dedent(
                                                        `
                                                            ---
                                                            ${AttributeKey.MetaTemplate}: ${settings[0]}
                                                            ${AttributeKey.HeaderTemplate}: ${settings[1]}
                                                            ${AttributeKey.FooterTemplate}: ${settings[2]}
                                                            ---`)
                                                });
                                        },
                                        async () =>
                                        {
                                            context.Settings["Document.MetaTemplate"] = settings[0];
                                            context.Settings["Document.HeaderTemplate"] = settings[1];
                                            context.Settings["Document.FooterTemplate"] = settings[2];
                                        }
                                    ];

                                    for (let injector of templateInjectors)
                                    {
                                        await injector();
                                        let converter = await new TestConversionRunner(extension).LoadConverter(dirname(tempFile.FullName), document);
                                        strictEqual(converter.Document.Meta.Content, metaData);
                                        strictEqual(converter.Document.Header.Content, header);
                                        strictEqual(converter.Document.Footer.Content, footer);
                                    }
                                }
                            }
                            catch (exception)
                            {
                                throw exception;
                            }
                            finally
                            {
                                metaTemplate.Dispose();
                                headerTemplate.Dispose();
                                footerTemplate.Dispose();
                            }
                        });

                    test(
                        `Checking whether assets from markdown-extensions are loaded if \`${systemParserOption}\` is enabled…`,
                        async () =>
                        {
                            let contributions = new MarkdownContributions();

                            for (let systemParserEnabled of [true, false])
                            {
                                context.Settings[systemParserOption] = systemParserEnabled;
                                let converter = await conversionRunner.LoadConverter(tempDir.FullName, textDocument);

                                for (let assetEntry of [
                                    [contributions.PreviewStyles, converter.Document.StyleSheets],
                                    [contributions.PreviewScripts, converter.Document.Scripts]
                                ] as Array<[Uri[], Asset[]]>)
                                {
                                    for (let assetUri of assetEntry[0])
                                    {
                                        strictEqual(
                                            assetEntry[1].some(
                                                (asset) =>
                                                {
                                                    return asset.URL === assetUri.fsPath &&
                                                        asset.InsertionType === (
                                                            (asset.URLType === AssetURLType.Link) ?
                                                                InsertionType.Link :
                                                                InsertionType.Include);
                                                }),
                                            systemParserEnabled);
                                    }
                                }
                            }
                        });

                    test(
                        "Checking whether attributes override setting-values…",
                        async () =>
                        {
                            let attributeValue = random.string(10);
                            let settingValue = random.string(20);

                            context.Settings["Document.MetaTemplate"] = settingValue;
                            context.Settings["Document.HeaderTemplate"] = settingValue;
                            context.Settings["Document.FooterTemplate"] = settingValue;
                            context.Settings.DefaultDateFormat = settingValue;

                            let document = await workspace.openTextDocument(
                                {
                                    content: dedent(
                                        `
                                            ---
                                            ${AttributeKey.MetaTemplate}: ${attributeValue}
                                            ${AttributeKey.HeaderTemplate}: ${attributeValue}
                                            ${AttributeKey.FooterTemplate}: ${attributeValue}
                                            ${AttributeKey.DateFormat}: ${attributeValue}
                                            ${AttributeKey.Header}:
                                              ${nameof<IRunningBlockContent>((content) => content.Left)}: ${attributeValue}
                                              ${nameof<IRunningBlockContent>((content) => content.Right)}: ${attributeValue}
                                              ${nameof<IRunningBlockContent>((content) => content.Center)}: ${attributeValue}
                                            ${AttributeKey.Footer}:
                                              ${nameof<IRunningBlockContent>((content) => content.Left)}: ${attributeValue}
                                              ${nameof<IRunningBlockContent>((content) => content.Right)}: ${attributeValue}
                                              ${nameof<IRunningBlockContent>((content) => content.Center)}: ${attributeValue}
                                            ---`)
                                });

                            let converter = await conversionRunner.LoadConverter(tempDir.FullName, document);

                            for (let content of [
                                converter.Document.Meta.Content,
                                converter.Document.Header.Content,
                                converter.Document.Footer.Content
                            ])
                            {
                                notStrictEqual(content, settingValue);
                                strictEqual(content, attributeValue);
                            }

                            for (
                                let content of [
                                    converter.Document.Header,
                                    converter.Document.Footer
                                ])
                            {
                                for (let section of [
                                    content.Right,
                                    content.Left,
                                    content.Center
                                ])
                                {
                                    notStrictEqual(section, settingValue);
                                    strictEqual(section, attributeValue);
                                }
                            }
                        });

                    test(
                        "Checking whether individual sections of the running-blocks can be overridden…",
                        async () =>
                        {
                            let rightContent = random.string(10);
                            let centerContent = random.string(15);
                            context.Settings["Document.HeaderContent"] = { Right: rightContent };

                            let document = await workspace.openTextDocument(
                                {
                                    content: dedent(
                                        `
                                            ---
                                            ${AttributeKey.Header}:
                                              ${nameof<IRunningBlockContent>((content) => content.Center)}: ${centerContent}
                                            ---`)
                                });

                            let converter = await conversionRunner.LoadConverter(tempDir.FullName, document);
                            strictEqual(converter.Document.Header.Right, rightContent);
                            strictEqual(converter.Document.Header.Center, centerContent);
                        });

                    test(
                        "Checking whether assets are loaded correctly…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let tempFiles: TempFile[] = [];

                            let urlTypes = [
                                AssetURLType.Link,
                                AssetURLType.RelativePath,
                                AssetURLType.AbsolutePath
                            ];

                            let insertionTypes = [
                                InsertionType.Default,
                                InsertionType.Include,
                                InsertionType.Link
                            ];

                            try
                            {
                                let checkers: Array<() => Promise<void>> = [];
                                let document: Document;

                                for (let entry of [
                                    [
                                        nameof<ISettings>((s) => s["Document.Design.StyleSheets"]),
                                        nameof<ISettings>((s) => s["Document.Design.StyleSheetInsertion"]),
                                        (document) => document.StyleSheets
                                    ],
                                    [
                                        nameof<ISettings>((s) => s["Document.Design.Scripts"]),
                                        nameof<ISettings>((s) => s["Document.Design.ScriptInsertion"]),
                                        (document) => document.Scripts
                                    ]
                                ] as Array<[keyof ISettings, keyof ISettings, (document: Document) => Asset[]]>)
                                {
                                    (context.Settings as any)[entry[0]] = {};
                                    (context.Settings as any)[entry[1]] = {};

                                    for (let urlType of urlTypes)
                                    {
                                        (context.Settings as any)[entry[1]][urlType] = InsertionType[random.pick(insertionTypes)];
                                    }

                                    for (let i = random.integer(2, 10); i > 0; i--)
                                    {
                                        let file = new TempFile();
                                        let insertionType = random.pick(insertionTypes);
                                        (context.Settings as any)[entry[0]][file.FullName] = InsertionType[insertionType];
                                        tempFiles.push(file);

                                        checkers.push(
                                            async () =>
                                            {
                                                ok(
                                                    entry[2](document).some(
                                                        (asset) =>
                                                        {
                                                            return asset.URL === file.FullName &&
                                                                asset.InsertionType === insertionType;
                                                        }));
                                            });
                                    }
                                }

                                document = (await conversionRunner.LoadConverter(tempDir.FullName, textDocument)).Document;

                                for (let checker of checkers)
                                {
                                    await checker();
                                }
                            }
                            catch (exception)
                            {
                                throw exception;
                            }
                            finally
                            {
                                for (let tempFile of tempFiles)
                                {
                                    tempFile.Dispose();
                                }
                            }
                        });
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.LoadParser),
                () =>
                {
                    let parser: MarkdownIt;

                    setup(
                        async function()
                        {
                            this.timeout(10 * 1000);
                            parser = await conversionRunner.LoadParser();
                        });

                    test(
                        `Checking whether the system-parser is used if \`${fullSystemParserOption}\` is set to \`${true}\`…`,
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            context.Settings[systemParserOption] = true;
                            await config.update(lineBreakOption, true, ConfigurationTarget.Workspace);
                            await ReloadSystemParser();
                            strictEqual((await Select((await conversionRunner.LoadParser()).render(text), newLineSelector)).length, 1);
                            await config.update(lineBreakOption, false, ConfigurationTarget.Workspace);
                            await ReloadSystemParser();
                            strictEqual((await Select((await conversionRunner.LoadParser()).render(text), newLineSelector)).length, 0);
                        });

                    test(
                        "Checking whether highlighting can be disabled if the system-parser is disabled…",
                        async () =>
                        {
                            context.Settings[systemParserOption] = false;
                            context.Settings["Document.Design.HighlightStyle"] = "None";
                            let converter = await conversionRunner.LoadConverter(tempDir.FullName, textDocument);

                            ok(
                                load(
                                    converter.Document.Parser.render(
                                        dedent(
                                            `
                                                ~~~js
                                                ${JSON.stringify("use strict")};
                                                ~~~`)))("pre.hljs code div").toArray().every(
                                                (element) =>
                                                {
                                                    if (element.childNodes.length === 1)
                                                    {
                                                        let text = load(element.childNodes[0]);
                                                        return text.html() === text.text();
                                                    }
                                                    else
                                                    {
                                                        return false;
                                                    }
                                                }));
                        });

                    test(
                        `Checking whether the system-parser is disabled if \`${fullSystemParserOption}\` is set to \`${false}\`…`,
                        async function()
                        {
                            this.slow(2.5 * 1000);
                            this.timeout(5 * 1000);
                            let firstResult: Cheerio<Node>;
                            let secondResult: Cheerio<Node>;
                            await context.ResetEditor();
                            context.Settings[systemParserOption] = false;
                            await config.update(lineBreakOption, true, ConfigurationTarget.Workspace);
                            firstResult = await Select((await conversionRunner.LoadParser()).render(text), newLineSelector);
                            await config.update(lineBreakOption, false, ConfigurationTarget.Workspace);
                            secondResult = await Select((await conversionRunner.LoadParser()).render(text), newLineSelector);
                            strictEqual(firstResult.length, secondResult.length);
                            ok([0, 1].includes(firstResult.length));
                        });

                    test(
                        "Checking whether anchors are created correctly…",
                        async function()
                        {
                            this.slow(5 * 1000);
                            this.timeout(10 * 1000);
                            let headerText = "Test";

                            let content = dedent(
                                `
                                    # ${headerText}
                                    # ${headerText}`);

                            for (let i = 0; i < 2; i++)
                            {
                                let result = load(parser.render(content));
                                strictEqual(result(`#${kebabCase(headerText)}`).length, 1);
                                strictEqual(result(`#${kebabCase(`${headerText}2`)}`).length, 1);
                            }
                        });

                    test(
                        "Checking whether the toc is applied according to the settings…",
                        async function()
                        {
                            this.slow(5 * 1000);
                            this.timeout(10 * 1000);
                            let tocClass = "markdown-converter-toc-test";
                            let levels = new MultiRange([2]).toString();
                            let indicator = "\\[\\[\\s*toc-test\\s*\\]\\]";
                            let listType = "ol";
                            let excludedHeading = "Not Included";
                            let includedHeading = "Included";

                            let content = dedent(
                                `
                                    # Table of Contents
                                    ${randexp(indicator)}
    
                                    # ${excludedHeading}
                                    ## ${includedHeading}`);

                            context.Settings["Parser.Toc.Enabled"] = true;
                            context.Settings["Parser.Toc.Class"] = tocClass;
                            context.Settings["Parser.Toc.Levels"] = levels;
                            context.Settings["Parser.Toc.Indicator"] = indicator;
                            context.Settings["Parser.Toc.ListType"] = listType;
                            let result = load((await conversionRunner.LoadParser()).render(content));
                            strictEqual(result(`.${tocClass}`).length, 1);
                            strictEqual(result('ol li a[href="#included"]').length, 1);
                            strictEqual(result('ol li a[href="#not-included"]').length, 0);
                        });

                    test(
                        "Checking whether checkboxes are rendered…",
                        async function()
                        {
                            this.slow(2.5 * 1000);
                            this.timeout(5 * 1000);

                            let content = dedent(
                                `
                                    # ToDo's
                                    - [ ] Rob a bank
                                    - [ ] Get rich
                                    - [ ] Buy a new monitor`);

                            let result = load((await conversionRunner.LoadParser()).render(content));
                            strictEqual(result('li input[type="checkbox"]').length, 3);
                        });

                    test(
                        `Checking whether emojis are rendered according to the \`${emojiTypeOption}\`-setting…`,
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            let result: CheerioAPI;
                            let content = "**:sparkles:**";
                            context.Settings[emojiTypeOption] = "None";
                            result = load((await conversionRunner.LoadParser()).render(content));

                            strictEqual(
                                result("b:contains(':sparkles:')").length +
                                result("strong:contains(':sparkles:')").length,
                                1);

                            context.Settings[emojiTypeOption] = "GitHub";
                            result = load((await conversionRunner.LoadParser()).render(content));

                            strictEqual(
                                result("b img").length +
                                result("strong img").length,
                                1);
                        });
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.LoadFragment),
                () =>
                {
                    let converter: Converter;
                    let tempFile: TempFile;
                    let content: string;

                    setup(
                        async () =>
                        {
                            converter = await conversionRunner.LoadConverter(tempDir.FullName, textDocument);

                            tempFile = new TempFile(
                                {
                                    Directory: tempDir.MakePath("Test")
                                });

                            content = random.string(50);
                            await writeFile(tempFile.FullName, content);
                        });

                    teardown(
                        () =>
                        {
                            tempFile.Dispose();
                        });

                    test(
                        "Checking whether the source is loaded plainly by default…",
                        async () =>
                        {
                            strictEqual(await conversionRunner.LoadFragment(converter, content), content);
                        });

                    test(
                        "Checking whether the source is loaded from a file if the specified content is a path that exists…",
                        async () =>
                        {
                            strictEqual(await conversionRunner.LoadFragment(converter, tempFile.FullName), content);
                        });

                    test(
                        "Checking whether the paths indicated by the source can be relative to the document-root…",
                        async () =>
                        {
                            strictEqual(await conversionRunner.LoadFragment(
                                converter,
                                relative(tempDir.FullName, tempFile.FullName)),
                                content);
                        });
                });
        });
}
