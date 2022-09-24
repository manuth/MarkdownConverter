import { doesNotReject, rejects } from "assert";
import findUp = require("find-up");
import { ensureDir, pathExists, remove, rename } from "fs-extra";
import { createSandbox, SinonSandbox } from "sinon";
import { dirname, join, resolve } from "upath";
import { Constants } from "../../../../Constants";
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
                    let chromiumDir = ".local-chromium";
                    let puppeteerProjectRoot: string;
                    task = new PuppeteerTaskTest(TestConstants.Extension);
                    await ensureDir(dirname(Constants.Puppeteer.executablePath()));

                    puppeteerProjectRoot = findUp.sync(
                        chromiumDir,
                        {
                            cwd: dirname(Constants.Puppeteer.executablePath()),
                            type: "directory"
                        });

                    puppeteerPath = resolve(puppeteerProjectRoot);
                    tempPuppeteerPath = join(dirname(puppeteerPath), chromiumDir + "_");

                    if (await pathExists(Constants.Puppeteer.executablePath()))
                    {
                        await rename(puppeteerPath, tempPuppeteerPath);
                        moved = true;
                    }
                    else
                    {
                        await remove(puppeteerPath);
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
                            sandbox.replace(Constants.Puppeteer, "executablePath", () => tempPuppeteerPath);
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
