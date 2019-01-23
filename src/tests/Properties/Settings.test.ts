import { TempDirectory } from "temp-filesystem";
import { Uri, workspace } from "vscode";

suite(
    "Settings",
    () =>
    {
        let tempDir: TempDirectory;

        suiteSetup(
            async () =>
            {
                tempDir = new TempDirectory();
                await new Promise(
                    (resolve, reject) =>
                    {
                        workspace.onDidChangeWorkspaceFolders(
                            () =>
                            {
                                resolve();
                            });

                        if (
                            !workspace.updateWorkspaceFolders(
                                0,
                                (workspace.workspaceFolders || []).length,
                                { name: "Test", uri: Uri.file(tempDir.FullName) }))
                        {
                            reject();
                        }
                    });
            });

        test(
            "Checking whether the settings are parsed correctly…",
            () =>
            {
                // This test requires vscode to open up a workspace-folder in order to try out different kinds of workspace-settings.
            });
    });