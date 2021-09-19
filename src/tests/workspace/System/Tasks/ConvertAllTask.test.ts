import { strictEqual } from "assert";
import { extension } from "../../../..";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";
import { TestConvertAllTask } from "../../../TestConvertAllTask";

/**
 * Registers tests for the {@link ConvertAllTask `ConvertAllTask`} class.
 */
export function ConvertAllTaskTests(): void
{
    suite(
        nameof(ConvertAllTask),
        () =>
        {
            let task: TestConvertAllTask;

            suiteSetup(
                () =>
                {
                    task = new TestConvertAllTask(extension);
                });

            suite(
                nameof<TestConvertAllTask>((task) => task.GetDocuments),
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
