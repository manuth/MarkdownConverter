import { pathExists } from "fs-extra";
import minimist = require("minimist");
import Mocha = require("mocha");
import { createBrowserFetcher, executablePath } from "puppeteer-core";
import { resolve } from "upath";
import { extensions } from "vscode";
import { Extension } from "../System/Extensibility/Extension";
import { TestConstants } from "../tests/TestConstants";

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
            mocha.addFile(resolve(testDirectory, `${args["suite"]}.test.js`));

            try
            {
                if (!await pathExists(executablePath()))
                {
                    await createBrowserFetcher().download(TestConstants.Extension.ChromiumRevision);
                }

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
                reject(exception);
            }
        });
}
