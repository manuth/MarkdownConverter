import { rejects } from "assert";
import { NoWorkspaceFolderException } from "../../../../System/NoWorkspaceFolderException";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link ConvertAllTask `ConvertAllTask`} class.
 */
export function ConvertAllTaskTests(): void
{
    suite(
        nameof(ConvertAllTask),
        () =>
        {
            let task: ConvertAllTask;

            suiteSetup(
                () =>
                {
                    task = new ConvertAllTask(TestConstants.Extension);
                });

            suite(
                nameof<ConvertAllTask>((task) => task.Execute),
                () =>
                {
                    test(
                        "Checking whether an exception occurs if no workspace-folder is opened…",
                        async () =>
                        {
                            await rejects(() => task.Execute(), NoWorkspaceFolderException);
                        });
                });
        });
}
