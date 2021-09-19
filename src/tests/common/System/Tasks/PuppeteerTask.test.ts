import { doesNotReject, rejects } from "assert";
import { pathExists, rename } from "fs-extra";
import pkgUp = require("pkg-up");
import puppeteer = require("puppeteer-core");
import { createSandbox, SinonSandbox } from "sinon";
import { basename, dirname, join, resolve } from "upath";
import { ISettings } from "../../../../Properties/ISettings";
import { ChromiumNotFoundException } from "../../../../System/Tasks/ChromiumNotFoundException";
import { PuppeteerTask } from "../../../../System/Tasks/PuppeteerTask";
import { ITestContext } from "../../../ITestContext";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link PuppeteerTask `PuppeteerTask`} class.
 *
 * @param context
 * The test-context.
 */
export function PuppeteerTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(PuppeteerTask),
        () =>
        {
            let sandbox: SinonSandbox;
            let task: PuppeteerTaskTest;
            let puppeteerPath: string;
            let moved = false;
            let tempPuppeteerPath: string;

            /**
             * Provides an implementation of the {@link PuppeteerTask `PuppeteerTask`} for testing.
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
                    task = new PuppeteerTaskTest(TestConstants.Extension);
                    let puppeteerProjectRoot = dirname(pkgUp.sync({ cwd: (puppeteer as unknown as puppeteer.PuppeteerNode).executablePath() }));
                    puppeteerPath = resolve(puppeteerProjectRoot, ".local-chromium");
                    tempPuppeteerPath = join(dirname(puppeteerPath), basename(puppeteerPath) + "_");

                    if (await pathExists((puppeteer as unknown as puppeteer.PuppeteerNode).executablePath()))
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

            setup(
                () =>
                {
                    sandbox = createSandbox();
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameof<PuppeteerTaskTest>((task) => task.Execute),
                () =>
                {
                    test(
                        "Checking whether executing the task without puppeteer installed throws an exception…",
                        async () =>
                        {
                            await rejects(() => task.Execute(), ChromiumNotFoundException);
                        });

                    test(
                        "Checking whether no exception is thrown if puppeteer's local chromium has been installed…",
                        async () =>
                        {
                            sandbox.replace(puppeteer as unknown as puppeteer.PuppeteerNode, "executablePath", () => tempPuppeteerPath);
                            await doesNotReject(() => task.Execute());
                        });

                    test(
                        `Checking whether specifying an inexistent \`${nameof<ISettings>((s) => s.ChromiumExecutablePath)}\` throws an exception…`,
                        async () =>
                        {
                            context.Settings.ChromiumExecutablePath = "hello world";

                            await rejects(
                                () => new PuppeteerTaskTest(TestConstants.Extension).Execute(),
                                ChromiumNotFoundException);
                        });

                    test(
                        `Checking whether specifying an existent \`${nameof<ISettings>((s) => s.ChromiumExecutablePath)}\` doesn't throw an exception…`,
                        async () =>
                        {
                            context.Settings.ChromiumExecutablePath = tempPuppeteerPath;
                            await doesNotReject(() => task.Execute());
                        });
                });
        });
}
