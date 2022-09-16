import { ok } from "assert";
import { load } from "cheerio";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { Slugifier } from "../../../../../System/Documents/Slugifier";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
let anchorResolver = async () =>
{
    return import("../../../../../System/Documents/Plugins/MarkdownAnchorPlugin.mjs");
};

let anchorModule: Awaited<ReturnType<typeof anchorResolver>>;

/**
 * Registers tests for the {@link Anchor `Anchor`}-plugin.
 */
export function MarkdownAnchorPluginTests(): void
{
    suite(
        nameof(anchorModule.Anchor),
        () =>
        {
            let random: Random;
            let parser: MarkdownIt;
            let heading: string;
            let count: number;
            let content: string;

            suiteSetup(
                async () =>
                {
                    anchorModule = await anchorResolver();
                    random = new Random();
                    parser = new MarkdownIt();
                });

            setup(
                () =>
                {
                    heading = "Test";
                    count = 10;
                    content = "";

                    for (let i = 0; i < count; i++)
                    {
                        content += `${"#".repeat(random.integer(1, 6))} ${heading}\n`;
                    }

                    parser.use(anchorModule.Anchor);
                });

            test(
                "Checking whether anchors are created correctly even if multiple documents are rendered at the same time…",
                async () =>
                {
                    let slugifier = new Slugifier();

                    let results = await Promise.all(
                        [
                            (async () => parser.render(content))(),
                            (async () => parser.render(content))()
                        ]);

                    for (let i = 0; i < count; i++)
                    {
                        let slug = slugifier.CreateSlug(heading);
                        ok(results.every((result) => load(result)(`#${slug}`).length > 0));
                    }
                });
        });
}
