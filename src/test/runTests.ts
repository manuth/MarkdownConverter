import { resolve } from "path";
import { runTests } from "vscode-test";
import { TestOptions } from "vscode-test/out/runTest";

(async function main()
{
    let environmentPath = resolve(__dirname, "..", "..", "src", "test");

    let commonArgs: TestOptions = {
        extensionDevelopmentPath: resolve(__dirname, "..", ".."),
        extensionTestsPath: resolve(__dirname, "..", "..", "lib", "test")
    };

    try
    {
        await runTests(
            {
                ...commonArgs,
                extensionTestsEnv: {
                    TEST_SUITE: "common"
                }
            });

        await runTests(
            {
                ...commonArgs,
                extensionTestsEnv: {
                    TEST_SUITE: "single-file"
                },
                launchArgs: [
                    resolve(environmentPath, "single-file", "Test.md")
                ]
            });

        await runTests(
            {
                ...commonArgs,
                extensionTestsEnv: {
                    TEST_SUITE: "single-folder"
                },
                launchArgs: [
                    resolve(environmentPath, "single-folder")
                ]
            });

        await runTests(
            {
                ...commonArgs,
                extensionTestsEnv: {
                    TEST_SUITE: "workspace"
                },
                launchArgs: [
                    resolve(environmentPath, "workspace", "workspace.code-workspace")
                ]
            });
    }
    catch (exception)
    {
        console.error(exception);
        console.error("Failed to run tests");
        process.exit(1);
    }
})();
