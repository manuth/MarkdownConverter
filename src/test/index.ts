import { resolve } from "path";
import { promisify } from "util";
import { pathExists } from "fs-extra";
import { glob } from "glob";
import minimist = require("minimist");
import Mocha = require("mocha");
import { createBrowserFetcher, executablePath } from "puppeteer-core";
import { extension } from "../extension";

/**
 * The arguments passed by the user.
 */
let args = minimist(
    process.argv.slice(2),
    {
        string: [
            "suite"
        ],
        alias: {
            suite: "s"
        },
        default: {
            suite: process.env["TEST_SUITE"] || "common"
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
            let testDirectory = resolve(__dirname, "..", "..", "lib", "test");
            let files = await promisify(glob)(`**/${args["suite"]}.test.js`, { cwd: testDirectory });

            for (let file of files)
            {
                mocha.addFile(resolve(testDirectory, file));
            }

            try
            {
                if (!await pathExists(executablePath()))
                {
                    await createBrowserFetcher().download(extension.ChromiumRevision);
                }

                mocha.run(
                    (failures) =>
                    {
                        if (failures > 0)
                        {
                            reject(new Error(`${failures} ${failures > 1 ? "tests" : "test"} failed.`));
                        }
                        else
                        {
                            solve();
                        }
                    });
            }
            catch (exception)
            {
                reject(exception);
            }
        });
}
