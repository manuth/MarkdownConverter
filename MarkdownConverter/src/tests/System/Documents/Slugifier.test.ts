import Assert = require("assert");
import { Slugifier } from "../../../System/Documents/Slugifier";

suite(
    "Slugifier",
    () =>
    {
        let slugifier: Slugifier;
        let slug: string;
        let expected: string;

        suiteSetup(
            () =>
            {
                slug = "This Is a Test";
                expected = "this-is-a-test";
            });

        suite(
            "constructor()",
            () =>
            {
                test(
                    "Checking whether a slugifier can be initialized…",
                    () =>
                    {
                        Assert.doesNotThrow(
                            () =>
                            {
                                slugifier = new Slugifier();
                            });
                    });
            });

        suite(
            "CreateSlug(string text)",
            () =>
            {
                test(
                    "Checking whether slugs are created correctly…",
                    () =>
                    {
                        Assert.strictEqual(slugifier.CreateSlug(slug), expected);
                    });

                test(
                    "Checking whether numbers are appended to duplicate slugs…",
                    () =>
                    {
                        Assert.strictEqual(slugifier.CreateSlug(slug), `${expected}-2`);
                    });
            });

        suite(
            "Reset()",
            () =>
            {
                test(
                    "Checking whether the counter of the slugs can be reset correctly…",
                    () =>
                    {
                        slugifier.Reset();
                        Assert.strictEqual(slugifier.CreateSlug(slug), expected);
                    });
            });
    });