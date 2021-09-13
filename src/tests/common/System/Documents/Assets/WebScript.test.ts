import { ok, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import { writeFile } from "fs-extra";
import { Random } from "random-js";
import { WebScript } from "../../../../../System/Documents/Assets/WebScript";

/**
 * Register tests for the `WebScript` class.
 */
export function WebScriptTests(): void
{
    suite(
        "WebScript",
        () =>
        {
            /**
             * Provides an implementation of the {@link WebScript `WebScript`} class for testing.
             */
            class WebScriptTest extends WebScript
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The inline-source of the asset.
                 */
                public override async GetSource(): Promise<string>
                {
                    return super.GetSource();
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The reference-expression of the asset.
                 */
                public override async GetReferenceSource(): Promise<string>
                {
                    return super.GetReferenceSource();
                }
            }

            let random: Random;
            let webScript: WebScriptTest;
            let tempFile: TempFile;
            let content: string;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    tempFile = new TempFile();
                    content = random.string(10);
                    await writeFile(tempFile.FullName, content);
                    webScript = new WebScriptTest(tempFile.FullName);
                });

            suite(
                "GetSource",
                async () =>
                {
                    test(
                        "Checking whether the source is created correctly…",
                        async () =>
                        {
                            strictEqual(load(await webScript.GetSource())("script").html(), content);
                        });
                });

            suite(
                "GetReferenceSource",
                () =>
                {
                    test(
                        "Checking whether the source containing a reference to the stylesheet is created correctly…",
                        async () =>
                        {
                            let linkTag = load(await webScript.GetReferenceSource())("script");
                            ok(linkTag.attr("async"));
                            strictEqual(linkTag.attr("src"), webScript.URL);
                            strictEqual(linkTag.attr("charset"), "UTF-8");
                        });
                });
        });
}
