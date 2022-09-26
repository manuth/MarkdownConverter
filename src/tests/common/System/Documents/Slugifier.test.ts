import { notStrictEqual, strictEqual } from "node:assert";
import kebabCase from "lodash.kebabcase";
import { Random } from "random-js";
import { Slugifier } from "../../../../System/Documents/Slugifier.js";

/**
 * Registers tests for the {@link Slugifier `Slugifier`} class.
 */
export function SlugifierTests(): void
{
    suite(
        nameof(Slugifier),
        () =>
        {
            let random: Random;
            let slugifier: Slugifier;
            let slug: string;

            suiteSetup(
                () =>
                {
                    random = new Random();
                    slug = "This Is a Test";
                });

            setup(
                () =>
                {
                    slugifier = new Slugifier();
                });

            suite(
                nameof<Slugifier>((slugifier) => slugifier.CreateSlug),
                () =>
                {
                    test(
                        "Checking whether slugs are created correctly…",
                        () =>
                        {
                            strictEqual(slugifier.CreateSlug(slug), kebabCase(slug));
                        });

                    test(
                        "Checking whether numbers are appended to duplicate slugs…",
                        () =>
                        {
                            slugifier.CreateSlug(slug);

                            let max = random.integer(2, 10);

                            for (let i = 0; i < max; i++)
                            {
                                strictEqual(slugifier.CreateSlug(slug), kebabCase(`${slug}${i + 1}`));
                            }
                        });

                    test(
                        "Checking whether multiple spaces in a row are not removed…",
                        () =>
                        {
                            let count = random.integer(1, 10);

                            strictEqual(
                                slugifier.CreateSlug(`hello${" ".repeat(count)}world`),
                                `hello${"-".repeat(count)}world`);
                        });

                    test(
                        "Checking whether punctations are removed…",
                        () =>
                        {
                            strictEqual(
                                slugifier.CreateSlug(
                                    "hello " +
                                    "[]!'#$%&()*+,./:;<=>?@\\^{|}~`。，、；：？！…—·¨‘’“”～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝" +
                                    "world"),
                                "hello-world");
                        });

                    test(
                        "Checking whether unicode-characters aren't stripped away…",
                        () =>
                        {
                            strictEqual(slugifier.CreateSlug("你好, world!'"), "你好-world");
                            strictEqual(slugifier.CreateSlug("Krøv"), "krøv");
                        });
                });

            suite(
                nameof<Slugifier>((slugifier) => slugifier.Reset),
                () =>
                {
                    test(
                        "Checking whether the counter of the slugs can be reset correctly…",
                        () =>
                        {
                            slugifier.CreateSlug(slug);
                            notStrictEqual(slugifier.CreateSlug(slug), kebabCase(slug));
                            slugifier.Reset();
                            strictEqual(slugifier.CreateSlug(slug), kebabCase(slug));
                        });
                });
        });
}
