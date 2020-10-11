import { ok, strictEqual, throws } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import fm = require("front-matter");
import { stat, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { TextDocument, workspace } from "vscode";
import { stringify } from "yamljs";
import { Document } from "../../../../System/Documents/Document";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter";

/**
 * Registers tests for the `Document` class.
 */
export function DocumentTests(): void
{
    suite(
        "Document",
        () =>
        {
            let content: string;
            let attributes: Record<string, any>;
            let rawContent: string;
            let tempFile: TempFile;
            let parser: MarkdownIt;
            let textDocument: TextDocument;
            let untitledTextDocument: TextDocument;
            let document: Document;
            let untitledDocument: Document;

            suiteSetup(
                async () =>
                {
                    content = "This is a test.";

                    attributes = {
                        hello: "world",
                        date: new Date("1291-08-01")
                    };

                    rawContent = `---\n${stringify(attributes).trim()}\n---\n${content}`;

                    tempFile = new TempFile(
                        {
                            Suffix: ".md"
                        });

                    await writeFile(tempFile.FullName, rawContent);
                    textDocument = await workspace.openTextDocument(tempFile.FullName);

                    untitledTextDocument = await workspace.openTextDocument(
                        {
                            language: "markdown",
                            content: rawContent
                        });

                    parser = new MarkdownIt();
                });

            suiteTeardown(
                () =>
                {
                    tempFile.Dispose();
                });

            setup(
                () =>
                {
                    document = new Document(textDocument, parser);
                    untitledDocument = new Document(untitledTextDocument, parser);
                });

            suite(
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the properties are set correctly…",
                        async () =>
                        {
                            for (let key of Object.keys(attributes))
                            {
                                strictEqual(JSON.stringify(document.Attributes[key]), JSON.stringify(attributes[key]));
                            }

                            document.Content = content;
                            strictEqual(document.FileName, textDocument.fileName);
                            strictEqual(new Date(document.Attributes["CreationDate"] as any).getTime(), (await stat(tempFile.FullName)).ctime.getTime());
                            ok(!untitledDocument.FileName);
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
                            originalContent = document.RawContent;
                        });

                    suiteTeardown(
                        () =>
                        {
                            document.RawContent = originalContent;
                        });

                    test(
                        "Checking whether the raw content is generated correctly…",
                        () =>
                        {
                            let frontMatter = (fm as any)(document.RawContent) as fm.FrontMatterResult<any>;
                            strictEqual(frontMatter.body, content);

                            for (let key of Object.keys(attributes))
                            {
                                strictEqual(JSON.stringify(frontMatter.attributes[key]), JSON.stringify(attributes[key]));
                            }
                        });

                    test(
                        "Checking whether the raw content is parsed correctly…",
                        () =>
                        {
                            document.RawContent = `---\n${stringify(attributes)}---\n${content}`;
                            strictEqual(document.Content, content);

                            for (let key of Object.keys(attributes))
                            {
                                strictEqual(JSON.stringify(document.Attributes[key]), JSON.stringify(attributes[key]));
                            }
                        });

                    test(
                        "Checking whether setting malformed YAML causes an error…",
                        () =>
                        {
                            throws(
                                () =>
                                {
                                    document.RawContent = "---\nThis: is: incorrect: YAML\n---\n";
                                });
                        });
                });

            suite(
                "Render",
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

                    test(
                        "Checking whether stylesheets are added to the rendered document…",
                        async () =>
                        {
                            document.StyleSheets.push(styleSheet);

                            ok(
                                new RegExp(
                                    `<link.*?type="text/css".*?href="${styleSheet}".*?/>`,
                                    "g").test(await document.Render()));
                        });

                    test(
                        "Checking whether scripts are added to the rendered document…",
                        async () =>
                        {
                            document.Scripts.push(script);

                            ok(
                                new RegExp(
                                    `<script.*?src="${script}".*?>.*?</script>`,
                                    "g").test(await document.Render()));
                        });

                    test(
                        "Checking whether Document.Template is applied using Mustache…",
                        async () =>
                        {
                            document.Template = "hello{{content}}world";
                            ok(/^hello[\s\S]*world$/gm.test(await document.Render()));
                        });

                    test(
                        "Checking whether curly braces can be escaped…",
                        async () =>
                        {
                            let pattern = "{{test}}";
                            document.Content = `\\${pattern}`;
                            document.Attributes.test = "test-value";
                            let content = await document.Render();
                            console.log(content);
                            ok(load(await document.Render())(`*:contains(${JSON.stringify(pattern)})`).length > 0);
                        });
                });

            suite(
                "RenderText",
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
                            document.Content = content;

                            for (let key of Object.keys(attributes))
                            {
                                if (!(attributes[key] instanceof Date))
                                {
                                    (await document.Render()).includes(attributes[key]);
                                }
                            }
                        });

                    test(
                        "Checking whether date-attributes are formatted using the DateTimeFormatter…",
                        async () =>
                        {
                            document.Content = content;

                            for (let key of Object.keys(attributes))
                            {
                                if (attributes[key] instanceof Date)
                                {
                                    (await document.Render()).includes(
                                        new DateTimeFormatter(document.Locale).Format(document.DateFormat, attributes[key]));
                                }
                            }
                        });

                    test(
                        "Checking whether the locale of the document affects the date-format…",
                        async () =>
                        {
                            document.Content = content;
                            document.DateFormat = "dddd";

                            let englishContent: string;
                            let germanContent: string;

                            document.Locale = new CultureInfo("en");
                            englishContent = await document.Render();
                            document.Locale = new CultureInfo("de");
                            germanContent = await document.Render();
                            ok(englishContent !== germanContent);
                        });

                    test(
                        "Checking whether markdown is parsed when rendering the document…",
                        async () =>
                        {
                            document.Content = "**important**";
                            ok((await document.Render()).includes(parser.renderInline(document.Content)));
                        });
                });
        });
}
