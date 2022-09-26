import { ok, strictEqual } from "node:assert";
import { createServer, Server } from "node:http";
import { createRequire } from "node:module";
import { relative } from "node:path";
import { CultureInfo } from "@manuth/resource-manager";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import fs from "fs-extra";
import getPort from "get-port";
import MarkdownIt from "markdown-it";
import parseDataUrl from "parse-data-url";
import { Random } from "random-js";
import serveHandler from "serve-handler";
import { createSandbox, SinonSandbox } from "sinon";
import vscode, { TextDocument } from "vscode";
import YAML from "yamljs";
import { AssetURLType } from "../../../../System/Documents/Assets/AssetURLType.js";
import { InsertionType } from "../../../../System/Documents/Assets/InsertionType.js";
import { AttributeKey } from "../../../../System/Documents/AttributeKey.js";
import { Document } from "../../../../System/Documents/Document.js";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment.js";
import { HelperKey } from "../../../../System/Documents/HelperKey.js";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter.js";
import { Utilities } from "../../../../Utilities.js";

const { stat, writeFile } = fs;
const { workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link DocumentFragment `DocumentFragment`} class.
 */
export function DocumentFragmentTests(): void
{
    suite(
        nameof(DocumentFragment),
        () =>
        {
            /**
             * Provides an implementation of the {@link DocumentFragment `DocumentFragment`} class for testing.
             */
            class TestDocumentFragment extends DocumentFragment
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The rendered text.
                 */
                public override RenderContent(): Promise<string>
                {
                    return super.RenderContent();
                }
            }

            let random: Random;
            let sandbox: SinonSandbox;
            let tempFile: TempFile;
            let content: string;
            let bodyTagName: string;
            let attributes: Record<string, any>;
            let textDocument: TextDocument;
            let document: Document;
            let fragment: TestDocumentFragment;

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
                    fragment = new TestDocumentFragment(document);
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
                nameof<TestDocumentFragment>((fragment) => fragment.Renderer),
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
                nameof<TestDocumentFragment>((fragment) => fragment.Render),
                () =>
                {
                    let tempDir: TempDirectory;
                    let tempFile: TempFile;
                    let relativePath: string;
                    let host: string;
                    let port: number;
                    let server: Server;
                    let link: string;
                    let content: string;

                    suiteSetup(
                        async () =>
                        {
                            tempDir = new TempDirectory();

                            tempFile = new TempFile(
                                {
                                    Directory: tempDir.FullName,
                                    Suffix: ".png"
                                });

                            await writeFile(tempFile.FullName, random.string(100));
                            relativePath = relative(tempDir.FullName, tempFile.FullName);
                            host = "localhost";
                            port = await getPort();

                            server = createServer(
                                async (request, response) =>
                                {
                                    serveHandler(
                                        request,
                                        response,
                                        {
                                            public: tempDir.FullName,
                                            cleanUrls: false
                                        });
                                });

                            server.listen(port, host);
                            link = `http://${host}:${port}/${relativePath}`;
                        });

                    suiteTeardown(
                        () =>
                        {
                            server.close();
                            tempFile.Dispose();
                            tempDir.Dispose();
                        });

                    setup(
                        () =>
                        {
                            content = "";

                            sandbox.replace(
                                fragment,
                                "RenderContent",
                                async () =>
                                {
                                    return content;
                                });

                            sandbox.replaceGetter(document, "FileName", () => tempDir.MakePath(".md"));
                        });

                    test(
                        `Checking whether pictures are getting included using Base64-encoding according to the \`${nameof<DocumentFragment>((f) => f.Document)}\`'s \`${nameof<Document>((d) => d.PictureInsertionTypes)}\`-setting…`,
                        async function()
                        {
                            let imgTagName = "img";
                            let srcAttributeName = "src";

                            for (let entry of [
                                [
                                    AssetURLType.AbsolutePath,
                                    tempFile.FullName
                                ],
                                [
                                    AssetURLType.RelativePath,
                                    relativePath
                                ],
                                [
                                    AssetURLType.Link,
                                    link
                                ]
                            ] as Array<[AssetURLType, string]>)
                            {
                                content = `<${imgTagName} ${srcAttributeName}="${entry[1]}" />`;

                                strictEqual(
                                    load(await fragment.Render())(imgTagName).attr(srcAttributeName),
                                    entry[1]);

                                document.PictureInsertionTypes.set(entry[0], InsertionType.Include);
                                let parsedDataURL = parseDataUrl(load(await fragment.Render())(imgTagName).attr(srcAttributeName));
                                ok(parsedDataURL);
                                ok(parsedDataURL.base64);
                                ok(parsedDataURL.contentType);
                                ok(parsedDataURL.toBuffer().length > 0);
                            }
                        });
                });

            suite(
                nameof<TestDocumentFragment>((fragment) => fragment.RenderContent),
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
