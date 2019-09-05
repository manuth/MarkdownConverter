import Assert = require("assert");
import FileSystem = require("fs-extra");
import Path = require("path");
import Puppeteer = require("puppeteer-core");
import { TempDirectory } from "temp-filesystem";
import { extension } from "../../../extension";
import { PuppeteerTask } from "../../../System/Tasks/PuppeteerTask";

suite(
    "PuppeteerTask",
    () =>
    {
        let puppeteerPath: string;
        let moved = false;
        let tempDirectory: TempDirectory;

        /**
         * Provides an implementation of the `PuppeteerTask` for testing.
         */
        class PuppeteerTaskTest extends PuppeteerTask
        {
            /**
             * @inheritdoc
             */
            public get Title()
            {
                return "Test";
            }

            /**
             * @inheritdoc
             */
            protected async ExecuteTask()
            { }
        }

        suiteSetup(
            async () =>
            {
                puppeteerPath = Path.join(__dirname, "..", "..", "..", "..", "..", "node_modules", "puppeteer-core", ".local-chromium");
                tempDirectory = new TempDirectory();

                if (await FileSystem.pathExists(Puppeteer.executablePath()))
                {
                    await FileSystem.remove(tempDirectory.FullName);
                    await FileSystem.move(puppeteerPath, tempDirectory.FullName);
                    moved = true;
                }
            });

        suiteTeardown(
            async () =>
            {
                if (moved)
                {
                    await FileSystem.move(tempDirectory.FullName, puppeteerPath);
                }

                tempDirectory.Dispose();
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