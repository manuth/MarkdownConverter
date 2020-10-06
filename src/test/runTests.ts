import { resolve } from "upath";
import { runTests } from "vscode-test";
import { TestOptions } from "vscode-test/out/runTest";

(async function main()
{
    let environmentPath = resolve(__dirname, "..", "..", "src", "test");
    let commonArgs = process.argv.slice(2);

    let commonOptions: TestOptions = {
        extensionDevelopmentPath: resolve(__dirname, "..", ".."),
        extensionTestsPath: resolve(__dirname, "..", "..", "lib", "test")
    };

    try
    {
        await runTests(
            {
                ...commonOptions,
                extensionTestsEnv: {
                    TEST_SUITE: "common"
                },
                launchArgs: [
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
                    resolve(environmentPath, "single-folder"),
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
})();
