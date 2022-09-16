import { dependencyPath } from "dependency-package-path";
import pkgUp = require("pkg-up");
import puppeteer, { PuppeteerNode } from "puppeteer-core";
import { dirname } from "upath";

/**
 * Provides constants for the extension.
 */
export class Constants
{
    /**
     * The path to the root of this package.
     */
    private static packageDirectory: string = null;

    /**
     * A puppeteer instance.
     */
    private static puppeteer: PuppeteerNode = null;

    /**
     * Gets the path to the root of this package.
     */
    public static get PackageDirectory(): string
    {
        if (this.packageDirectory === null)
        {
            this.packageDirectory = dirname(pkgUp.sync({ cwd: __dirname }));
        }

        return this.packageDirectory;
    }

    /**
     * Gets a puppeteer instance.
     */
    public static get Puppeteer(): PuppeteerNode
    {
        if (this.puppeteer === null)
        {
            let puppeteerConstructor: any = puppeteer.constructor;

            this.puppeteer = new puppeteerConstructor(
                {
                    projectRoot: dependencyPath("puppeteer-core", __dirname)
                });
        }

        return this.puppeteer;
    }
}
