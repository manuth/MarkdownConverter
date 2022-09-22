import { pathExists } from "fs-extra";
import minimist = require("minimist");
import Mocha = require("mocha");
import { resolve } from "upath";
import { extensions } from "vscode";
import { Constants } from "../Constants";
import { Extension } from "../System/Extensibility/Extension";
import { TestConstants } from "../tests/TestConstants";
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
            [suiteArgName]: process.env[SuiteVarName] ?? "common"
        }
    });

/**
 * Runs the extension-tests.
 */
export async function run(): Promise<void>
{
    let puppeteer = Constants.Puppeteer;
    await extensions.getExtension(new Extension(TestConstants.PackageMetadata).FullName).activate();

    let mocha = new Mocha(
        {
            ui: "tdd",
            color: true,
            bail: true
        });

    return new Promise(
        async (solve, reject) =>
        {
            let testDirectory = resolve(__dirname, "..", "..", "lib", "test");
            mocha.addFile(resolve(testDirectory, `${args[suiteArgName]}.test.js`));

            try
            {
                if (!await pathExists(puppeteer.executablePath()))
                {
                    await puppeteer.createBrowserFetcher({}).download(TestConstants.Extension.ChromiumRevision);
                }

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
            }
            catch (exception)
            {
                reject(exception);
            }
        });
}
