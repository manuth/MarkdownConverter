import { rejects } from "assert";
import { extension } from "../../../../extension";
import { NoWorkspaceFolderException } from "../../../../System/NoWorkspaceFolderException";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";

/**
 * Registers tests for the `ConvertAllTask` class.
 */
export function ConvertAllTaskTests(): void
{
    suite(
        "ConvertAllTask",
        () =>
        {
            let task: ConvertAllTask;

            suiteSetup(
                () =>
                {
                    task = new ConvertAllTask(extension);
                });

            suite(
                "Execute",
                () =>
                {
                    test(
                        "Checking whether an exception occurrs if no workspace-folder is opened…",
                        async () =>
                        {
                            await rejects(() => task.Execute(), NoWorkspaceFolderException);
                        });
                });
        });
}
