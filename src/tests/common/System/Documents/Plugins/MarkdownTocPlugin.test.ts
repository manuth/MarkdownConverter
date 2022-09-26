import { ok } from "assert";
import { load } from "cheerio";
import MarkdownIt from "markdown-it";
import { Random } from "random-js";
import { TOC } from "../../../../../System/Documents/Plugins/MarkdownTocPlugin.js";
import { Slugifier } from "../../../../../System/Documents/Slugifier.js";

/**
 * Registers tests for the {@link TOC `TOC`}-plugin.
 */
export function MarkdownTocPluginTests(): void
{
    suite(
        nameof(TOC),
        () =>
        {
            let random: Random;
            let parser: MarkdownIt;
            let className: string;
            let heading: string;
            let count: number;
            let content: string;

            suiteSetup(
                () =>
                {
                    random = new Random();
                    parser = new MarkdownIt();
                });

            setup(
                () =>
                {
                    className = "toc";
                    heading = "Test";
                    count = 10;
                    content = "[[toc]]\n\n";

                    for (let i = 0; i < count; i++)
                    {
                        content += `${"#".repeat(random.integer(1, 6))} ${heading}\n`;
                    }

                    parser.use(
                        TOC,
                        {
                            containerClass: className
                        });
                });

            test(
                "Checking whether the table of contents is created correctly even if multiple documents are rendered at the same time…",
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

                        ok(results.every(
                            (result) =>
                            {
                                return load(result)(`.${className}`).has(`[href="#${slug}"]`);
                            }));
                    }
                });
        });
}
