import { ok } from "node:assert";
import { load } from "cheerio";
import MarkdownIt from "markdown-it";
import { Random } from "random-js";
import { Anchor } from "../../../../../System/Documents/Plugins/MarkdownAnchorPlugin.js";
import { Slugifier } from "../../../../../System/Documents/Slugifier.js";

/**
 * Registers tests for the {@link Anchor `Anchor`}-plugin.
 */
export function MarkdownAnchorPluginTests(): void
{
    suite(
        nameof(Anchor),
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

                    parser.use(Anchor);
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
