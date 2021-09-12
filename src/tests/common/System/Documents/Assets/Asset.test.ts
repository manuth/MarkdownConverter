import { strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { Random } from "random-js";
import { Asset } from "../../../../../System/Documents/Assets/Asset";
import { AssetURLType } from "../../../../../System/Documents/Assets/AssetURLType";
import { InsertionType } from "../../../../../System/Documents/Assets/InsertionType";

/**
 * Registers tests for the `Asset` class.
 */
export function AssetTests(): void
{
    suite(
        "Asset",
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
                 * The inline-source of the asset.
                 */
                protected GetSource(): string
                {
                    return inlineSource;
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The reference-expression of the asset.
                 */
                protected GetReferenceSource(): string
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
                "constructor",
                () =>
                {
                    test(
                        "Checking whether the values are set correctly…",
                        () =>
                        {
                            strictEqual(asset.Path, file.FullName);

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
                "Path",
                () =>
                {
                    test(
                        "Checking whether the path uf URLs is returned…",
                        () =>
                        {
                            strictEqual(new AssetTest(`file:${absolutePath}`).Path.toUpperCase(), absolutePath.toUpperCase());
                        });
                });

            suite(
                "URLType",
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
                "GetInsertionType",
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
                "ToString",
                () =>
                {
                    test(
                        "Checking whether assets are generated according to their insertion-type…",
                        () =>
                        {
                            strictEqual(new AssetTest(link, InsertionType.Include).ToString(), inlineSource);
                            strictEqual(new AssetTest(link, InsertionType.Link).ToString(), referenceSource);
                        });
                });
        });
}
