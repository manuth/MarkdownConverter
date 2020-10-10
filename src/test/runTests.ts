import { join } from "path";
import { pathExists, remove } from "fs-extra";
import { resolve } from "upath";
import { runTests } from "vscode-test";
import { TestOptions } from "vscode-test/out/runTest";

(async function main()
{
    let environmentPath = resolve(__dirname, "..", "..", "src", "test");
    let commonArgs = process.argv.slice(2);
    let singleFolderPath = resolve(environmentPath, "single-folder");
    let tempSettingsPath = join(singleFolderPath, ".vscode");

    let commonOptions: TestOptions = {
        extensionDevelopmentPath: resolve(__dirname, "..", ".."),
        extensionTestsPath: resolve(__dirname, "..", "..", "lib", "test")
    };

    if (await pathExists(tempSettingsPath))
    {
        await remove(tempSettingsPath);
    }

    try
    {
        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "essentials"
                },
                launchArgs: [
                    singleFolderPath,
                    ...commonArgs
                ]
            });

        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "common"
                },
                launchArgs: [
                    singleFolderPath,
                    ...commonArgs
                ]
            });

        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "single-file"
                },
                launchArgs: [
                    resolve(environmentPath, "single-file", "Test.md"),
                    ...commonArgs
                ]
            });

        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "single-folder"
                },
                launchArgs: [
                    singleFolderPath,
                    ...commonArgs
                ]
            });

        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "workspace"
                },
                launchArgs: [
                    resolve(environmentPath, "workspace", "workspace.code-workspace"),
                    ...commonArgs
                ]
            });
    }
    catch (exception)
    {
        console.error(exception);
        console.error("Failed to run tests");
        process.exit(1);
    }
    finally
    {
        if (await pathExists(tempSettingsPath))
        {
            await remove(tempSettingsPath);
        }
    }
})();
