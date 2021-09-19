import { notStrictEqual, strictEqual } from "assert";
import kebabCase = require("lodash.kebabcase");
import { Random } from "random-js";
import { Slugifier } from "../../../../System/Documents/Slugifier";

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
                                strictEqual(slugifier.CreateSlug(slug), kebabCase(`${slug}${i + 2}`));
                            }
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
