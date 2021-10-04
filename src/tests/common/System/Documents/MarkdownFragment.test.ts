import { strictEqual } from "assert";
import { load } from "cheerio";
import MarkdownIt = require("markdown-it");
import { Random } from "random-js";
import { Document } from "../../../../System/Documents/Document";
import { MarkdownFragment } from "../../../../System/Documents/MarkdownFragment";

/**
 * Registers tests for the {@link MarkdownFragment `MarkdownFragment`} class.
 */
export function MarkdownFragmentTests(): void
{
    suite(
        nameof(MarkdownFragment),
        () =>
        {
            /**
             * Provides an implementation of the {@link MarkdownFragment `MarkdownFragment`} class for testing.
             */
            class TestMarkdownFragment extends MarkdownFragment
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The rendered text.
                 */
                public override RenderContent(): Promise<string>
                {
                    return super.RenderContent();
                }
            }

            let random: Random;
            let fragment: TestMarkdownFragment;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                () =>
                {
                    fragment = new TestMarkdownFragment(new Document(new MarkdownIt()));
                });

            suite(
                nameof<TestMarkdownFragment>((fragment) => fragment.RenderContent),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof(MarkdownFragment)}\` is rendered using \`${nameof(MarkdownIt)}\`…`,
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let text = random.string(10);
                            fragment.Content = `**${text}**`;
                            let textSelector = `:contains("${text}")`;
                            let result = await fragment.Render();

                            strictEqual(
                                load(result)(`b${textSelector},strong${textSelector}`).length,
                                1);
                        });
                });
        });
}
