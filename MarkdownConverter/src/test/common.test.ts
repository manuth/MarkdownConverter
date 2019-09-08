import FileSystem = require("fs-extra");
import Puppeteer = require("puppeteer-core");
import { extension } from "../extension";

suite(
    "Common Tests",
    () =>
    {
        suiteSetup(
            async function()
            {
                this.enableTimeouts(false);

                if (!await FileSystem.pathExists(Puppeteer.executablePath()))
                {
                    await Puppeteer.createBrowserFetcher().download(extension.ChromiumRevision);
                }
            });

        require("../tests/common/main.test");
    });