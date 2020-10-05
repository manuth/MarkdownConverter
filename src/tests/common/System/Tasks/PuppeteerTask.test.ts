import Assert = require("assert");
import { dirname } from "path";
import Path = require("path");
import FileSystem = require("fs-extra");
import pkgUp = require("pkg-up");
import Puppeteer = require("puppeteer-core");
import { extension } from "../../../../extension";
import { PuppeteerTask } from "../../../../System/Tasks/PuppeteerTask";

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
                let puppeteerProjectRoot = dirname(pkgUp.sync({ cwd: Puppeteer.executablePath() }));
                puppeteerPath = Path.resolve(puppeteerProjectRoot, ".local-chromium");
                tempPuppeteerPath = Path.join(Path.dirname(puppeteerPath), Path.basename(puppeteerPath) + "_");

                if (await FileSystem.pathExists(Puppeteer.executablePath()))
                {
                    await FileSystem.rename(puppeteerPath, tempPuppeteerPath);
                    moved = true;
                }
            });

        suiteTeardown(
            async () =>
            {
                if (moved)
                {
                    await FileSystem.rename(tempPuppeteerPath, puppeteerPath);
                }
            });

        suite(
            "Execute(Progress<IProgressState> progressReporter?, CancellationToken cancellationToken?, Progress<IConvertedFile> fileReporter?)",
            () =>
            {
                test(
                    "Checking whether executing the task without puppeteer installed throws an exception…",
                    async () =>
                    {
                        await Assert.rejects(new PuppeteerTaskTest(extension).Execute());
                    });
            });
    });
