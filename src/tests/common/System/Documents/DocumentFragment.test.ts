import { ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import { stat, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { createSandbox, SinonSandbox } from "sinon";
import { TextDocument, workspace } from "vscode";
import YAML = require("yamljs");
import { AttributeKey } from "../../../../System/Documents/AttributeKey";
import { Document } from "../../../../System/Documents/Document";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment";
import { HelperKey } from "../../../../System/Documents/HelperKey";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter";
import { Utilities } from "../../../../Utilities";

/**
 * Registers tests for the {@link DocumentFragment `DocumentFragment`} class.
 */
export function DocumentFragmentTests(): void
{
    suite(
        nameof(DocumentFragment),
        () =>
        {
            let random: Random;
            let sandbox: SinonSandbox;
            let tempFile: TempFile;
            let content: string;
            let bodyTagName: string;
            let attributes: Record<string, any>;
            let textDocument: TextDocument;
            let document: Document;
            let fragment: DocumentFragment;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    tempFile = new TempFile();
                    content = "This is a test.";
                    bodyTagName = "body";

                    attributes = {
                        hello: "world",
                        date: new Date("1291-08-01")
                    };

                    let rawContent = `---\n${YAML.stringify(attributes).trim()}\n---\n${content}`;
                    await writeFile(tempFile.FullName, rawContent);
                    textDocument = await workspace.openTextDocument(tempFile.FullName);
                });

            suiteTeardown(
                () =>
                {
                    tempFile.Dispose();
                });

            setup(
                () =>
                {
                    sandbox = createSandbox();
                    document = new Document(new MarkdownIt(), textDocument);
                    fragment = new DocumentFragment(document);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameof(DocumentFragment.constructor),
                () =>
                {
                    test(
                        "Checking whether the properties are set correctly…",
                        () =>
                        {
                            let documentFragment = new DocumentFragment(document);
                            strictEqual(documentFragment.Document, document);
                        });
                });

            suite(
                nameof<DocumentFragment>((fragment) => fragment.Renderer),
                () =>
                {
                    test(
                        `Checking whether the renderer contains a helper called \`${HelperKey.FormatDate}\` for formatting dates…`,
                        () =>
                        {
                            let date = new Date();
                            let format = "dddd";

                            strictEqual(
                                fragment.Renderer.compile(
                                    `{{ ${HelperKey.FormatDate} ${nameof(date)} ${JSON.stringify(format)} }}`)({ date }),
                                new DateTimeFormatter(fragment.Document.Locale).Format(format));
                        });

                    test(
                        "Checking whether the locale of the document affects the date-format…",
                        async () =>
                        {
                            let date = new Date();
                            let pattern = `{{ ${HelperKey.FormatDate} ${nameof(date)} "dddd" }}`;
                            let englishContent: string;
                            let germanContent: string;
                            document.Locale = new CultureInfo("en");
                            englishContent = fragment.Renderer.compile(pattern)({ date });
                            document.Locale = new CultureInfo("de");
                            germanContent = fragment.Renderer.compile(pattern)({ date });
                            ok(englishContent !== germanContent);
                        });
                });

            suite(
                nameof<DocumentFragment>((fragment) => fragment.Render),
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
                        "Checking whether timestamps about the document are injected correctly…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            document.DefaultDateFormat = null;
                            fragment.Content = `{{${AttributeKey.CreationDate}}}`;
                            strictEqual(await fragment.Render(), `${(await stat(document.FileName)).birthtime}`);
                            fragment.Content = `{{${AttributeKey.ChangeDate}}}`;
                            strictEqual(await fragment.Render(), `${(await stat(document.FileName)).mtime}`);
                        });

                    test(
                        "Checking whether curly braces can be escaped…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let key = "test";
                            let pattern = `{{${key}}}`;
                            fragment.Content = `\\${pattern}`;
                            document.Attributes[key] = "test-value";
                            ok(load(await fragment.Render())(`*:contains(${JSON.stringify(pattern)})`).length > 0);
                        });

                    test(
                        "Checking whether non-date attributes are substituted correctly…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            fragment.Content = content;

                            for (let key of Object.keys(attributes))
                            {
                                if (!(attributes[key] instanceof Date))
                                {
                                    (await document.Render()).includes(attributes[key]);
                                }
                            }
                        });

                    test(
                        "Checking whether the title of the document and the name of the author can be injected into the document…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let name = random.string(10);

                            sandbox.replace(
                                Utilities,
                                "GetFullName",
                                async () =>
                                {
                                    return name;
                                });

                            fragment.Content = `{{ ${AttributeKey.Title} }}`;
                            strictEqual(await fragment.Render(), document.Title);
                            fragment.Content = `{{ ${AttributeKey.Author} }}`;
                            strictEqual(await fragment.Render(), name);
                        });

                    test(
                        "Checking whether pre-defined attributes can be overridden…",
                        async () =>
                        {
                            let attributeKeys = [
                                AttributeKey.Author,
                                AttributeKey.ChangeDate,
                                AttributeKey.CreationDate,
                                AttributeKey.CurrentDate,
                                AttributeKey.Title
                            ];

                            for (let key of attributeKeys)
                            {
                                let value = random.string(10);
                                fragment.Content = `{{ ${key} }}`;
                                document.Attributes[key] = value;
                                strictEqual(await fragment.Render(), value);
                            }
                        });

                    test(
                        `Checking whether date-attributes are formatted using the \`${nameof(DateTimeFormatter)}\`…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            fragment.Content = content;

                            for (let key of Object.keys(attributes))
                            {
                                if (attributes[key] instanceof Date)
                                {
                                    (await fragment.Render()).includes(
                                        new DateTimeFormatter(document.Locale).Format(document.DefaultDateFormat, attributes[key]));
                                }
                            }
                        });

                    test(
                        "Checking whether custom date-formats are respected when formatting dates…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let dateKey = "testDate";
                            let testDate = new Date();
                            let testFormatName = "myFormat";
                            let testFormat = "d";
                            document.DefaultDateFormat = testFormatName;
                            document.Content = `{{ ${dateKey} }}`;
                            document.Attributes[dateKey] = testDate;
                            document.DateFormats[testFormatName] = testFormat;
                            strictEqual(load(await document.Render())(bodyTagName).text().trim(), `${testDate.getDate()}`);
                        });

                    test(
                        "Checking whether date-attributes can be formatted individually shorthand…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let format = "dddd";

                            for (let key of Object.keys(attributes))
                            {
                                if (attributes[key] instanceof Date)
                                {
                                    fragment.Content = `{{ ${key} ${JSON.stringify(format)} }}`;

                                    strictEqual(
                                        await fragment.Render(),
                                        new DateTimeFormatter(document.Locale).Format(format, attributes[key]));
                                }
                            }
                        });
                });
        });
}
