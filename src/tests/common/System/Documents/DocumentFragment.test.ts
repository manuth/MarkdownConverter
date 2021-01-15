import { ok, strictEqual } from "assert";
import { CultureInfo } from "@manuth/resource-manager";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import { stat, writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { TextDocument, workspace } from "vscode";
import { stringify } from "yamljs";
import { AttributeKey } from "../../../../System/Documents/AttributeKey";
import { Document } from "../../../../System/Documents/Document";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment";
import { HelperKey } from "../../../../System/Documents/HelperKey";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter";

/**
 * Registers tests for the `DocumentFragment` class.
 */
export function DocumentFragmentTests(): void
{
    suite(
        "DocumentFragment",
        () =>
        {
            let tempFile: TempFile;
            let content: string;
            let attributes: Record<string, any>;
            let textDocument: TextDocument;
            let document: Document;
            let fragment: DocumentFragment;

            suiteSetup(
                async () =>
                {
                    tempFile = new TempFile();
                    content = "This is a test.";

                    attributes = {
                        hello: "world",
                        date: new Date("1291-08-01")
                    };

                    let rawContent = `---\n${stringify(attributes).trim()}\n---\n${content}`;
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
                    document = new Document(textDocument, new MarkdownIt());
                    fragment = new DocumentFragment(document);
                });

            suite(
                "constructor",
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
                        "Checking whether timestamps about the document are injected correctly…",
                        async function()
                        {
                            document.DefaultDateFormat = null;
                            fragment.Content = `{{${AttributeKey.CreationDate}}}`;
                            strictEqual(load(await fragment.Render())("body").text().trim(), `${(await stat(document.FileName)).birthtime}`);
                            fragment.Content = `{{${AttributeKey.ChangeDate}}}`;
                            strictEqual(load(await fragment.Render())("body").text().trim(), `${(await stat(document.FileName)).mtime}`);
                        });

                    test(
                        "Checking whether curly braces can be escaped…",
                        async () =>
                        {
                            let key = "test";
                            let pattern = `{{${key}}}`;
                            fragment.Content = `\\${pattern}`;
                            document.Attributes[key] = "test-value";
                            ok(load(await fragment.Render())(`*:contains(${JSON.stringify(pattern)})`).length > 0);
                        });

                    test(
                        "Checking whether non-date attributes are substituted correctly…",
                        async () =>
                        {
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
                        "Checking whether date-attributes are formatted using the `DateTimeFormatter`…",
                        async () =>
                        {
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
                        "Checking whether custom date-formats can be specified…",
                        async () =>
                        {
                            let dateKey = "testDate";
                            let testDate = new Date();
                            let testFormatName = "myFormat";
                            let testFormat = "d";
                            document.DefaultDateFormat = testFormatName;
                            document.Content = `{{ ${dateKey} }}`;
                            document.Attributes[dateKey] = testDate;
                            document.DateFormats[testFormatName] = testFormat;
                            strictEqual(load(await document.Render())("body").text().trim(), `${testDate.getDate()}`);
                        });

                    test(
                        "Checking whether dates can be formatted individually…",
                        async () =>
                        {
                            let dateKey = "testDate";
                            let testDate = new Date();
                            let testFormat = "M";
                            document.DefaultDateFormat = "d";
                            fragment.Content = `{{ ${HelperKey.FormatDate} ${dateKey} ${JSON.stringify(testFormat)} }}`;
                            document.Attributes[dateKey] = testDate;
                            strictEqual(load(await fragment.Render())("body").text().trim(), `${testDate.getMonth() + 1}`);
                        });

                    test(
                        "Checking whether the locale of the document affects the date-format…",
                        async () =>
                        {
                            fragment.Content = content;
                            document.DefaultDateFormat = "dddd";

                            let englishContent: string;
                            let germanContent: string;

                            document.Locale = new CultureInfo("en");
                            englishContent = await fragment.Render();
                            document.Locale = new CultureInfo("de");
                            germanContent = await fragment.Render();
                            ok(englishContent !== germanContent);
                        });
                });
        });
}
