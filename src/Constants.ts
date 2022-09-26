import { fileURLToPath } from "url";
import puppeteer, { PuppeteerNode } from "puppeteer-core";
import path from "upath";

const { join } = path;

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
            this.packageDirectory = join(fileURLToPath(new URL(".", new URL(import.meta.url))), "..");
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
                    projectRoot: this.PackageDirectory
                });
        }

        return this.puppeteer;
    }
}
