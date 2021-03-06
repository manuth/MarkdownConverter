import { strictEqual } from "assert";
import { extension } from "../../../..";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

/**
 * Registers tests for the `ConvertAllTask` class.
 */
export function ConvertAllTaskTests(): void
{
    suite(
        "ConvertAllTask",
        () =>
        {
            let task: TestConvertAllTask;

            suiteSetup(
                () =>
                {
                    task = new TestConvertAllTask(extension);
                });

            suite(
                "GetDocuments",
                () =>
                {
                    test(
                        "Checking whether all documents in the workspace are found…",
                        async function()
                        {
                            this.slow(15 * 1000);
                            this.timeout(30 * 1000);
                            strictEqual((await task.GetDocuments()).length, 4);
                        });
                });
        });
}
