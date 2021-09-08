import { rejects } from "assert";
import { pathExists, rename } from "fs-extra";
import pkgUp = require("pkg-up");
import puppeteer = require("puppeteer-core");
import { basename, dirname, join, resolve } from "upath";
import { PuppeteerTask } from "../../../../System/Tasks/PuppeteerTask";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the `PuppeteerTask` class.
 */
export function PuppeteerTaskTests(): void
{
    suite(
        "PuppeteerTask",
        () =>
        {
            let puppeteerPath: string;
            let moved = false;
            let tempPuppeteerPath: string;

            /**
             * Provides an implementation of the `PuppeteerTask` for testing.
             */
            class PuppeteerTaskTest extends PuppeteerTask
            {
                /**
                 * @inheritdoc
                 */
                public get Title(): string
                {
                    return "Test";
                }

                /**
                 * @inheritdoc
                 */
                protected async ExecuteTask(): Promise<void>
                { }
            }

            suiteSetup(
                async () =>
                {
                    let puppeteerProjectRoot = dirname(pkgUp.sync({ cwd: puppeteer.executablePath() }));
                    puppeteerPath = resolve(puppeteerProjectRoot, ".local-chromium");
                    tempPuppeteerPath = join(dirname(puppeteerPath), basename(puppeteerPath) + "_");

                    if (await pathExists(puppeteer.executablePath()))
                    {
                        await rename(puppeteerPath, tempPuppeteerPath);
                        moved = true;
                    }
                });

            suiteTeardown(
                async () =>
                {
                    if (moved)
                    {
                        await rename(tempPuppeteerPath, puppeteerPath);
                    }
                });

            suite(
                "Execute",
                () =>
                {
                    test(
                        "Checking whether executing the task without puppeteer installed throws an exception…",
                        async () =>
                        {
                            await rejects(() => new PuppeteerTaskTest(TestConstants.Extension).Execute());
                        });
                });
        });
}
