import { ok, strictEqual, throws } from "node:assert";
import { createRequire } from "node:module";
import { parse } from "node:path";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import fm from "front-matter";
import fs from "fs-extra";
import Handlebars from "handlebars";
import MarkdownIt from "markdown-it";
import { Random } from "random-js";
import vscode, { TextDocument } from "vscode";
import YAML from "yamljs";
import { StyleSheet } from "../../../../System/Documents/Assets/StyleSheet.js";
import { WebScript } from "../../../../System/Documents/Assets/WebScript.js";
import { AttributeKey } from "../../../../System/Documents/AttributeKey.js";
import { Document } from "../../../../System/Documents/Document.js";
import { DocumentFragment } from "../../../../System/Documents/DocumentFragment.js";

const { writeFile } = fs;
const { create } = Handlebars;
const { workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link Document `Document`} class.
 */
export function DocumentTests(): void
{
    suite(
        nameof(Document),
        () =>
        {
            let random: Random;
            let content: string;
            let attributes: Record<string, any>;
            let rawContent: string;
            let tempFile: TempFile;
            let parser: MarkdownIt;
            let textDocument: TextDocument;
            let untitledTextDocument: TextDocument;
            let document: TestDocument;
            let untitledDocument: TestDocument;

            /**
             * Provides an implementation of the {@link Document `Document`} class for
             */
            class TestDocument extends Document
            {
                /**
                 * @inheritdoc
                 */
                public override get Body(): DocumentFragment
                {
                    return super.Body;
                }
            }

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    content = "This is a test.";

                    attributes = {
                        hello: "world",
                        date: new Date("1291-08-01")
                    };

                    rawContent = `---\n${YAML.stringify(attributes).trim()}\n---\n${content}`;

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
                    document = new TestDocument(parser, textDocument);
                    untitledDocument = new TestDocument(parser, untitledTextDocument);
                });

            suite(
                nameof(Document.constructor),
                () =>
                {
                    let untitledName = "Untitled";

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
                            ok(!untitledDocument.FileName);
                        });

                    test(
                        "Checking whether the title is loaded from the document correctly…",
                        () =>
                        {
                            strictEqual(document.Title, parse(textDocument.fileName).name);
                            strictEqual(untitledDocument.Title, untitledTextDocument.uri.path);
                        });

                    test(
                        `Checking whether the title of the document is set to \`${untitledName}\` if no document is passed…`,
                        () =>
                        {
                            strictEqual(new Document(new MarkdownIt()).Title, untitledName);
                        });

                    test(
                        "Checking whether the initialized meta-template includes the document-title…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let rendered = await document.Meta.Render();
                            let cheerio = load(rendered);
                            strictEqual(cheerio("title").text(), document.Title);
                        });
                });

            suite(
                nameof<TestDocument>((document) => document.Title),
                () =>
                {
                    test(
                        `Checking whether the \`${AttributeKey.Title}\`-attribute overrides the actual title…`,
                        () =>
                        {
                            document.Attributes[AttributeKey.Title] = random.string(10);
                            untitledDocument.Attributes[AttributeKey.Title] = random.string(10);
                            strictEqual(document.Title, document.Attributes[AttributeKey.Title]);
                            strictEqual(untitledDocument.Title, untitledDocument.Attributes[AttributeKey.Title]);
                        });
                });

            suite(
                nameof<TestDocument>((document) => document.RawContent),
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
                            document.RawContent = `---\n${YAML.stringify(attributes)}---\n${content}`;
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
                nameof<TestDocument>((document) => document.Content),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<TestDocument>((d) => d.Content)}\` gets and sets the content from the \`${nameof<TestDocument>((d) => d.Body)}\`-fragment…`,
                        () =>
                        {
                            let content = random.string(10);
                            document.Content = content;
                            strictEqual(document.Body.Content, content);
                            strictEqual(document.Content, document.Body.Content);
                        });
                });

            suite(
                nameof<TestDocument>((document) => document.Template),
                () =>
                {
                    let mockedView: Record<string, unknown>;
                    let sections: string[];
                    let calledSections: string[];

                    suiteSetup(
                        () =>
                        {
                            sections = [
                                "meta",
                                "styles",
                                "content",
                                "scripts"
                            ];
                        });

                    setup(
                        () =>
                        {
                            mockedView = {};
                            calledSections = [];

                            for (let section of sections)
                            {
                                Object.defineProperty(
                                    mockedView,
                                    section,
                                    {
                                        get: () =>
                                        {
                                            calledSections.push(section);
                                            return `<${section} />`;
                                        }
                                    });
                            }
                        });

                    test(
                        "Checking whether the template includes all expected content-sections…",
                        () =>
                        {
                            create().compile(document.Template)(mockedView);

                            ok(
                                sections.every(
                                    (section) =>
                                    {
                                        return calledSections.includes(section);
                                    }));
                        });

                    test(
                        "Checking whether HTMl-characters inside the content-sections aren't escaped…",
                        () =>
                        {
                            let result = create().compile(document.Template)(mockedView);

                            for (let section of calledSections)
                            {
                                load(result).root().has(section);
                            }
                        });
                });

            suite(
                nameof<TestDocument>((document) => document.Render),
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
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let asset = new StyleSheet(styleSheet);
                            document.StyleSheets.push(asset);
                            ok((await document.Render()).includes(await asset.Render()));
                        });

                    test(
                        "Checking whether scripts are added to the rendered document…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let asset = new WebScript(script);
                            document.Scripts.push(asset);
                            ok((await document.Render()).includes(await asset.Render()));
                        });

                    test(
                        "Checking whether the metadata-section is added to the rendered document…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            ok((await document.Render()).includes(await document.Meta.Render()));
                        });

                    test(
                        "Checking whether the actual contents of the document are present…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            ok((await document.Render()).includes(await document.Body.Render()));
                        });

                    test(
                        `Checking whether \`${nameof(Document)}.${nameof<TestDocument>((d) => d.Template)}\` is applied using Handlebars…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let template = "hello{{content}}world";
                            let content = await document.Body.Render();
                            let rendered = create().compile(template)({ content });
                            document.Template = template;
                            strictEqual(await document.Render(), rendered);
                        });

                    test(
                        "Checking whether markdown is parsed when rendering the document…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            document.Content = "**important**";
                            ok((await document.Render()).includes(parser.renderInline(document.Content)));
                        });
                });
        });
}
