import Assert = require("assert");
import { extension } from "../../../../extension";
import { NoWorkspaceFolderException } from "../../../../System/NoWorkspaceFolderException";
import { ConvertAllTask } from "../../../../System/Tasks/ConvertAllTask";

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
            "Execute(Progress<IProgressState> progressReporter?, CancellationToken cancellationToken?, Progress<IConverterFile> fileReporter?)",
            () =>
            {
                test(
                    "Checking whether an exception occurrs if no workspace-folder is opened…",
                    () =>
                    {
                        Assert.rejects(task.Execute, NoWorkspaceFolderException);
                    });
            });
    });