import Assert = require("assert");
import { extension } from "../../../../extension";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";
import { ConfigRestorer } from "../../../ConfigRestorer";

suite(
    "ConvertAllTask",
    () =>
    {
        let task: ConvertAllTask;
        let configRestorer: ConfigRestorer;

        suiteSetup(
            () =>
            {
                task = new ConvertAllTask(extension);
                configRestorer = new ConfigRestorer(
                    [
                        "files.exclude"
                    ]);
            });

        suiteTeardown(
            async () =>
            {
                await configRestorer.Restore();
            });

        setup(
            async () =>
            {
                await configRestorer.Clear();
            });

        test(
            "Checking whether all documents in the workspace are found…",
            async function()
            {
                this.slow(3.75 * 1000);
                this.timeout(15 * 1000);
                Assert.strictEqual((await task["GetDocuments"]()).length, 4);
            });
    });
