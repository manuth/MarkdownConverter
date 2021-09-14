import { ok, strictEqual, throws } from "assert";
import { parse } from "path";
import { TempFile } from "@manuth/temp-files";
import fm = require("front-matter");
import { writeFile } from "fs-extra";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { TextDocument, workspace } from "vscode";
import YAML = require("yamljs");
import { StyleSheet } from "../../../../System/Documents/Assets/StyleSheet";
import { WebScript } from "../../../../System/Documents/Assets/WebScript";
import { AttributeKey } from "../../../../System/Documents/AttributeKey";
import { Document } from "../../../../System/Documents/Document";

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
            let document: Document;
            let untitledDocument: Document;

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
                    document = new Document(parser, textDocument);
                    untitledDocument = new Document(parser, untitledTextDocument);
                });

            suite(
                nameof(Document.constructor),
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
                            ok(!untitledDocument.FileName);
                        });

                    test(
                        "Checking whether the title is loaded from the document correctly…",
                        () =>
                        {
                            strictEqual(document.Title, parse(textDocument.fileName).name);
                            strictEqual(untitledDocument.Title, untitledTextDocument.uri.path);
                        });
                });

            suite(
                nameof<Document>((document) => document.Title),
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
                nameof<Document>((document) => document.RawContent),
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
                nameof<Document>((document) => document.Render),
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
                            let asset = new StyleSheet(styleSheet);
                            document.StyleSheets.push(asset);
                            ok((await document.Render()).includes(await asset.Render()));
                        });

                    test(
                        "Checking whether scripts are added to the rendered document…",
                        async () =>
                        {
                            let asset = new WebScript(script);
                            document.Scripts.push(asset);
                            ok((await document.Render()).includes(await asset.Render()));
                        });

                    test(
                        `Checking whether \`${nameof(Document)}.${nameof<Document>((d) => d.Template)}\` is applied using Handlebars…`,
                        async () =>
                        {
                            document.Template = "hello{{content}}world";
                            ok(/^hello[\s\S]*world$/gm.test(await document.Render()));
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
