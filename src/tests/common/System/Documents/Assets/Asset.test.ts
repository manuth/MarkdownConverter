import { rejects, strictEqual } from "assert";
import { createServer, Server } from "http";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { mkdirp, writeFile } from "fs-extra";
import getPort = require("get-port");
import { Random } from "random-js";
import serveHandler = require("serve-handler");
import { dirname, join } from "upath";
import { Asset } from "../../../../../System/Documents/Assets/Asset";
import { AssetURLType } from "../../../../../System/Documents/Assets/AssetURLType";
import { InsertionType } from "../../../../../System/Documents/Assets/InsertionType";

/**
 * Registers tests for the {@link Asset `Asset`} class.
 */
export function AssetTests(): void
{
    suite(
        nameof(Asset),
        () =>
        {
            /**
             * Provides an implementation of the {@link Asset `Asset`} class for testing.
             */
            class AssetTest extends Asset
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The type of the insertion of the asset.
                 */
                public override GetInsertionType(): InsertionType
                {
                    return super.GetInsertionType();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The content of the asset.
                 */
                public override async ReadFile(): Promise<string>
                {
                    return super.ReadFile();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The inline-source of the asset.
                 */
                protected async GetSource(): Promise<string>
                {
                    return inlineSource;
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The reference-expression of the asset.
                 */
                protected async GetReferenceSource(): Promise<string>
                {
                    return referenceSource;
                }
            }

            let random: Random;
            let insertionTypes: InsertionType[];
            let insertionType: InsertionType;
            let inlineSource: string;
            let referenceSource: string;
            let file: TempFile;
            let asset: AssetTest;
            let link: string;
            let relativePath: string;
            let absolutePath: string;

            suiteSetup(
                () =>
                {
                    random = new Random();

                    insertionTypes = [
                        InsertionType.Default,
                        InsertionType.Include,
                        InsertionType.Link
                    ];

                    inlineSource = "inline";
                    referenceSource = "reference";
                    file = new TempFile();
                    asset = new AssetTest(file.FullName);
                    link = "https://google.com/";
                    relativePath = "./test";
                    absolutePath = file.FullName;
                });

            suiteTeardown(
                () =>
                {
                    file.Dispose();
                });

            setup(
                () =>
                {
                    insertionType = random.pick(insertionTypes);
                });

            suite(
                nameof(Asset.constructor),
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            strictEqual(asset.URL, file.FullName);

                            strictEqual(
                                new AssetTest(absolutePath, insertionType).InsertionType,
                                insertionType);
                        });

                    test(
                        `Checking whether the \`${nameof<AssetTest>((a) => a.InsertionType)}\` is set to \`${nameof(InsertionType.Default)}\` by default…`,
                        () =>
                        {
                            strictEqual(asset.InsertionType, InsertionType.Default);
                        });
                });

            suite(
                nameof<AssetTest>((asset) => asset.URLType),
                () =>
                {
                    test(
                        "Checking whether the type of the path is determined correctly…",
                        () =>
                        {
                            strictEqual(new AssetTest(link).URLType, AssetURLType.Link);
                            strictEqual(new AssetTest(relativePath).URLType, AssetURLType.RelativePath);
                            strictEqual(new AssetTest(absolutePath).URLType, AssetURLType.AbsolutePath);
                        });
                });

            suite(
                nameof<AssetTest>((asset) => asset.GetInsertionType),
                () =>
                {
                    test(
                        "Checking whether the insertion-type is determined correctly…",
                        () =>
                        {
                            strictEqual(new AssetTest(absolutePath, InsertionType.Include).GetInsertionType(), InsertionType.Include);
                            strictEqual(new AssetTest(link).GetInsertionType(), InsertionType.Link);
                            strictEqual(new AssetTest(relativePath).GetInsertionType(), InsertionType.Include);
                            strictEqual(new AssetTest(absolutePath).GetInsertionType(), InsertionType.Include);
                        });
                });

            suite(
                nameof<AssetTest>((asset) => asset.Render),
                () =>
                {
                    test(
                        "Checking whether assets are generated according to their insertion-type…",
                        async () =>
                        {
                            strictEqual(await new AssetTest(link, InsertionType.Include).Render(), inlineSource);
                            strictEqual(await new AssetTest(link, InsertionType.Link).Render(), referenceSource);
                        });
                });

            suite(
                nameof<AssetTest>((asset) => asset.ReadFile),
                () =>
                {
                    let tempDir: TempDirectory;
                    let relativePath: string;
                    let host: string;
                    let port: number;
                    let server: Server;
                    let content: string;

                    suiteSetup(
                        async () =>
                        {
                            tempDir = new TempDirectory();
                            relativePath = join(random.string(10), random.string(10));
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
                        });

                    setup(
                        async () =>
                        {
                            let fileName = tempDir.MakePath(relativePath);
                            await mkdirp(dirname(fileName));
                            content = random.string(50);
                            await writeFile(file.FullName, content);
                            await writeFile(fileName, content);
                        });

                    suiteTeardown(
                        () =>
                        {
                            tempDir.Dispose();
                        });

                    test(
                        "Checking whether files specified with an absolute path can be read…",
                        async () =>
                        {
                            strictEqual(await new AssetTest(file.FullName).ReadFile(), content);
                        });

                    test(
                        "Checking whether files specified with a relative path can be read…",
                        async () =>
                        {
                            strictEqual(
                                await new AssetTest(relativePath, null, tempDir.FullName).ReadFile(),
                                content);
                        });

                    test(
                        "Checking whether files specified with a URL can be read…",
                        async () =>
                        {
                            strictEqual(
                                await new AssetTest(`http://${host}:${port}/${relativePath}`).ReadFile(),
                                content);
                        });

                    test(
                        "Checking whether errors while reading a file from an URL throws an exception…",
                        async () =>
                        {
                            rejects(() => new AssetTest("https://localhorst/").ReadFile());
                        });
                });
        });
}
