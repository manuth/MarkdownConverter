import minimist from "minimist";
import Mocha from "mocha";
import { resolve } from "upath";

/**
 * Runs the extension-tests.
 */
export async function run(): Promise<void>
{
    const { ConfigStore } = await import("./ConfigStore.js");
    const { SuiteSet } = await import("./SuiteSet.js");
    const { SuiteVarName } = await import("./SuiteVarName.js");

    const suiteArgName = "suite";

    /**
     * The arguments passed by the user.
     */
    let args = minimist(
        process.argv.slice(2),
        {
            string: [
                suiteArgName
            ],
            alias: {
                [suiteArgName]: "s"
            },
            default: {
                [suiteArgName]: process.env[SuiteVarName] ?? SuiteSet.Common
            }
        });

    let mocha = new Mocha(
        {
            ui: "tdd",
            color: true,
            bail: true
        });

    return new Promise(
        async (solve, reject) =>
        {
            let testDirectory = ConfigStore.TestRootPath;
            mocha.addFile(resolve(testDirectory, `${args[suiteArgName]}.test.js`));
            await mocha.loadFilesAsync();

            try
            {
                mocha.run(
                    (failures) =>
                    {
                        if (failures > 0)
                        {
                            reject(new Error(`${failures} test${failures > 1 ? "s" : ""} failed.`));
                        }
                        else
                        {
                            solve();
                        }
                    });
            }
            catch (exception)
            {
                console.error(exception);
                reject(exception);
            }
        });
}
