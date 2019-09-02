import Glob = require("glob");
import Mocha = require("mocha");
import Path = require("path");
import { promisify } from "util";

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
            let files = await promisify(Glob)("**/*.test.js", { cwd: testDirectory });

            for (let file of files)
            {
                mocha.addFile(Path.resolve(testDirectory, file));
            }

            try
            {
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