import { strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import { writeFile } from "fs-extra";
import { Random } from "random-js";
import { StyleSheet } from "../../../../../System/Documents/Assets/StyleSheet";

/**
 * Registers tests for the `StyleSheet` class.
 */
export function StyleSheetTests(): void
{
    suite(
        "StyleSheet",
        () =>
        {
            /**
             * Provides an implementation of the {@link StyleSheet `StyleSheet`} class for testing.
             */
            class StyleSheetTest extends StyleSheet
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The inline-source of the asset.
                 */
                public override GetSource(): string
                {
                    return super.GetSource();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The reference-expression of the asset.
                 */
                public override GetReferenceSource(): string
                {
                    return super.GetReferenceSource();
                }
            }

            let random: Random;
            let styleSheet: StyleSheetTest;
            let tempFile: TempFile;
            let content: string;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    tempFile = new TempFile();
                    content = random.string(10);
                    await writeFile(tempFile.FullName, content);
                    styleSheet = new StyleSheetTest(tempFile.FullName);
                });

            suite(
                "GetSource",
                async () =>
                {
                    test(
                        "Checking whether the source is created correctly…",
                        () =>
                        {
                            strictEqual(load(styleSheet.GetSource())("style").html(), content);
                        });
                });

            suite(
                "GetReferenceSource",
                () =>
                {
                    test(
                        "Checking whether the source containing a reference to the stylesheet is created correctly…",
                        () =>
                        {
                            let linkTag = load(styleSheet.GetReferenceSource())("link");
                            strictEqual(linkTag.attr("rel"), "stylesheet");
                            strictEqual(linkTag.attr("type"), "text/css");
                            strictEqual(linkTag.attr("href"), styleSheet.URL);
                        });
                });
        });
}
