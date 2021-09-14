import { ok, strictEqual } from "assert";
import { EOL } from "os";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { Cheerio, CheerioAPI, load, Node } from "cheerio";
import dedent = require("dedent");
import { readFile, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import MultiRange from "multi-integer-range";
import { Random } from "random-js";
import { dirname, join, resolve } from "upath";
import { commands, ConfigurationTarget, TextDocument, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { Converter } from "../../../../Conversion/Converter";
import { MarkdownConverterExtension } from "../../../../MarkdownConverterExtension";
import { ISettings } from "../../../../Properties/ISettings";
import { InsertionType } from "../../../../System/Documents/Assets/InsertionType";
import { Margin } from "../../../../System/Documents/Margin";
import { PageOrientation } from "../../../../System/Documents/PageOrientation";
import { StandardizedFormatType } from "../../../../System/Documents/StandardizedFormatType";
import { StandardizedPageFormat } from "../../../../System/Documents/StandardizedPageFormat";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the `ConversionRunner` class.
 *
 * @param context
 * The test-context.
 */
export function ConversionRunnerTests(context: ITestContext<ISettings>): void
{
    suite(
        "ConversionRunner",
        () =>
        {
            let random: Random;
            let extension: MarkdownConverterExtension;
            let mdFile: TempFile;
            let conversionRunner: TestConversionRunner;
            let config: WorkspaceConfiguration;
            let lineBreakOption = "markdown.preview.breaks";
            let systemParserOption = "Parser.SystemParserEnabled" as const;
            const line1Text = "Hello";
            const line2Text = "World";
            const text = `${line1Text}${EOL}${line2Text}`;
            const newLineSelector = "br";

            /**
             * Provides an implementation of the `ConversionRunner` class for testing.
             */
            class TestConversionRunner extends ConversionRunner
            {
                /**
                 * @inheritdoc
                 *
                 * @param workspaceRoot
                 * The path to the root of the workspace of the document.
                 *
                 * @param document
                 * The document to convert.
                 *
                 * @returns
                 * A converter generated according to the settings.
                 */
                public override LoadConverter(workspaceRoot: string, document: TextDocument): Promise<Converter>
                {
                    return super.LoadConverter(workspaceRoot, document);
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The parser.
                 */
                public override LoadParser(): Promise<MarkdownIt>
                {
                    return super.LoadParser();
                }
            }

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
                let markdownUri = Uri.parse("untitled:.md");
                await commands.executeCommand("workbench.action.closeAllGroups");
                await window.showTextDocument(markdownUri);
                await commands.executeCommand("markdown.showPreview");
                await commands.executeCommand("workbench.action.closeAllGroups");
                await window.showTextDocument(markdownUri);
                await commands.executeCommand("workbench.action.files.revert");
                await commands.executeCommand("workbench.action.focusFirstEditorGroup");
                await new Promise((resolve) => setTimeout(resolve, 100));
                await commands.executeCommand("markdown.showPreview");
            }

            suiteSetup(
                () =>
                {
                    random = new Random();
                    extension = TestConstants.Extension;

                    mdFile = new TempFile(
                        {
                            Suffix: ".md"
                        });

                    config = workspace.getConfiguration(undefined, workspace.workspaceFolders[0]);
                });

            suiteTeardown(
                () =>
                {
                    mdFile.Dispose();
                });

            setup(
                () =>
                {
                    context.Settings[systemParserOption] = true;
                    conversionRunner = new TestConversionRunner(extension);
                });

            suite(
                "LoadParser",
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
                        "Checking whether the system-parser is used if `markdownConverter.Parser.SystemParserEnabled` is set to true…",
                        async function()
                        {
                            this.slow(6.5 * 1000);
                            this.timeout(26 * 1000);
                            context.Settings[systemParserOption] = true;
                            await config.update(lineBreakOption, true, ConfigurationTarget.Workspace);
                            await ReloadSystemParser();
                            strictEqual((await Select((await conversionRunner.LoadParser()).render(text), newLineSelector)).length, 1);
                            await config.update(lineBreakOption, false, ConfigurationTarget.Workspace);
                            await ReloadSystemParser();
                            strictEqual((await Select((await conversionRunner.LoadParser()).render(text), newLineSelector)).length, 0);
                        });

                    test(
                        "Checking whether the system-parser is disabled if `markdownConverter.Parser.SystemParserEnabled` is set to false…",
                        async function()
                        {
                            this.slow(2.5 * 1000);
                            this.timeout(10 * 1000);
                            let firstResult: Cheerio<Node>;
                            let secondResult: Cheerio<Node>;
                            await commands.executeCommand("workbench.action.files.revert");
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
                            this.slow(3 * 1000);
                            this.timeout(12 * 1000);
                            let headerText = "Test";

                            let content = dedent(
                                `
                                    # ${headerText}
                                    # ${headerText}`);

                            let result = load(parser.render(content));
                            strictEqual(result("#test").length, 1);
                            strictEqual(result("#test-2").length, 1);
                        });

                    test(
                        "Checking whether the toc is applied according to the settings…",
                        async function()
                        {
                            this.slow(3.5 * 1000);
                            this.timeout(14 * 1000);
                            let tocClass = "markdown-converter-toc-test";
                            let levels = new MultiRange([2]).toString();
                            let indicator = "\\[\\[\\s*toc-test\\s*\\]\\]";
                            let listType = "ol";
                            let excludedHeading = "Not Included";
                            let includedHeading = "Included";

                            let content = dedent(
                                `
                                    # Table of Contents
                                    [[toc-test]]
    
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
                            this.timeout(10 * 1000);

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
                        "Checking whether emojis are rendered according to the `Parser.EmojiType`-setting…",
                        async function()
                        {
                            this.slow(5.5 * 1000);
                            this.timeout(22 * 1000);
                            let result: CheerioAPI;
                            let content = "**:sparkles:**";
                            context.Settings["Parser.EmojiType"] = "None";
                            result = load((await conversionRunner.LoadParser()).render(content));

                            strictEqual(
                                result("b:contains(':sparkles:')").length +
                                result("strong:contains(':sparkles:')").length,
                                1);

                            context.Settings["Parser.EmojiType"] = "GitHub";
                            result = load((await conversionRunner.LoadParser()).render(content));
                            strictEqual(result("b img").length + result("strong img").length, 1);
                        });
                });

            suite(
                "LoadConverter",
                () =>
                {
                    test(
                        "Checking whether the settings are applied correctly…",
                        async function()
                        {
                            this.slow(4.25 * 1000);
                            this.timeout(17 * 1000);
                            let workspaceRoot = new TempDirectory();
                            let textDocument = await workspace.openTextDocument({ language: "markdown" });
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
                            context.Settings["Document.HeaderTemplate"] = headerTemplate;
                            context.Settings["Document.FooterTemplate"] = footerTemplate;

                            let converter = await new TestConversionRunner(extension).LoadConverter(workspaceRoot.FullName, textDocument);
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
                            strictEqual(converter.Document.Footer.Content, footerTemplate);

                            styleSheet[0].Dispose();
                            script[0].Dispose();
                            templateFile.Dispose();
                            workspaceRoot.Dispose();
                        });

                    test(
                        "Checking whether the header- and footer-template are loaded from a file according to the attributes…",
                        async function()
                        {
                            this.slow(3 * 1000);
                            this.timeout(12 * 1000);
                            let header = "This is a header";
                            let footer = "This is a footer";
                            let headerTemplate = new TempFile();
                            let footerTemplate = new TempFile();
                            await writeFile(headerTemplate.FullName, header);
                            await writeFile(footerTemplate.FullName, footer);

                            await writeFile(
                                mdFile.FullName,
                                dedent(
                                    `
                                    ---
                                    HeaderTemplate: ${headerTemplate.FullName}
                                    FooterTemplate: ${footerTemplate.FullName}
                                    ---`));

                            let converter = await new TestConversionRunner(extension).LoadConverter(
                                dirname(mdFile.FullName),
                                await workspace.openTextDocument(mdFile.FullName));

                            strictEqual(converter.Document.Header.Content, header);
                            strictEqual(converter.Document.Footer.Content, footer);
                            headerTemplate.Dispose();
                            footerTemplate.Dispose();
                        });
                });

            suite(
                "Execute",
                () =>
                {
                    let testFile: TempFile;
                    let tempDir: TempDirectory;
                    let substitutionTester: SubstitutionTester;

                    suiteSetup(
                        async () =>
                        {
                            testFile = new TempFile(
                                {
                                    Suffix: ".mkdwn"
                                });

                            tempDir = new TempDirectory();
                            substitutionTester = new SubstitutionTester(await workspace.openTextDocument(Uri.file(testFile.FullName)));
                        });

                    suiteTeardown(
                        () =>
                        {
                            testFile.Dispose();
                            tempDir.Dispose();
                        });

                    test(
                        "Checking whether the `DestinationPattern` is normalized correctly…",
                        async function()
                        {
                            this.slow(4 * 1000);
                            this.timeout(8 * 1000);
                            context.Settings.DestinationPattern = join(tempDir.FullName, "/./test/.././///./.");
                            strictEqual(resolve(Uri.file(await substitutionTester.Test()).fsPath), resolve(Uri.file(tempDir.FullName).fsPath));
                        });
                });
        });
}
