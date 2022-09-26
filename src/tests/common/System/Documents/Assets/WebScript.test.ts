import { ok, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { load } from "cheerio";
import fs from "fs-extra";
import { Random } from "random-js";
import { WebScript } from "../../../../../System/Documents/Assets/WebScript.js";

const { writeFile } = fs;

/**
 * Register tests for the {@link WebScript `WebScript`} class.
 */
export function WebScriptTests(): void
{
    suite(
        nameof(WebScript),
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
            let scriptTagName: string;
            let webScript: WebScriptTest;
            let tempFile: TempFile;
            let content: string;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                    scriptTagName = "script";
                    tempFile = new TempFile();
                    content = random.string(10);
                    await writeFile(tempFile.FullName, content);
                    webScript = new WebScriptTest(tempFile.FullName);
                });

            suite(
                nameof<WebScriptTest>((script) => script.GetSource),
                async () =>
                {
                    test(
                        "Checking whether the source is created correctly…",
                        async () =>
                        {
                            strictEqual(load(await webScript.GetSource())(scriptTagName).html(), content);
                        });
                });

            suite(
                nameof<WebScriptTest>((script) => script.GetReferenceSource),
                () =>
                {
                    test(
                        "Checking whether the source containing a reference to the stylesheet is created correctly…",
                        async () =>
                        {
                            let linkTag = load(await webScript.GetReferenceSource())(scriptTagName);
                            ok(linkTag.is("[async]"));
                            strictEqual(linkTag.attr("src"), webScript.URL);
                            strictEqual(linkTag.attr("charset"), "UTF-8");
                        });
                });
        });
}
