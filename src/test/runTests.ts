import { runTests } from "@vscode/test-electron";
import { createSandbox } from "sinon";
import { ConfigStore } from "./ConfigStore";
import { SuiteSet } from "./SuiteSet";

(async function main()
{
    let sandbox = createSandbox();
    let errorMessageCount = 0;
    let commonArgs = process.argv.slice(2);

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
        let optionCollection = Object.values(SuiteSet).map(
            (suiteSet) =>
            {
                let result = ConfigStore.Get(suiteSet);
                result.launchArgs.push(...commonArgs);
                return result;
            });

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
        console.log(`Filtered ${errorMessageCount} unnecessary error-message${errorMessageCount === 1 ? "" : "s"}`);
    }
})();
