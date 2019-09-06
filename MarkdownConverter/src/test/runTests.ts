import Path = require("path");
import { runTests } from "vscode-test";

(async function main()
{
    try
    {
        await runTests(
            {
                extensionDevelopmentPath: Path.resolve(__dirname, "..", "..", ".."),
                extensionTestsPath: Path.resolve(__dirname, "..", "..", "lib", "test"),
                launchArgs: [
                    "-s",
                    "common"
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