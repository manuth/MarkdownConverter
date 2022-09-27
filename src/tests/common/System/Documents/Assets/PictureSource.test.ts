import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import fs from "fs-extra";
import MarkdownIt from "markdown-it";
import parseDataUrl from "parse-data-url";
import { Random } from "random-js";
import vscode, { TextDocument } from "vscode";
import { Constants } from "../../../../../Constants.js";
import { InsertionType } from "../../../../../System/Documents/Assets/InsertionType.js";
import { PictureSource } from "../../../../../System/Documents/Assets/PictureSource.js";
import { Document } from "../../../../../System/Documents/Document.js";

const { readFile, writeFile } = fs;
const { workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link PictureSource `PictureSource`} class.
 */
export function PictureSourceTests(): void
{
    suite(
        nameof(PictureSource),
        () =>
        {
            /**
             * Provides an implementation of the {@link PictureSource `PictureSource`} class for testing.
             */
            class TestPictureSource extends PictureSource
            {
                /**
                 * @inheritdoc
                 */
                public override get DocRoot(): string
                {
                    return super.DocRoot;
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The type of the insertion of the picture.
                 */
                public override GetInsertionType(): InsertionType
                {
                    return super.GetInsertionType();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The inline-source of the picture.
                 */
                public override async GetSource(): Promise<string>
                {
                    return super.GetSource();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The reference-expression of the picture.
                 */
                public override async GetReferenceSource(): Promise<string>
                {
                    return super.GetReferenceSource();
                }
            }

            let random: Random;
            let tempDir: TempDirectory;
            let tempFile: TempFile;
            let textDocument: TextDocument;
            let document: Document;
            let untitledDocument: Document;
            let source: TestPictureSource;
            let untitledSource: TestPictureSource;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    tempDir = new TempDirectory();

                    tempFile = new TempFile(
                        {
                            Directory: tempDir.FullName
                        });

                    textDocument = await workspace.openTextDocument(tempFile.FullName);
                    document = new Document(new MarkdownIt(), textDocument);
                    untitledDocument = new Document(new MarkdownIt(), await workspace.openTextDocument({}));
                    source = new TestPictureSource(document, tempFile.FullName);
                    untitledSource = new TestPictureSource(untitledDocument, tempFile.FullName);
                });

            suiteTeardown(
                () =>
                {
                    tempFile.Dispose();
                    tempDir.Dispose();
                });

            suite(
                nameof<TestPictureSource>((source) => source.DocRoot),
                () =>
                {
                    test(
                        `Checking whether no \`${nameof<TestPictureSource>((source) => source.DocRoot)}\` is returned for untitled documents…`,
                        () =>
                        {
                            strictEqual(untitledSource.DocRoot, null);
                        });

                    test(
                        "Checking whether the directory containing the document is returned for non-untitled documents…",
                        () =>
                        {
                            strictEqual(source.DocRoot, dirname(document.FileName));
                        });
                });

            suite(
                nameof<TestPictureSource>((source) => source.GetInsertionType),
                () =>
                {
                    test(
                        `Checking whether \`${nameof.full(InsertionType.Link)}\` is returned if the insertion-type is set to \`${nameof.full(InsertionType.Default)}\`…`,
                        () =>
                        {
                            source.InsertionType = InsertionType.Default;
                            strictEqual(source.GetInsertionType(), InsertionType.Link);
                        });

                    test(
                        `Checking whether the specified \`${nameof(InsertionType)}\` is returned in all other cases…`,
                        () =>
                        {
                            for (let insertionType of [InsertionType.Include, InsertionType.Link])
                            {
                                source.InsertionType = insertionType;
                                strictEqual(source.GetInsertionType(), insertionType);
                            }
                        });
                });

            suite(
                nameof<TestPictureSource>((source) => source.GetSource),
                () =>
                {
                    test(
                        "Checking whether a correct Base64-encoded picture-source is returned…",
                        async () =>
                        {
                            /**
                             * Gets the mime-type for the specified {@link extension `extension`}.
                             *
                             * @param extension
                             * The extension to get the mime-type for.
                             *
                             * @returns
                             * The mime-type for the specified {@link extension `extension`}.
                             */
                            function getMimeType(extension: string): string
                            {
                                let result: string;

                                if (extension === "jpg")
                                {
                                    result = "jpeg";
                                }
                                else if (extension === "svg")
                                {
                                    result = extension + "+xml";
                                }
                                else
                                {
                                    result = extension;
                                }

                                return `image/${result}`;
                            }

                            for (let extension of ["png", "jpg", "svg"])
                            {
                                let fileName = tempDir.MakePath(`picture.${extension}`);
                                await writeFile(fileName, random.string(100));
                                let parsedURL = parseDataUrl(await new TestPictureSource(document, fileName).GetSource());
                                ok(parsedURL);
                                ok(parsedURL.base64);
                                strictEqual(parsedURL.contentType, getMimeType(extension));

                                deepStrictEqual(
                                    parsedURL.toBuffer().toJSON(),
                                    (await readFile(fileName)).toJSON());
                            }
                        });

                    test(
                        "Checking whether a link is returned if the corresponding document is untitled and the link is a relative path…",
                        async () =>
                        {
                            let relativePath = "./test";

                            strictEqual(
                                await new TestPictureSource(untitledDocument, relativePath).GetSource(),
                                await new TestPictureSource(untitledDocument, relativePath).GetReferenceSource());
                        });
                });
        });
}
