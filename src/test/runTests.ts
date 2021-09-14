import { join } from "path";
import { pathExists, remove } from "fs-extra";
import { createSandbox } from "sinon";
import { resolve } from "upath";
import { runTests } from "vscode-test";
import { TestOptions } from "vscode-test/out/runTest";
import { SuiteVarName } from "./SuiteVarName";

(async function main()
{
    let sandbox = createSandbox();
    let errorMessageCount = 0;
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

    for (
        let key of [
            "log",
            "error"
        ] as Array<keyof Console>)
    {
        let expectation = sandbox.mock(console).expects(key);
        expectation.atLeast(0);

        expectation.callsFake(
            (message: any, ...optionalParams: any[]) =>
            {
                let method = expectation.wrappedMethod;
                method = method.bind(console);

                if (!/^\[\d*:\d*\/\d*\.\d*:ERROR:.*\(\d*\)\]/.test(message))
                {
                    method(message, ...optionalParams);
                }
                else
                {
                    errorMessageCount++;
                }
            });
    }

    try
    {
        /**
         * Creates test-options for the suite with the specified {@link suiteName `suiteName`}.
         *
         * @param suiteName
         * The name of the suite to create options for.
         *
         * @param fileSystemPath
         * The name of the file or directory to open.
         *
         * @returns
         * The test-options for the suite with the specified {@link suiteName `suiteName`}.
         */
        function CreateOptions(suiteName: string, fileSystemPath: string): TestOptions
        {
            return {
                ...commonOptions,
                extensionTestsEnv: {
                    [SuiteVarName]: suiteName
                },
                launchArgs: [
                    fileSystemPath,
                    ...commonArgs
                ]
            };
        }

        let optionCollection = [
            CreateOptions("essentials", singleFolderPath),
            CreateOptions("common", singleFolderPath),
            CreateOptions("single-file", resolve(environmentPath, "single-file", "Test.md")),
            CreateOptions("single-folder", singleFolderPath),
            CreateOptions("workspace", resolve(environmentPath, "workspace", "workspace.code-workspace"))
        ];

        for (let options of optionCollection)
        {
            await runTests(options);
        }
    }
    catch (exception)
    {
        console.error(exception);
        console.error("Failed to run tests");
        process.exit(1);
    }
    finally
    {
        sandbox.restore();

        if (await pathExists(tempSettingsPath))
        {
            await remove(tempSettingsPath);
        }

        console.log(`Filtered ${errorMessageCount} unnecessary error-message${errorMessageCount === 1 ? "" : "s"}`);
    }
})();
