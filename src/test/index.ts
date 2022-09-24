import minimist = require("minimist");
import Mocha = require("mocha");
import { resolve } from "upath";
import { ConfigStore } from "./ConfigStore";
import { SuiteSet } from "./SuiteSet";
import { SuiteVarName } from "./SuiteVarName";

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

/**
 * Runs the extension-tests.
 */
export async function run(): Promise<void>
{
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
