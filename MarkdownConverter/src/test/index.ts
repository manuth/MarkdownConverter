import FileSystem = require("fs-extra");
import Glob = require("glob");
import minimist = require("minimist");
import Mocha = require("mocha");
import Path = require("path");
import Puppeteer = require("puppeteer-core");
import { promisify } from "util";
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
export async function run()
{
    let mocha = new Mocha(
        {
            ui: "tdd"
        });

    mocha.useColors(true);

    return new Promise(
        async (resolve, reject) =>
        {
            let testDirectory = Path.resolve(__dirname, "..", "..", "lib", "test");
            let files = await promisify(Glob)(`**/${args["suite"]}.test.js`, { cwd: testDirectory });

            for (let file of files)
            {
                mocha.addFile(Path.resolve(testDirectory, file));
            }

            try
            {
                if (!await FileSystem.pathExists(Puppeteer.executablePath()))
                {
                    await Puppeteer.createBrowserFetcher().download(extension.ChromiumRevision);
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
                            resolve();
                        }
                    });
            }
            catch (exception)
            {
                reject(exception);
            }
        });
}