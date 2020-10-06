import { strictEqual } from "assert";
import { extension } from "../../../../extension";
import { ConfigRestorer } from "../../../ConfigRestorer";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

suite(
    "ConvertAllTask",
    () =>
    {
        let task: TestConvertAllTask;
        let configRestorer: ConfigRestorer;

        suiteSetup(
            () =>
            {
                task = new TestConvertAllTask(extension);

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
                strictEqual((await task.GetDocuments()).length, 4);
            });
    });
