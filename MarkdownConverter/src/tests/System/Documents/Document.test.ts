import Assert = require("assert");
import { CultureInfo } from "culture-info";
import FrontMatter = require("front-matter");
import FileSystem = require("fs-extra");
import MarkdownIt = require("markdown-it");
import { TempFile } from "temp-filesystem";
import { isNullOrUndefined } from "util";
import { TextDocument, workspace } from "vscode";
import YAML = require("yamljs");
import { Document } from "../../../System/Documents/Document";
import { DateTimeFormatter } from "../../../System/Globalization/DateTimeFormatter";

suite(
    "Document",
    () =>
    {
        let content: string;
        let attributes: { [key: string]: any };
        let rawContent: string;
        let untitledTextDocument: TextDocument;
        let tempFile: TempFile;
        let textDocument: TextDocument;
        let parser: MarkdownIt;
        let parserVerifier: MarkdownIt;
        let verifierText: string;
        let testDocument: Document;
        let untitledDocument: Document;
        let verifierDocument: Document;

        suiteSetup(
            async () =>
            {
                content = "This is a test.";
                attributes = {
                    hello: "world",
                    date: new Date("1291-08-01")
                };

                rawContent = `---\n${YAML.stringify(attributes).trim()}\n---\n${content}`;

                tempFile = new TempFile(
                    {
                        postfix: ".md"
                    });

                await FileSystem.writeFile(tempFile.FullName, rawContent);
                textDocument = await workspace.openTextDocument(tempFile.FullName);

                untitledTextDocument = await workspace.openTextDocument(
                    {
                        language: "markdown",
                        content: rawContent
                    });

                parser = new MarkdownIt();
                testDocument = new Document(textDocument, parser);
                untitledDocument = new Document(untitledTextDocument, parser);

                parserVerifier = {
                    ...new MarkdownIt(),
                    render()
                    {
                        return verifierText;
                    }
                };

                verifierText = "parsed by parser";
                verifierDocument = new Document(textDocument, parserVerifier);
            });

        suite(
            "constructor(TextDocument document, MarkdownIt parser)",
            () =>
            {
                test(
                    "Checking whether the properties are set correctly…",
                    async () =>
                    {
                        let document = new Document(textDocument, parser);

                        for (let key of Object.keys(attributes))
                        {
                            Assert.strictEqual(JSON.stringify(document.Attributes[key]), JSON.stringify(attributes[key]));
                        }

                        document.Content = content;
                        Assert.strictEqual(document.FileName, textDocument.fileName);
                        Assert.strictEqual(document.Attributes["CreationDate"].getTime(), (await FileSystem.stat(tempFile.FullName)).ctime.getTime());

                        document = new Document(untitledTextDocument, parser);
                        Assert.strictEqual(isNullOrUndefined(document.FileName), true);
                    });
            });

        suite(
            "RawContent",
            () =>
            {
                let originalContent: string;

                suiteSetup(
                    () =>
                    {
                        originalContent = testDocument.RawContent;
                    });

                suiteTeardown(
                    () =>
                    {
                        testDocument.RawContent = originalContent;
                    });

                suite(
                    "getter",
                    () =>
                    {
                        test(
                            "Checking whether the raw content is generated correctly…",
                            () =>
                            {
                                let frontMatter = FrontMatter<any>(testDocument.RawContent);
                                Assert.strictEqual(frontMatter.body, content);

                                for (let key of Object.keys(attributes))
                                {
                                    Assert.strictEqual(JSON.stringify(frontMatter.attributes[key]), JSON.stringify(attributes[key]));
                                }
                            });
                    });

                suite(
                    "setter",
                    () =>
                    {
                        test(
                            "Checking whether the raw content is processed correctly…",
                            () =>
                            {
                                testDocument.RawContent = `---\n${YAML.stringify(attributes)}---\n${content}`;
                                Assert.strictEqual(testDocument.Content, content);

                                for (let key of Object.keys(attributes))
                                {
                                    Assert.strictEqual(JSON.stringify(testDocument.Attributes[key]), JSON.stringify(attributes[key]));
                                }
                            });

                        test(
                            "Checking whether setting malformed YAML causes an error…",
                            () =>
                            {
                                Assert.throws(
                                    () =>
                                    {
                                        testDocument.RawContent = `---\nThis: is: incorrect: YAML\n---\n`;
                                    });
                            });
                    });
            });

        suite(
            "Render()",
            () =>
            {
                let styleSheet: string;
                let script: string;

                suiteSetup(
                    () =>
                    {
                        styleSheet = "https://this.is.a/test.css";
                        script = "https://this.is.an/other.test.js";
                    });

                teardown(
                    () =>
                    {
                        testDocument = new Document(textDocument, parser);
                    });

                test(
                    "Checking whether stylesheets are added to the rendered document…",
                    async () =>
                    {
                        testDocument.StyleSheets.push(styleSheet);
                        Assert.strictEqual(
                            new RegExp(
                                `<link.*?type="text/css".*?href="${styleSheet}".*?/>`,
                                "g").test(await testDocument.Render()),
                            true);
                    });

                test(
                    "Checking whether scripts are added to the rendered document…",
                    async () =>
                    {
                        testDocument.Scripts.push(script);
                        Assert.strictEqual(
                            new RegExp(
                                `<script.*?src="${script}".*?>.*?</script>`,
                                "g").test(await testDocument.Render()),
                            true);
                    });

                test(
                    "Checking whether Document.Template is applied using Mustache…",
                    async () =>
                    {
                        testDocument.Template = "hello{{content}}world";
                        Assert.strictEqual(
                            /^hello[\s\S]*world$/gm.test(await testDocument.Render()), true);
                    });
            });

        suite(
            "RenderText(string content)",
            () =>
            {

                teardown(
                    () =>
                    {
                        testDocument = new Document(textDocument, parser);
                    });

                suite(
                    "Checking whether attributes are substituted using Mustache…",
                    () =>
                    {
                        let content: string;

                        suiteSetup(
                            () =>
                            {
                                content = "";

                                for (let key of Object.keys(attributes))
                                {
                                    content += `{{${key}}}\n\n`;
                                }
                            });

                        test(
                            "Checking whether non-date attributes are substituted correctly…",
                            async () =>
                            {
                                testDocument.Content = content;

                                for (let key of Object.keys(attributes))
                                {
                                    if (!(attributes[key] instanceof Date))
                                    {
                                        (await testDocument.Render()).includes(attributes[key]);
                                    }
                                }
                            });

                        test(
                            "Checking whether date-attributes are formatted using the DateTimeFormatter…",
                            async () =>
                            {
                                testDocument.Content = content;

                                for (let key of Object.keys(attributes))
                                {
                                    if (attributes[key] instanceof Date)
                                    {
                                        (await testDocument.Render()).includes(
                                            new DateTimeFormatter(testDocument.Locale).Format(testDocument.DateFormat, attributes[key]));
                                    }
                                }
                            });

                        test(
                            "Checking whether the locale of the document affects the date-format…",
                            async () =>
                            {
                                testDocument.Content = content;
                                testDocument.DateFormat = "dddd";

                                let englishContent: string;
                                let germanContent: string;

                                testDocument.Locale = new CultureInfo("en");
                                englishContent = await testDocument.Render();
                                testDocument.Locale = new CultureInfo("de");
                                germanContent = await testDocument.Render();
                                Assert.strictEqual(englishContent !== germanContent, true);
                            });

                        test(
                            "Checking whether markdown is parsed when rendering the document…",
                            async () =>
                            {
                                testDocument.Content = "**important**";
                                Assert.strictEqual((await testDocument.Render()).includes(parser.renderInline(testDocument.Content)), true);
                            });
                    });
            });
    });