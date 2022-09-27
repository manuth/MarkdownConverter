import { runTests } from "@vscode/test-electron";
import { createSandbox } from "sinon";
import { ConfigStore } from "./ConfigStore.js";
import { SuiteSet } from "./SuiteSet.js";

(async function main()
{
    let forceExit = false;
    let sandbox = createSandbox();
    let errorMessageCount = 0;
    let commonArgs = process.argv.slice(2);

    for (
        let key of [
            "stdout",
            "stderr"
        ] as Array<keyof NodeJS.Process>)
    {
        let originalStream: NodeJS.WriteStream = process[key] as any;
        let expectation = sandbox.mock(originalStream).expects("write");
        expectation.atLeast(0);

        expectation.callsFake(
            (...args) =>
            {
                const [message] = args;
                let method = expectation.wrappedMethod;
                method = method.bind(originalStream);

                if (!/^\[\d*:\d*\/\d*\.\d*:ERROR:.*\(\d*\)\]/.test(message))
                {
                    method(...args);
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
        forceExit = true;
    }
    finally
    {
        sandbox.restore();
        console.log(`Filtered ${errorMessageCount} unnecessary error-message${errorMessageCount === 1 ? "" : "s"}`);

        if (forceExit)
        {
            process.exit(1);
        }
    }
})();
